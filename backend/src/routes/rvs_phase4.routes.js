const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// =========================================================================
// 1. LAB & EQUIPMENT MANAGEMENT
// =========================================================================

// GET /api/rvs/labs/equipment - List all lab equipment
router.get('/labs/equipment', authenticateToken, (req, res) => {
  const store = getStore();
  const { department, category, status, condition, search } = req.query;
  let list = store.lab_inventory || [];

  if (department && department !== 'all') {
    list = list.filter(e => e.department_code === department);
  }
  if (category && category !== 'all') {
    list = list.filter(e => (e.category || '').toLowerCase() === category.toLowerCase());
  }
  if (status && status !== 'all') {
    list = list.filter(e => (e.status || '').toUpperCase() === status.toUpperCase());
  }
  if (condition && condition !== 'all') {
    list = list.filter(e => (e.condition || '').toLowerCase() === condition.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e =>
      (e.equipment_name || '').toLowerCase().includes(q) ||
      (e.asset_id || '').toLowerCase().includes(q) ||
      (e.laboratory || '').toLowerCase().includes(q) ||
      (e.assigned_person || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    summary: {
      total: (store.lab_inventory || []).length,
      available: (store.lab_inventory || []).filter(e => e.status === 'AVAILABLE').length,
      in_use: (store.lab_inventory || []).filter(e => e.status === 'IN USE').length,
      under_maintenance: (store.lab_inventory || []).filter(e => e.status === 'UNDER MAINTENANCE').length,
      damaged: (store.lab_inventory || []).filter(e => e.status === 'DAMAGED').length,
      retired: (store.lab_inventory || []).filter(e => e.status === 'RETIRED').length
    },
    equipment: list
  });
});

// POST /api/rvs/labs/equipment - Register new equipment/asset
router.post('/labs/equipment', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const {
    asset_id,
    equipment_name,
    category,
    department_code,
    laboratory,
    location,
    quantity = 1,
    condition = 'Good',
    purchase_date,
    assigned_person,
    status = 'AVAILABLE'
  } = req.body;

  if (!asset_id || !equipment_name) {
    return res.status(400).json({ success: false, message: 'Asset ID and Equipment Name are required.' });
  }

  store.lab_inventory = store.lab_inventory || [];
  if (store.lab_inventory.some(e => e.asset_id === asset_id.trim())) {
    return res.status(409).json({ success: false, message: `Asset ID ${asset_id} is already registered.` });
  }

  const newEquip = {
    id: store.lab_inventory.length > 0 ? Math.max(...store.lab_inventory.map(e => e.id)) + 1 : 1,
    asset_id: asset_id.trim(),
    equipment_name: equipment_name.trim(),
    category: category || 'Lab Equipment',
    department_code: department_code || 'CSE',
    laboratory: laboratory || 'Main Computing Lab',
    location: location || 'Academic Block B',
    quantity: Number(quantity),
    condition,
    purchase_date: purchase_date || new Date().toISOString().split('T')[0],
    assigned_person: assigned_person || req.user.name,
    status: status.toUpperCase(),
    created_at: new Date().toISOString(),
    created_by: req.user.name
  };

  store.lab_inventory.push(newEquip);
  saveStore();

  res.status(201).json({ success: true, message: 'Equipment registered successfully.', equipment: newEquip });
});

// PUT /api/rvs/labs/equipment/:id - Update equipment
router.put('/labs/equipment/:id', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const equipId = Number(req.params.id);
  store.lab_inventory = store.lab_inventory || [];
  const equip = store.lab_inventory.find(e => e.id === equipId);

  if (!equip) {
    return res.status(404).json({ success: false, message: 'Equipment not found.' });
  }

  const { equipment_name, category, department_code, laboratory, location, quantity, condition, assigned_person, status } = req.body;
  if (equipment_name) equip.equipment_name = equipment_name.trim();
  if (category) equip.category = category;
  if (department_code) equip.department_code = department_code;
  if (laboratory) equip.laboratory = laboratory;
  if (location) equip.location = location;
  if (quantity !== undefined) equip.quantity = Number(quantity);
  if (condition) equip.condition = condition;
  if (assigned_person) equip.assigned_person = assigned_person;
  if (status) equip.status = status.toUpperCase();

  equip.updated_at = new Date().toISOString();
  saveStore();

  res.json({ success: true, message: 'Equipment record updated.', equipment: equip });
});

// POST /api/rvs/labs/equipment/:id/issue - Issue equipment
router.post('/labs/equipment/:id/issue', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const equipId = Number(req.params.id);
  store.lab_inventory = store.lab_inventory || [];
  const equip = store.lab_inventory.find(e => e.id === equipId);

  if (!equip) return res.status(404).json({ success: false, message: 'Equipment not found.' });

  const { issued_to_name, roll_no, purpose, due_date } = req.body;
  if (!issued_to_name || !due_date) {
    return res.status(400).json({ success: false, message: 'Recipient name and return due date are required.' });
  }

  equip.status = 'IN USE';
  store.equipment_issues = store.equipment_issues || [];
  const issueRecord = {
    id: store.equipment_issues.length > 0 ? Math.max(...store.equipment_issues.map(i => i.id)) + 1 : 1,
    asset_id: equip.asset_id,
    equipment_name: equip.equipment_name,
    issued_to_name,
    roll_no: roll_no || 'Faculty/Staff',
    purpose: purpose || 'Academic Laboratory Practical Session',
    issue_date: new Date().toISOString().split('T')[0],
    due_date,
    return_date: null,
    status: 'Issued',
    issued_by: req.user.name
  };

  store.equipment_issues.unshift(issueRecord);
  saveStore();

  res.json({ success: true, message: `Equipment ${equip.asset_id} issued to ${issued_to_name}.`, issueRecord });
});

// POST /api/rvs/labs/equipment/:id/return - Return equipment
router.post('/labs/equipment/:id/return', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const equipId = Number(req.params.id);
  store.lab_inventory = store.lab_inventory || [];
  const equip = store.lab_inventory.find(e => e.id === equipId);

  if (!equip) return res.status(404).json({ success: false, message: 'Equipment not found.' });

  const { condition = 'Good', remarks } = req.body;
  equip.status = 'AVAILABLE';
  equip.condition = condition;

  store.equipment_issues = store.equipment_issues || [];
  const activeIssue = store.equipment_issues.find(i => i.asset_id === equip.asset_id && i.status === 'Issued');
  if (activeIssue) {
    activeIssue.status = 'Returned';
    activeIssue.return_date = new Date().toISOString().split('T')[0];
    activeIssue.condition_on_return = condition;
    activeIssue.remarks = remarks || 'Returned in satisfactory condition';
  }

  saveStore();
  res.json({ success: true, message: `Equipment ${equip.asset_id} returned and marked AVAILABLE.`, equipment: equip });
});

// GET /api/rvs/labs/issues - Issue history
router.get('/labs/issues', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, issues: store.equipment_issues || [] });
});

// =========================================================================
// 2. ASSET MAINTENANCE MODULE
// =========================================================================

// GET /api/rvs/assets/maintenance - List all maintenance tickets
router.get('/assets/maintenance', authenticateToken, (req, res) => {
  const store = getStore();
  const { status, search } = req.query;
  let list = store.asset_maintenance || [];

  if (status && status !== 'all') {
    list = list.filter(m => (m.status || '').toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m =>
      (m.asset_id || '').toLowerCase().includes(q) ||
      (m.equipment_name || '').toLowerCase().includes(q) ||
      (m.problem || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    summary: {
      total: (store.asset_maintenance || []).length,
      reported: (store.asset_maintenance || []).filter(m => m.status === 'Reported').length,
      under_repair: (store.asset_maintenance || []).filter(m => m.status === 'Under Repair').length,
      resolved: (store.asset_maintenance || []).filter(m => m.status === 'Resolved').length
    },
    maintenance: list
  });
});

// POST /api/rvs/assets/maintenance/report - Report problem
router.post('/assets/maintenance/report', authenticateToken, (req, res) => {
  const store = getStore();
  const { asset_id, problem, assigned_technician, cost } = req.body;

  if (!asset_id || !problem) {
    return res.status(400).json({ success: false, message: 'Asset ID and problem description are required.' });
  }

  store.lab_inventory = store.lab_inventory || [];
  const equip = store.lab_inventory.find(e => e.asset_id === asset_id.trim());

  if (equip) {
    equip.status = 'UNDER MAINTENANCE';
  }

  store.asset_maintenance = store.asset_maintenance || [];
  const ticket = {
    id: store.asset_maintenance.length > 0 ? Math.max(...store.asset_maintenance.map(m => m.id)) + 1 : 1,
    asset_id: asset_id.trim(),
    equipment_name: equip ? equip.equipment_name : asset_id,
    category: equip ? equip.category : 'General Institutional Asset',
    location: equip ? equip.location : 'Campus',
    problem: problem.trim(),
    reported_date: new Date().toISOString().split('T')[0],
    assigned_technician: assigned_technician || 'Campus Facilities Engineering Team',
    status: 'Reported',
    repair_date: null,
    cost: Number(cost || 0),
    remarks: 'Initial maintenance report filed.',
    created_at: new Date().toISOString(),
    reported_by: req.user.name
  };

  store.asset_maintenance.unshift(ticket);
  saveStore();

  res.status(201).json({ success: true, message: `Maintenance ticket #${ticket.id} filed for ${asset_id}.`, ticket });
});

// POST /api/rvs/assets/maintenance/:id/update - Update ticket
router.post('/assets/maintenance/:id/update', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const ticketId = Number(req.params.id);
  store.asset_maintenance = store.asset_maintenance || [];
  const ticket = store.asset_maintenance.find(m => m.id === ticketId);

  if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance ticket not found.' });

  const { status, assigned_technician, repair_date, cost, remarks } = req.body;
  if (status) ticket.status = status;
  if (assigned_technician) ticket.assigned_technician = assigned_technician;
  if (cost !== undefined) ticket.cost = Number(cost);
  if (remarks) ticket.remarks = remarks;

  if (status === 'Resolved') {
    ticket.repair_date = repair_date || new Date().toISOString().split('T')[0];
    // Automatically restore equipment to AVAILABLE
    store.lab_inventory = store.lab_inventory || [];
    const equip = store.lab_inventory.find(e => e.asset_id === ticket.asset_id);
    if (equip) {
      equip.status = 'AVAILABLE';
      equip.condition = 'Good';
    }
  }

  saveStore();
  res.json({ success: true, message: `Ticket #${ticket.id} updated.`, ticket });
});

// =========================================================================
// 3. FACULTY SUBSTITUTION SYSTEM (Conflict-Aware Temporary Adjustments)
// =========================================================================

// GET /api/rvs/faculty-substitution/history
router.get('/faculty-substitution/history', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, history: store.faculty_substitutions || [] });
});

// POST /api/rvs/faculty-substitution/check - Clash detection
router.post('/faculty-substitution/check', authenticateToken, (req, res) => {
  const store = getStore();
  const { date, substitute_faculty_name, start_time } = req.body;

  if (!date || !substitute_faculty_name) {
    return res.status(400).json({ success: false, message: 'Date and substitute faculty name are required.' });
  }

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Check normal timetables for clashes
  const timetables = store.timetables || [];
  const regularClash = timetables.find(
    t => t.day.toLowerCase() === dayOfWeek.toLowerCase() &&
         t.faculty_name.toLowerCase() === substitute_faculty_name.toLowerCase() &&
         (!start_time || t.start_time === start_time)
  );

  // 2. Check existing substitution assignments on the same date
  const substitutions = store.faculty_substitutions || [];
  const subClash = substitutions.find(
    s => s.date === date &&
         s.substitute_faculty_name.toLowerCase() === substitute_faculty_name.toLowerCase() &&
         s.status !== 'Cancelled'
  );

  if (regularClash) {
    return res.json({
      success: true,
      is_available: false,
      conflict_type: 'Regular Class Timetable Conflict',
      message: `${substitute_faculty_name} already has a scheduled regular class (${regularClash.subject_name} in ${regularClash.room_no}) at ${regularClash.start_time} on ${dayOfWeek}.`
    });
  }

  if (subClash) {
    return res.json({
      success: true,
      is_available: false,
      conflict_type: 'Existing Substitution Conflict',
      message: `${substitute_faculty_name} is already assigned as substitute for ${subClash.subject_name} on ${date}.`
    });
  }

  res.json({
    success: true,
    is_available: true,
    message: `${substitute_faculty_name} has zero timetable clashes and is AVAILABLE.`
  });
});

// POST /api/rvs/faculty-substitution/assign - Assign substitute
router.post('/faculty-substitution/assign', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const {
    date,
    department_code = 'CSE',
    semester = '6th Semester',
    class_period,
    subject_code,
    subject_name,
    original_faculty_name,
    substitute_faculty_name,
    reason
  } = req.body;

  if (!date || !original_faculty_name || !substitute_faculty_name || !subject_code) {
    return res.status(400).json({
      success: false,
      message: 'Date, original faculty, substitute faculty, and subject are required.'
    });
  }

  // Conflict verification
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const regularClash = (store.timetables || []).find(
    t => t.day.toLowerCase() === dayOfWeek.toLowerCase() &&
         t.faculty_name.toLowerCase() === substitute_faculty_name.toLowerCase()
  );

  if (regularClash) {
    return res.status(409).json({
      success: false,
      message: `Clash Detected: ${substitute_faculty_name} is already scheduled for ${regularClash.subject_name} on ${dayOfWeek}s. Please choose an alternate faculty.`
    });
  }

  const users = store.users || [];
  const origFaculty = users.find(u => u.name.toLowerCase() === original_faculty_name.toLowerCase()) || {};
  const subFaculty = users.find(u => u.name.toLowerCase() === substitute_faculty_name.toLowerCase()) || {};

  store.faculty_substitutions = store.faculty_substitutions || [];
  const newSub = {
    id: store.faculty_substitutions.length > 0 ? Math.max(...store.faculty_substitutions.map(s => s.id)) + 1 : 1,
    date,
    department_code,
    semester,
    class_period: class_period || 'Regular Lecture Hour',
    subject_code,
    subject_name: subject_name || subject_code,
    original_faculty_id: origFaculty.id || 6,
    original_faculty_name,
    substitute_faculty_id: subFaculty.id || 12,
    substitute_faculty_name,
    reason: reason || 'Leave / Official institutional assignment',
    status: 'Scheduled',
    notified_students: true,
    created_at: new Date().toISOString(),
    assigned_by: req.user.name
  };

  store.faculty_substitutions.unshift(newSub);
  saveStore();

  res.status(201).json({
    success: true,
    message: `Faculty substitution assigned for ${date}. ${substitute_faculty_name} substituted for ${original_faculty_name}. Base timetable preserved.`,
    substitution: newSub
  });
});

module.exports = router;
