// Student intake select options. Stored as-is in tbstudent text columns.
export const OCCUPATIONS = ['Student', 'University Student', 'Employee', 'Entrepreneur', 'Other'];
export const PROGRAMS = ['General English', 'Private Class'];
export const ENGLISH_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Not Sure'];
export const REFERRAL_SOURCES = ['Instagram', 'Facebook', 'Tiktok', 'Google', 'Friend/Family', 'Other'];
export const LEARNING_MODES = ['Offline', 'Online', 'Hybrid'];
export const PREFERRED_TIMES = ['Morning', 'Afternoon', 'Evening'];
export const STUDIED_BEFORE = ['Yes', 'No'];
export const LEARNING_REASONS = ['Daily Communication', 'Study', 'Work', 'IELTS/TOEFL', 'Scholarship', 'Travel', 'Other'];

// Course levels the certificate generator has a template for. Stored as-is in
// tbgrade.level and matched by backend/src/helper/certificate.js; also served by
// GET /grades/certificate-levels. Keep in sync with the templates in
// backend/src/assets/certificates/.
export const CERTIFICATE_LEVELS = [
  'Pre-Elementary I',
  'Pre-Elementary II',
  'Pre-Elementary III',
  'Pre-Elementary IV',
  'Elementary',
  'Intermediate',
  'Advanced'
];
