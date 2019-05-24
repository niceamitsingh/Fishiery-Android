import axios from 'axios';

export default async function request(url, data) {
  const instance = axios.create({
    timeout: 1000 * 60 * 1,
    headers: {'Content-Type': 'application/json'},
  });

  try {
    const response = await instance.post(url, data);
    const response_data = await response.data;
    return response_data;
  } catch (error) {
    return error.message;
  }
}
