import Axios from 'axios';

const apiClient = Axios.create({
   // baseURL: 'http://localhost:3200/api',
     baseURL: 'https://backend-jook.onrender.com/api',
    headers: {
        // Inicializar con un objeto vacío, y añadir el token dentro del interceptor
        "Authorization": ""
    }
});

// Add an interceptor to update the token before each request
apiClient.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('auth');
        if (authData) {
            try {
                const { token } = JSON.parse(authData); // Get the token from localStorage
                console.log("token en axios", token);
                config.headers.Authorization = `Bearer ${token}`; // Set the Authorization header
            } catch (error) {
                console.error("Error parsing auth data:", error);
                // Handle error: maybe clear auth data or redirect to login
                localStorage.removeItem('auth');
                // Consider redirecting to a login page or showing an error message
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
