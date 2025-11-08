import axios from 'axios';

export const axiosClient = () => {
    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE,
        withCredentials: false,
    });

    instance.interceptors.request.use((config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('gw_access_token') : null;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    return instance;
};
