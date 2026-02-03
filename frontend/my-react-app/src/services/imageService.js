import axios from 'axios';

const API_URL = 'http://localhost:5000/api/images';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

const imageService = {
    uploadImage: async (files) => {
        const formData = new FormData();

        // Handle single file or array/FileList
        if (files instanceof FileList) {
            Array.from(files).forEach(file => {
                formData.append('images', file);
            });
        } else if (Array.isArray(files)) {
            files.forEach(file => {
                formData.append('images', file);
            });
        } else {
            formData.append('images', files);
        }

        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getUserImages: async () => {
        const response = await axios.get(API_URL, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    searchImages: async (query) => {
        const response = await axios.get(`${API_URL}/search`, {
            headers: getAuthHeader(),
            params: { query }
        });
        return response.data;
    },

    getImageFile: async (id) => {
        const response = await axios.get(`${API_URL}/${id}/file`, {
            headers: getAuthHeader(),
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }
};

export default imageService;
