const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'campusiq_store.json');
const SCRATCH_PATH = 'C:/Users/rashi/.gemini/antigravity-ide/brain/7389074f-3bca-4a55-9394-9a5aee8bd06a/scratch/faculty_with_local_photos.json';

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/^(prof\.|dr\.|mr\.|mrs\.|ms\.)\s*/gi, '')
    .replace(/\(dr\.\)/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function extractTitle(name) {
  if (/^dr\./i.test(name) || /prof\.\s*\(dr\.\)/i.test(name) || /prof\.dr\./i.test(name)) return 'Dr.';
  if (/^prof\./i.test(name)) return 'Prof.';
  if (/^mr\./i.test(name)) return 'Mr.';
  if (/^mrs\./i.test(name) || /^ms\./i.test(name)) return 'Ms.';
  return 'Prof.';
}

function deriveQualification(title, designation) {
  if (title === 'Dr.' || /ph\.?d/i.test(designation)) return 'Ph.D, M.Tech';
  if (/associate professor|professor/i.test(designation)) return 'M.Tech, Ph.D (Pursuing)';
  return 'M.Tech / M.E';
}

function seedOfficialFaculty() {
  console.log('🚀 Seeding Official Verified RVS Faculty from rvscollege.ac.in...');

  if (!fs.existsSync(SCRATCH_PATH)) {
    console.error('Scratch data file not found:', SCRATCH_PATH);
    return;
  }

  const facultyData = JSON.parse(fs.readFileSync(SCRATCH_PATH, 'utf-8'));
  console.log(`Loaded ${facultyData.length} unique faculty members from scraped dataset.`);

  // FILTER RULE: Only import faculty members with verified official photos
  const verifiedFacultyData = facultyData.filter(f => f.photoUrl && f.localPhoto && !f.localPhoto.includes('placeholder'));
  const skippedFacultyData = facultyData.filter(f => !f.photoUrl || !f.localPhoto || f.localPhoto.includes('placeholder'));

  console.log(`Verified with official photos: ${verifiedFacultyData.length}`);
  console.log(`Skipped due to missing photos: ${skippedFacultyData.length}`);

  let store = {};
  if (fs.existsSync(STORE_PATH)) {
    try {
      store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    } catch (e) {
      console.warn('Could not read existing store:', e.message);
    }
  }

  store.users = store.users || [];
  store.faculty_profile = store.faculty_profile || [];
  store.verified_faculty = store.verified_faculty || [];

  // Remove any previously created records for skipped faculty without photos
  const skippedKeys = new Set(skippedFacultyData.map(f => normalizeName(f.name)));
  const userIdsToRemove = store.users
    .filter(u => u.role === 'faculty' && skippedKeys.has(normalizeName(u.name)))
    .map(u => u.id);

  if (userIdsToRemove.length > 0) {
    console.log(`Cleaning up ${userIdsToRemove.length} faculty accounts without official photos...`);
    store.users = store.users.filter(u => !userIdsToRemove.includes(u.id));
    store.faculty_profile = store.faculty_profile.filter(p => !userIdsToRemove.includes(p.user_id));
    store.verified_faculty = store.verified_faculty.filter(v => !userIdsToRemove.includes(v.user_id));
  }

  let nextUserId = store.users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
  let nextProfileId = store.faculty_profile.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;

  let insertedCount = 0;
  let updatedCount = 0;

  const defaultPasswordHash = bcrypt.hashSync('Faculty@123', 8);

  verifiedFacultyData.forEach((fac, idx) => {
    const normKey = normalizeName(fac.name);
    const title = extractTitle(fac.name);
    const qualification = deriveQualification(title, fac.designation);

    // Look for existing user primarily by normalized name
    let existingUser = store.users.find(u => {
      if (u.role !== 'faculty') return false;
      if (normalizeName(u.name) === normKey) return true;
      if (fac.email && !fac.email.startsWith('info@') && u.email && u.email.toLowerCase() === fac.email.toLowerCase()) return true;
      return false;
    });

    // Determine clean local photo path
    const photo = fac.localPhoto || '/assets/faculty/placeholder-faculty.svg';

    if (existingUser) {
      // Update existing user without overwriting credentials
      existingUser.name = fac.name;
      existingUser.avatar = photo;
      existingUser.department = fac.departmentName || existingUser.department;
      if (fac.email && !existingUser.email.includes('@rvscollege.ac.in')) {
        existingUser.institutional_email = fac.email;
      }

      // Update or create profile
      let prof = store.faculty_profile.find(p => p.user_id === existingUser.id);
      if (!prof) {
        prof = {
          id: nextProfileId++,
          user_id: existingUser.id,
          employee_id: `RVS-FAC-${fac.departmentCode || 'GEN'}-${String(idx + 1).padStart(3, '0')}`
        };
        store.faculty_profile.push(prof);
      }

      prof.title = title;
      prof.name = fac.name;
      prof.department_code = fac.departmentCode || prof.department_code;
      prof.department_name = fac.departmentName || prof.department_name;
      prof.designation = fac.designation || prof.designation;
      prof.qualification = prof.qualification || qualification;
      prof.specialization = fac.specialization || prof.specialization;
      prof.institutional_email = fac.email || prof.institutional_email || existingUser.email;
      prof.profile_photo = photo;
      prof.public_profile = prof.public_profile !== undefined ? prof.public_profile : true;
      prof.source_url = fac.sourceUrl;
      prof.all_sources = fac.allSources || [fac.sourceUrl];
      prof.all_departments = fac.allDepartments || [fac.departmentName];
      prof.is_official = true;
      prof.last_verified_at = new Date().toISOString();

      updatedCount++;
    } else {
      // Create new faculty user & profile
      const newUserId = nextUserId++;
      const emailUsername = fac.name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
      const userEmail = fac.email || `${emailUsername}@rvscet.ac.in`;

      const newUser = {
        id: newUserId,
        college_id: 1,
        name: fac.name,
        email: userEmail,
        password_hash: defaultPasswordHash,
        role: 'faculty',
        department: fac.departmentName,
        phone: '7033000777',
        avatar: photo,
        status: 'active',
        created_at: new Date().toISOString()
      };

      store.users.push(newUser);

      const newProfile = {
        id: nextProfileId++,
        user_id: newUserId,
        employee_id: `RVS-FAC-${fac.departmentCode || 'GEN'}-${String(idx + 1).padStart(3, '0')}`,
        title,
        name: fac.name,
        department_code: fac.departmentCode || 'GEN',
        department_name: fac.departmentName,
        designation: fac.designation || 'Faculty Member',
        qualification,
        specialization: fac.specialization || '',
        research_area: fac.specialization || '',
        publications: '',
        institutional_email: fac.email || userEmail,
        profile_photo: photo,
        public_profile: true,
        source_url: fac.sourceUrl,
        all_sources: fac.allSources || [fac.sourceUrl],
        all_departments: fac.allDepartments || [fac.departmentName],
        is_official: true,
        workload_hours: /head|hod|dean/i.test(fac.designation) ? 14 : 18,
        last_verified_at: new Date().toISOString()
      };

      store.faculty_profile.push(newProfile);
      insertedCount++;
    }
  });

  // Re-generate verified_faculty array for fast UI querying
  store.verified_faculty = store.faculty_profile
    .filter(p => p.is_official)
    .map(p => {
      const u = store.users.find(user => user.id === p.user_id) || {};
      return {
        id: p.id,
        user_id: p.user_id,
        employee_id: p.employee_id,
        title: p.title,
        name: p.name || u.name,
        designation: p.designation,
        department_code: p.department_code,
        department_name: p.department_name,
        all_departments: p.all_departments || [p.department_name],
        specialization: p.specialization,
        qualification: p.qualification,
        email: p.institutional_email || u.email,
        phone: u.phone || '7033000777',
        photo: p.profile_photo || u.avatar,
        public_profile: p.public_profile !== false,
        source_url: p.source_url,
        all_sources: p.all_sources || [p.source_url],
        workload_hours: p.workload_hours || 16,
        status: u.status || 'active',
        is_official: true,
        last_verified_at: p.last_verified_at
      };
    });

  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  console.log(`✅ Seed Complete: ${insertedCount} new faculty added, ${updatedCount} existing faculty updated.`);
  console.log(`Total verified faculty in store: ${store.verified_faculty.length}`);
}

if (require.main === module) {
  seedOfficialFaculty();
}

module.exports = { seedOfficialFaculty };
