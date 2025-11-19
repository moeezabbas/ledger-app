// Formatting utilities

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount));
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);
};

export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals);
};

export const formatCustomerName = (name) => {
  return name.trim().replace(/\s+/g, ' ');
};

export const sanitizeInput = (input) => {
  return input.toString().trim();
};
