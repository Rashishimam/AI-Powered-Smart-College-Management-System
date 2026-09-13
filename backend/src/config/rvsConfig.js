/**
 * RVS College of Engineering & Technology — Backend Configuration
 * PRIMARY REFERENCE: Official RVS College Website (https://www.rvscollege.ac.in/)
 */

module.exports = {
  collegeName: 'RVS College of Engineering & Technology',
  shortName: 'RVSCET',
  systemName: 'RVS Smart Campus Management System',
  campus: 'Jamshedpur',
  address: 'Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012, India',
  phone: '7033000777',
  placementPhone: '9110969068',
  email: 'info@rvscet.com',
  alternateEmail: 'rvscet@gmail.com',
  website: 'https://www.rvscollege.ac.in/',
  logoUrl: '/assets/rvs-logo.png',
  established: 1993,
  affiliation: 'Approved by AICTE, New Delhi & Affiliated to Jharkhand University of Technology (JUT), Ranchi / Kolhan University',
  accreditation: 'NAAC Accredited Grade "B"',

  leadership: {
    chairman: 'Mr. Binda Singh',
    secretary: 'Mr. Bharat Singh',
    treasurer: 'Mr. Shatrughna Singh',
    principal: 'Prof. (Dr.) Rajesh Kumar Tiwari'
  },

  placementHeadlineStats: {
    alumniWorldwide: '5600+',
    studentsPlaced: '3900+',
    activeRecruiters: '350+',
    placementRate: '86%+',
    highestPackage: '12 LPA',
    averagePackage: '4.2 LPA',
    dataSource: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
  },

  departments: [
    { code: 'CSE', name: 'Computer Science & Engineering', intake: 150, hod: 'Prof. Jeevan Kumar' },
    { code: 'AIML', name: 'Computer Science & Engg. (AI & ML)', intake: 60, hod: 'Prof. Smita Dash' },
    { code: 'CE', name: 'Civil Engineering', intake: 60, hod: 'Dr. R. K. Paswan' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', intake: 60, hod: 'Dr. Thakur Pranav Kumar Gautam' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', intake: 60, hod: 'Dr. Sushanta Mahanty' },
    { code: 'ME', name: 'Mechanical Engineering', intake: 60, hod: 'Prof. Shailandra Kumar Prasad' },
    { code: 'MCA', name: 'Master of Computer Applications', intake: 60, hod: 'Prof. Yogendra Kumar' },
    { code: 'BCA', name: 'Bachelor of Computer Applications', intake: 60, hod: 'Prof. Yogendra Kumar' },
    { code: 'BBA', name: 'Bachelor of Business Administration', intake: 60, hod: 'Prof. Anupama Kumari' }
  ],

  minAttendancePercent: 75
};
