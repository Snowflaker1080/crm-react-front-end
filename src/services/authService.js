import axios from 'axios';

const RAW_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACK_END_SERVER_URL ||
  '';
const API_BASE = RAW_BASE.replace(/\/+$/, '');
const AUTH_BASE = `${API_BASE}/auth`;

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64)).payload;
  } catch {
    return null;
  }
}

function extractErrorMessage(err) {
  const apiMsg =
    err?.response?.data?.err ||
    err?.response?.data?.error ||
    err?.response?.data?.message;
  return apiMsg || err?.message || 'Request failed';
}

const signUp = async (formData) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE}/sign-up`, formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    const payload = decodeJwtPayload(data.token);
    if (!payload) throw new Error('Invalid JWT token');
    return payload;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

const signIn = async (formData) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE}/sign-in`, formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    const payload = decodeJwtPayload(data.token);
    if (!payload) throw new Error('Invalid JWT token');
    return payload;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export { signUp, signIn };
