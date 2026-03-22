const axios = require('axios');

const DIGILOCKER_BASE_URL = process.env.DIGILOCKER_BASE_URL || 'http://localhost:4000';

const fetchToken = async (code) => {
  try {
    const response = await axios.post(`${DIGILOCKER_BASE_URL}/auth/token`, { code });
    return response.data;
  } catch (error) {
    console.error('Error fetching DigiLocker token:', error.message);
    throw new Error('DigiLocker token exchange failed');
  }
};

const fetchUserInfo = async (accessToken) => {
  try {
    const response = await axios.get(`${DIGILOCKER_BASE_URL}/auth/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching DigiLocker user info:', error.message);
    throw new Error('DigiLocker user info retrieval failed');
  }
};

module.exports = {
  fetchToken,
  fetchUserInfo
};
