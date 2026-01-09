import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies (including HTTP-only cookies) with requests
  
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default instance;
