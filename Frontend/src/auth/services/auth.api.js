import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const respone = await api.post('/api/auth/register', { username, email, password });
        return respone.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const respone = await api.post('/api/auth/login', { email, password });
        return respone.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function logout() {
    try {
        const response = await api.get('/api/auth/logout');
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getProfile() {
    try {
        const response = await api.get('/api/auth/profile');
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function updateProfile(data) {
    try {
        const response = await api.put('/api/auth/profile', data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}