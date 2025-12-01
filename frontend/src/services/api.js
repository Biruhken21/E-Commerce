const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  let headers = { ...options.headers };

  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Product API functions
export const productAPI = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Create new product
  createProduct: async (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  updateProduct: async (id, productData) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  deleteProduct: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    return apiRequest(`/products/${id}/favorite`, {
      method: 'POST',
    });
  },
};

// Upload API functions
export const uploadAPI = {
  // Upload single image
  uploadSingle: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return apiRequest('/upload/single', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Upload multiple images
  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return apiRequest('/upload/multiple', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Delete uploaded file
  deleteFile: async (filename) => {
    return apiRequest(`/upload/${filename}`, {
      method: 'DELETE',
    });
  },
};

// User API functions
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Return the data in the format expected by the frontend
    return {
      user: response.data.user,
      token: response.data.token
    };
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Return the data in the format expected by the frontend
    return {
      user: response.data.user,
      token: response.data.token
    };
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiRequest('/users/profile');
    return response.data;
  },
};

// Broker API functions
export const brokerAPI = {
  // Test broker API
  test: async () => {
    return apiRequest('/broker/test');
  },

  // List products for debugging
  listProducts: async () => {
    return apiRequest('/broker/products');
  },

  // Test inquiry creation
  testInquiry: async () => {
    return apiRequest('/broker/test-inquiry', {
      method: 'POST'
    });
  },

  // Submit broker contact form
  submitContact: async (contactData) => {
    return apiRequest('/broker/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  // Get broker statistics (for admin)
  getStats: async () => {
    return apiRequest('/broker/stats');
  },

  // Get pending inquiries (for broker dashboard)
  getInquiries: async () => {
    return apiRequest('/broker/inquiries');
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};

export default {
  productAPI,
  uploadAPI,
  userAPI,
  brokerAPI,
  healthCheck,
};
