import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})


export async function createPost({ image, caption }) {
    try {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("caption", caption);
        const response = await api.post('/api/posts', formData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getPosts() {
    try {
        const response = await api.get('/api/posts');
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function likePost(postId) {
    try {
        const response = await api.patch(`/api/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }       
}

export async function deletePost(postId) {
    try {
        const response = await api.delete(`/api/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}