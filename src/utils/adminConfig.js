// Admin credentials loaded from environment variables
// Set VITE_ADMIN_PASSWORD in .env for production
export const ADMIN_CREDENTIALS = {
  email: 'pavithrabhat39@gmail.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'Pavithra123',
  role: 'admin',
  fullName: 'Pavithra Bhat',
  id: 'admin-001',
};