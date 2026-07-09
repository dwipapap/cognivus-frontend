/**
 * Map gender from backend to frontend.
 * @param {string} gender - Backend gender code (L/P)
 * @returns {string} Frontend display text
 */
export const mapGenderToFrontend = (gender) => {
  const mapping = { L: 'Laki-laki', P: 'Perempuan' };
  return mapping[gender] || gender;
};

/**
 * Map gender from frontend to backend.
 * @param {string} gender - Frontend display text
 * @returns {string} Backend gender code
 */
export const mapGenderToBackend = (gender) => {
  const mapping = { 'Laki-laki': 'L', 'Perempuan': 'P' };
  return mapping[gender] || gender;
};
