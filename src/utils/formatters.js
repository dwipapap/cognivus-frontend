export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getAverageScore = (grade) => {
  const scores = [
    grade.listening_score,
    grade.speaking_score,
    grade.reading_score,
    grade.writing_score,
    grade.grammar_score,
    grade.vocabulary_score
  ].filter(score => score !== null && score !== undefined);
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + parseFloat(score), 0);
  return Math.round(sum / scores.length);
};

export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth)) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusBadge = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[status] || 'bg-muted text-default border-default';
};
