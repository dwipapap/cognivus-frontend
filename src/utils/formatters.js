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
    grade.writing_score
  ].filter(score => score !== null && score !== undefined);
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + parseFloat(score), 0);
  return Math.round(sum / scores.length);
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
