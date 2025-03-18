// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Format currency based on currency code
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyLocaleMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
    INR: 'en-IN',
  };
  
  const locale = currencyLocaleMap[currency] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date (MM/DD/YYYY)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
};

// Get current date as ISO string (YYYY-MM-DD)
export const getCurrentDateISO = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Get a color based on a numeric rating (1-5)
export const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 1:
      return '#FF4136'; // Red
    case 2:
      return '#FF851B'; // Orange
    case 3:
      return '#FFDC00'; // Yellow
    case 4:
      return '#2ECC40'; // Green
    case 5:
      return '#3D9970'; // Dark Green
    default:
      return '#AAAAAA'; // Gray
  }
}; 