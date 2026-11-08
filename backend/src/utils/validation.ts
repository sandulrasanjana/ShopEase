export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 standard compliant basic regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

export const isValidPrice = (price: any): boolean => {
  const num = Number(price);
  return !isNaN(num) && num > 0;
};

export const isValidStock = (stock: any): boolean => {
  const num = Number(stock);
  return Number.isInteger(num) && num >= 0;
};

export const isValidQuantity = (quantity: any): boolean => {
  const num = Number(quantity);
  return Number.isInteger(num) && num > 0;
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  // Allow digits, spaces, plus, hyphens, parentheses (7 to 20 chars)
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
  return phoneRegex.test(phone.trim());
};

export const isValidPostalCode = (postalCode: string): boolean => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  return postalCode.trim().length >= 3 && postalCode.trim().length <= 15;
};

