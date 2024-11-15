// api.js
export const apiCall = async (url, method, body) => {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });
    return response;
  } catch (error) {
    console.error('API call error:', error);
    return null;
  }
};