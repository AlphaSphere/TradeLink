// API接口封装
// 自动检测运行环境，支持Docker容器和本地开发
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:5002/api'  // 本地开发环境，使用新端口5002
    : `http://${window.location.hostname}:5002/api`;  // Docker或其他环境，使用新端口5002

// API请求工具函数
const api = {
    // 发送GET请求
    async get(endpoint) {
        try {
            console.log('API请求:', `${API_BASE_URL}${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log('API响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('API响应数据:', data);
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },
    
    // 发送POST请求
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },
    
    // 发送PUT请求
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },
    
    // 发送DELETE请求
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }
};

// 分类相关API
const categoryApi = {
    // 获取所有分类
    getAll: () => api.get('/categories'),
    
    // 添加新分类
    add: (categoryData) => api.post('/categories', categoryData),
    
    // 更新分类
    update: (categoryId, categoryData) => api.put(`/categories/${categoryId}`, categoryData),
    
    // 删除分类
    delete: (categoryId) => api.delete(`/categories/${categoryId}`)
};

// 工具相关API
const toolApi = {
    // 获取所有工具
    getAll: () => api.get('/tools'),
    
    // 获取特定分类下的工具
    getByCategory: (categoryId) => api.get(`/categories/${categoryId}/tools`),
    
    // 添加新工具
    add: (toolData) => api.post('/tools', toolData),
    
    // 更新工具
    update: (toolId, toolData) => api.put(`/tools/${toolId}`, toolData),
    
    // 删除工具
    delete: (toolId) => api.delete(`/tools/${toolId}`)
};

// 系统状态API
const systemApi = {
    // 获取系统状态
    getStatus: () => api.get('/status')
};