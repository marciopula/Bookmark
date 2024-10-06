const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const LOGIN_URL = `${API_URL}/api/auth/login`;
export const REFRESH_TOKEN_URL = `${API_URL}/api/auth/refresh`;
export const BOOKMARKS_URL = `${API_URL}/api/bookmarks`;
export const DEVICES_URL = `${API_URL}/api/devices`;