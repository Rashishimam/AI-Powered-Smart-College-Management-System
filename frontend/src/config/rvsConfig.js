/**
 * RVS College of Engineering & Technology — Central Configuration
 * RVS Smart Campus Management System
 * 
 * PRIMARY REFERENCE: Official RVS College Website (https://www.rvscollege.ac.in/)
 * Do not invent public college information.
 */

export const BRANDING = {
  collegeName: 'RVS College of Engineering & Technology',
  shortName: 'RVSCET',
  officialWebsite: 'https://www.rvscollege.ac.in/',
  logo: '/assets/rvs-logo.png'
};

export const RVS_CONFIG = {
  // Official College Identity
  collegeName: BRANDING.collegeName,
  name: BRANDING.collegeName,
  shortName: BRANDING.shortName,
  systemName: 'RVS Smart Campus Management System',
  officialWebsite: BRANDING.officialWebsite,
  website: BRANDING.officialWebsite,
  tagline: 'Building Future Engineers & Technocrats',
  location: 'Jamshedpur, Jharkhand, India',
  address: 'Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012, India',
  phone: '7033000777',
  placementPhone: '9110969068',
  email: 'info@rvscet.com',
  alternateEmail: 'rvscet@gmail.com',
  
  // Official Logo Configuration
  logo: BRANDING.logo,
  logoUrl: BRANDING.logo,
  logoPlaceholderInstruction: 'Authorized logo file path: frontend/public/assets/rvs-logo.png',

  // Official Affiliations & Accreditations (from rvscollege.ac.in)
  established: '1993',
  affiliation: 'Approved by AICTE, New Delhi & Affiliated to Jharkhand University of Technology (JUT), Ranchi / Kolhan University',
  accreditation: 'NAAC Accredited Grade "B"',

  // Official Leadership (Verified from rvscollege.ac.in)
  leadership: {
    chairman: 'Mr. Binda Singh',
    secretary: 'Mr. Bharat Singh',
    treasurer: 'Mr. Shatrughna Singh',
    principal: 'Prof. (Dr.) Rajesh Kumar Tiwari'
  },

  // Official Placement Headline Statistics (Verified from rvscollege.ac.in marketing headline)
  placementHeadlineStats: {
    alumniWorldwide: '5600+',
    studentsPlaced: '3900+',
    activeRecruiters: '350+',
    placementRate: '86%+',
    highestPackage: '12 LPA',
    averagePackage: '4.2 LPA',
    dataSource: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
  },

  // Official Academic Programs & Departments (Configurable)
  departments: [
    { code: 'CSE', name: 'Computer Science & Engineering', icon: 'Laptop', intake: 150, hod: 'Prof. Jeevan Kumar', isVerified: true },
    { code: 'AIML', name: 'Computer Science & Engg. (AI & ML)', icon: 'Cpu', intake: 60, hod: 'Prof. Smita Dash', isVerified: true },
    { code: 'CE', name: 'Civil Engineering', icon: 'Building', intake: 60, hod: 'Dr. R. K. Paswan', isVerified: true },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', icon: 'Zap', intake: 60, hod: 'Dr. Thakur Pranav Kumar Gautam', isVerified: true },
    { code: 'ECE', name: 'Electronics & Communication Engineering', icon: 'Radio', intake: 60, hod: 'Dr. Sushanta Mahanty', isVerified: true },
    { code: 'ME', name: 'Mechanical Engineering', icon: 'Cog', intake: 60, hod: 'Prof. Shailandra Kumar Prasad', isVerified: true },
    { code: 'MCA', name: 'Master of Computer Applications', icon: 'Layers', intake: 60, hod: 'Prof. Yogendra Kumar', isVerified: true },
    { code: 'BCA', name: 'Bachelor of Computer Applications', icon: 'Terminal', intake: 60, hod: 'Prof. Yogendra Kumar', isVerified: true },
    { code: 'BBA', name: 'Bachelor of Business Administration', icon: 'Briefcase', intake: 60, hod: 'Prof. Anupama Kumari', isVerified: true }
  ],

  // Official Academic Programs with configurable duration, semesters, intake
  programs: [
    {
      id: 'btech-cse',
      code: 'BTECH-CSE',
      name: 'B.Tech Computer Science & Engineering',
      degree: 'B.Tech (UG)',
      department: 'Computer Science & Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 150,
      eligibility: '10+2 with Physics, Mathematics & Chemistry/CS (JEE Main / JCECE)',
      isOfficial: true,
      notes: 'Configurable intake seats as per AICTE approvals (Current: 150)'
    },
    {
      id: 'btech-aiml',
      code: 'BTECH-AIML',
      name: 'B.Tech Computer Science & Engg. (AI & ML)',
      degree: 'B.Tech (UG)',
      department: 'Computer Science & Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      isOfficial: true
    },
    {
      id: 'btech-ce',
      code: 'BTECH-CE',
      name: 'B.Tech Civil Engineering',
      degree: 'B.Tech (UG)',
      department: 'Civil Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      isOfficial: true
    },
    {
      id: 'btech-eee',
      code: 'BTECH-EEE',
      name: 'B.Tech Electrical & Electronics Engineering',
      degree: 'B.Tech (UG)',
      department: 'Electrical & Electronics Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      isOfficial: true
    },
    {
      id: 'btech-ece',
      code: 'BTECH-ECE',
      name: 'B.Tech Electronics & Communication Engineering',
      degree: 'B.Tech (UG)',
      department: 'Electronics & Communication Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      isOfficial: true
    },
    {
      id: 'btech-me',
      code: 'BTECH-ME',
      name: 'B.Tech Mechanical Engineering',
      degree: 'B.Tech (UG)',
      department: 'Mechanical Engineering',
      durationYears: 4,
      semesterCount: 8,
      intakeSeats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      isOfficial: true
    },
    {
      id: 'bba',
      code: 'BBA',
      name: 'Bachelor of Business Administration (BBA)',
      degree: 'UG',
      department: 'Management',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10+2 in any discipline from recognized board',
      isOfficial: true
    },
    {
      id: 'bca',
      code: 'BCA',
      name: 'Bachelor of Computer Applications (BCA)',
      degree: 'UG',
      department: 'Computer Applications',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10+2 with Mathematics/CS',
      isOfficial: true
    },
    {
      id: 'mca',
      code: 'MCA',
      name: 'Master of Computer Applications (MCA)',
      degree: 'PG',
      department: 'Computer Applications',
      durationYears: 2,
      semesterCount: 4,
      intakeSeats: 60,
      eligibility: 'Graduation with Mathematics at 10+2 or Degree level',
      isOfficial: true
    },
    {
      id: 'mtech-cse',
      code: 'MTECH-CSE',
      name: 'M.Tech Computer Science & Engineering',
      degree: 'M.Tech (PG)',
      department: 'Computer Science & Engineering',
      durationYears: 2,
      semesterCount: 4,
      intakeSeats: 18,
      eligibility: 'B.Tech/BE in CSE/IT or MCA with valid GATE/JUT score',
      isOfficial: true
    },
    {
      id: 'dip-ce',
      code: 'DIPLOMA-CE',
      name: 'Diploma in Civil Engineering',
      degree: 'Diploma (Polytechnic)',
      department: 'Civil Engineering',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      isOfficial: true
    },
    {
      id: 'dip-ee',
      code: 'DIPLOMA-EE',
      name: 'Diploma in Electrical Engineering',
      degree: 'Diploma (Polytechnic)',
      department: 'Electrical Engineering',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      isOfficial: true
    },
    {
      id: 'dip-me',
      code: 'DIPLOMA-ME',
      name: 'Diploma in Mechanical Engineering',
      degree: 'Diploma (Polytechnic)',
      department: 'Mechanical Engineering',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      isOfficial: true
    },
    {
      id: 'dip-mctx',
      code: 'DIPLOMA-MCTX',
      name: 'Diploma in Mechatronics Engineering',
      degree: 'Diploma (Polytechnic)',
      department: 'Mechanical Engineering',
      durationYears: 3,
      semesterCount: 6,
      intakeSeats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      isOfficial: true
    }
  ],

  // Academic Sessions
  academicSessions: ['2023-2024', '2024-2025', '2025-2026', '2026-2027'],
  currentSession: '2025-2026',
  currentSemester: 'Even Semester (Spring 2026)',
  minAttendancePercent: 75,

  // Theme Design System
  colors: {
    primary: '#0a192f',     // Deep Navy
    secondary: '#1e3a8a',   // Academic Blue
    accent: '#f59e0b',      // RVS Golden Amber
    accentHover: '#d97706',
    background: '#0b1120',  // Dark canvas
    surface: '#111827',     // Dark card surface
    border: '#1f2937',      // Subtle border
    textLight: '#f8fafc',
    textMuted: '#94a3b8'
  }
};

export default RVS_CONFIG;
