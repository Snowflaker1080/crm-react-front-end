import axios from 'axios';

// Expect: VITE_API_URL=http://localhost:3000/api
// Resulting endpoints: http://localhost:3000/api/auth/sign-in, /sign-up
const BASE_URL = `${import.meta.env.VITE_API_URL}/auth`;

const parseJwtPayload = (token) => {
  // Decodes the JWT and returns the payload your API put under `payload`
  return JSON.parse(atob(token.split('.')[1])).payload;
};

const signUp = async (formData) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/sign-up`, formData);

    if (data?.err) throw new Error(data.err);
    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    return parseJwtPayload(data.token);
  } catch (err) {
    // Normalise Axios errors
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Sign-up failed';
    throw new Error(msg);
  }
};

const signIn = async (formData) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/sign-in`, formData);

    if (data?.err) throw new Error(data.err);
    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    return parseJwtPayload(data.token);
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Sign-in failed';
    throw new Error(msg);
  }
};

export default {
  signUp,
  signIn,
};