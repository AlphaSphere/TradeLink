// API接口封装
// 自动检测运行环境，支持Docker容器和本地开发
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:5002/api'  // Docker环境，使用映射端口5002
    : `http://${window.location.hostname}:5002/api`;  // 其他环境，使用端口5002

// API请求工具函数
const api = {
    // 发送GET请求
    async get(endpoint) {
        try {
            
            // 添加缓存控制头，防止浏览器缓存旧数据
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // 返回包含data和status的对象，保持与index.js中的期望一致
            return {
                data: data,
                status: response.status
            };
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

// 测试数据
const testCategories = [
    {
        "id": 1,
        "title": "常用工具",
        "icon": "bi-tools",
        "tools": [
            {
                "id": 1,
                "name": "Google搜索",
                "description": "全球最大的搜索引擎",
                "url": "https://www.google.com",
                "icon": "bi-search"
            },
            {
                "id": 2,
                "name": "GitHub",
                "description": "代码托管平台",
                "url": "https://github.com",
                "icon": "bi-github"
            }
        ]
    },
    {
        "id": 2,
        "title": "开发资源",
        "icon": "bi-code-square",
        "tools": [
            {
                "id": 3,
                "name": "MDN",
                "description": "Web开发文档",
                "url": "https://developer.mozilla.org",
                "icon": "bi-file-earmark-code"
            }
        ]
    }
];

// 加载分类和工具数据
async function loadCategoriesAndTools() {
    try {
        
        
        // 从API获取真实数据
        
        const response = await categoryApi.getAll();
        
        // 确保响应数据格式正确
        const categories = response.data || [];
        
        
        if (!Array.isArray(categories) || categories.length === 0) {
            console.warn('API返回的分类数据为空或格式不正确，使用测试数据作为备选');
            // 使用测试数据作为备选
            testCategories.forEach(category => {
                
                createCategorySection(category);
            });
            return testCategories;
        }
        
        // 处理API返回的分类数据，创建分类区域
        categories.forEach(category => {
            
            createCategorySection(category);
        });
        
        
        return categories;
        
    } catch (error) {
        console.error('加载分类和工具数据失败:', error);
        console.warn('使用测试数据作为备选');
        
        // 出错时使用测试数据作为备选
        testCategories.forEach(category => {
            createCategorySection(category);
        });
        
        return testCategories;
    }
}

// 创建分类区域的函数
function createCategorySection(category) {
    try {
        
        
        // 检查分类区域是否已存在
        const existingSection = document.getElementById(`category-${category.id}`);
        if (existingSection) {
            
            return;
        }
        
        // 获取主容器
        const categoriesContainer = document.getElementById('categories-container');
        if (!categoriesContainer) {
            throw new Error('找不到分类容器元素');
        }
        
        // 创建分类区域
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section mb-4';
        categorySection.id = `category-${category.id}`;
        
        // 创建分类标题
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title mb-3';
        categoryTitle.innerHTML = `<i class="bi ${category.icon || 'bi-folder'}"></i> ${category.title}`;
        categorySection.appendChild(categoryTitle);
        
        // 创建工具容器 - 使用ul元素
        const toolsContainer = document.createElement('ul');
        toolsContainer.className = 'tools-container list-unstyled';
        
        // 处理分类中的工具
        if (category.tools && Array.isArray(category.tools) && category.tools.length > 0) {
            category.tools.forEach(tool => {
                // 直接创建工具卡片 - 使用li元素
                const toolCardDiv = document.createElement('li');
                toolCardDiv.className = 'tool-card-item';
                
                toolCardDiv.innerHTML = `
                    <div class="tool-card">
                        <a href="${tool.url}" target="_blank" class="text-decoration-none">
                            <div class="tool-icon">
                                ${tool.icon && tool.icon !== 'Logo' && !String(tool.icon).startsWith('bi-') ? 
                                    `<img src="${tool.icon}" alt="${tool.name}" style="width: 24px; height: 24px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                     <span style="display: none;">Logo</span>` :
                                    tool.icon && String(tool.icon).startsWith('bi-') ?
                                    `<i class="bi ${tool.icon}"></i>` :
                                    `<span>Logo</span>`
                                }
                            </div>
                            <div class="tool-info">
                                <div class="tool-header">
                                    <div class="tool-name">${tool.name}</div>
                                </div>
                                <div class="tool-desc">${(tool.description || '点击访问').length > 15 ? (tool.description || '点击访问').substring(0, 15) + '...' : (tool.description || '点击访问')}</div>
                            </div>
                        </a>
                    </div>
                `;
                
                toolsContainer.appendChild(toolCardDiv);
            });
        } else {
            // 如果没有工具，显示提示信息
            const noToolsMessage = document.createElement('li');
            noToolsMessage.className = 'col-12';
            noToolsMessage.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> 该分类暂无工具
                </div>
            `;
            toolsContainer.appendChild(noToolsMessage);
        }
        
        // 将工具容器添加到分类区域
        categorySection.appendChild(toolsContainer);
        
        // 将分类区域添加到主容器
        categoriesContainer.appendChild(categorySection);
        
    } catch (error) {
        console.error('创建分类区域失败:', error);
    }
}