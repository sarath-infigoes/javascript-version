import React from 'react'

const api = async () => {
  try {
    const response = await fetch('https://spinryte.in/draw/api/', {
      method: 'GET', // or 'POST', 'PUT', etc., depending on your API
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN', // if needed
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export default api

