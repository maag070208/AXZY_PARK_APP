

const BASE_IP = '192.168.1.100';
const BASE_PORT = '4444';

const BASE_URL = `https://axzy-park-api.onrender.com/api/v1`;

export const API_CONSTANTS = {
  // BASE_URL: `http://${BASE_IP}:${BASE_PORT}/api/v1`,
  BASE_URL,
  TIMEOUT: 5000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  URLS: {
    AUTH: {
      LOGIN: '/users/login',
    },
  },
};

