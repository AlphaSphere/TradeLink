// 管理后台JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载分类数据
    loadCategories();
    // 加载网站数据
    loadWebsites();
    
    // 加载快捷导航数据
    loadQuickNavigation();
    
    // 绑定快捷导航管理事件
    bindQuickNavigationEvents();
    
    // 侧边栏菜单切换
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-target]');
    const contentSections = document.querySelectorAll('.content-section');
    
    // 侧边栏菜单点击事件
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有菜单项的active类
            menuItems.forEach(i => i.classList.remove('active'));
            // 为当前点击的菜单项添加active类
            this.classList.add('active');
            
            // 获取目标内容区域
            const target = this.getAttribute('data-target');
            
            // 隐藏所有内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标内容区域
            document.getElementById(target).classList.add('active');
        });
    });
    
    // 移动端侧边栏切换
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // 添加分类按钮点击事件
    const addCategoryBtn = document.getElementById('add-category');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', showAddCategoryModal);
    }
    
    // 添加网站按钮点击事件
    const addWebsiteBtn = document.getElementById('add-website');
    if (addWebsiteBtn) {
        addWebsiteBtn.addEventListener('click', showAddWebsiteModal);
    }
});

// 加载分类数据
async function loadCategories() {
    try {
        
        
        // 获取分类数据响应
        const response = await categoryApi.getAll();
        
        
        // 正确访问响应数据 - API包装在data字段中
        const categories = response.data || response;
        
        
        // 确保数据是数组
        if (!Array.isArray(categories)) {
            throw new Error('分类数据格式错误，期望数组格式');
        }
        
        const tbody = document.querySelector('#categories table tbody');
        if (!tbody) {
            throw new Error('找不到分类表格容器');
        }
        
        tbody.innerHTML = '';
        
        // 如果没有分类数据，显示提示信息
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无分类数据</td></tr>';
            return;
        }
        
        categories.forEach(category => {
            const toolCount = category.tools ? category.tools.length : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.title}</td>
                <td class="d-none d-lg-table-cell">${category.title_en || '-'}</td>
                <td class="d-none d-md-table-cell"><i class="${category.icon}"></i></td>
                <td class="d-none d-sm-table-cell">${toolCount}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary edit-category" data-id="${category.id}" title="编辑">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger delete-category" data-id="${category.id}" title="删除">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        
        
        // 绑定编辑和删除按钮事件
        bindCategoryEvents();
        
        // 更新控制面板统计数据
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length > 0) {
            statElements[0].textContent = categories.length;
        }
        
    } catch (error) {
        console.error('加载分类数据失败:', error);
        showAlert('加载分类数据失败: ' + error.message, 'danger');
        
        // 显示错误状态
        const tbody = document.querySelector('#categories table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">数据加载失败，请刷新页面重试</td></tr>';
        }
    }
}

// 绑定分类编辑和删除事件
function bindCategoryEvents() {
    // 编辑分类按钮
    document.querySelectorAll('.edit-category').forEach(button => {
        button.addEventListener('click', async function() {
            const categoryId = this.getAttribute('data-id');
            
            try {
                // 获取分类数据响应
                const response = await categoryApi.getAll();
                
                
                // 正确访问响应数据 - API包装在data字段中
                const categories = response.data || response;
                
                
                // 确保数据是数组
                if (!Array.isArray(categories)) {
                    throw new Error('分类数据格式错误，期望数组格式');
                }
                
                // 查找指定ID的分类
                const category = categories.find(c => c.id == categoryId);
                
                if (category) {
                    showEditCategoryModal(category);
                } else {
                    showAlert('未找到指定的分类', 'warning');
                }
            } catch (error) {
                console.error('获取分类数据失败:', error);
                showAlert('获取分类数据失败: ' + error.message, 'danger');
            }
        });
    });
    
    // 删除分类按钮
    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', async function() {
            if (confirm('确定要删除这个分类吗？这将同时删除该分类下的所有工具！')) {
                const categoryId = this.getAttribute('data-id');
                try {
                    await categoryApi.delete(categoryId);
                    showAlert('分类删除成功', 'success');
                    loadCategories(); // 重新加载分类数据
                    loadWebsites(); // 重新加载网站数据
                } catch (error) {
                    showAlert('删除分类失败: ' + error.message, 'danger');
                }
            }
        });
    });
}

// 快捷导航管理功能
async function loadQuickNavigation() {
    try {
        // 显示加载状态
        const tbody = document.querySelector('#quickNavigationTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4"><i class="bi bi-hourglass-split"></i> 正在加载...</td></tr>';
        
        // 从后端API获取快捷导航数据
        const response = await fetch('http://127.0.0.1:5002/api/quick-navigation');
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '获取快捷导航数据失败');
        }
        
        const navigationData = Array.isArray(data) ? data : [];
        
        // 清空加载状态
        tbody.innerHTML = '';
        
        if (navigationData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted"><i class="bi bi-inbox"></i> 暂无快捷导航数据</td></tr>';
            return;
        }
        
        navigationData.forEach((item) => {
            const row = document.createElement('tr');
            
            // 状态徽章样式
            const statusBadge = item.status === 'active' 
                ? '<span class="badge bg-success">启用</span>' 
                : '<span class="badge bg-secondary">禁用</span>';
            
            // Logo显示
            const logoDisplay = item.logo 
                ? `<img src="${item.logo}" alt="${item.name}" class="navigation-logo-small" style="width: 32px; height: 32px; object-fit: cover;">` 
                : '<span class="text-muted">无</span>';
            
            // 图标显示
            const iconDisplay = item.icon 
                ? `<i class="${item.icon}"></i>` 
                : '<span class="text-muted">无</span>';
            
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${logoDisplay}</td>
                <td>${iconDisplay}</td>
                <td><a href="${item.url}" target="_blank" class="text-truncate" style="max-width: 200px; display: inline-block;">${item.url}</a></td>
                <td>${item.sort_order || 1}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-navigation" data-id="${item.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-navigation" data-id="${item.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // 更新统计数据
        updateDashboardStats();
        
    } catch (error) {
        console.error('加载快捷导航数据失败:', error);
        const tbody = document.querySelector('#quickNavigationTable tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="text-center p-4">
                    <div class="alert alert-danger mb-0" role="alert">
                        <i class="bi bi-exclamation-triangle"></i> 
                        加载失败: ${error.message}
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadQuickNavigation()">
                            <i class="bi bi-arrow-clockwise"></i> 重试
                        </button>
                    </div>
                </td></tr>
            `;
        }
        showAlert('加载快捷导航数据失败: ' + error.message, 'danger');
    }
}

// 绑定快捷导航管理事件
function bindQuickNavigationEvents() {
    // 添加快捷导航按钮
    const addNavigationBtn = document.getElementById('addNavigationBtn');
    if (addNavigationBtn) {
        addNavigationBtn.addEventListener('click', showAddNavigationModal);
    }
    
    // 编辑快捷导航按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-navigation')) {
            const navigationId = e.target.closest('.edit-navigation').getAttribute('data-id');
            showEditNavigationModal(navigationId);
        }
    });
    
    // 删除快捷导航按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-navigation')) {
            const navigationId = e.target.closest('.delete-navigation').getAttribute('data-id');
            deleteNavigation(navigationId);
        }
    });
}

// 显示添加快捷导航模态框
function showAddNavigationModal() {
    const modal = new bootstrap.Modal(document.getElementById('navigationModal'));
    
    // 重置表单
    document.getElementById('navigationForm').reset();
    document.getElementById('navigationModalLabel').textContent = '添加快捷导航';
    document.getElementById('saveNavigationBtn').textContent = '添加';
    document.getElementById('saveNavigationBtn').setAttribute('data-action', 'add');
    document.getElementById('logoPreview').style.display = 'none';
    
    modal.show();
}

// 显示编辑快捷导航模态框
async function showEditNavigationModal(navigationId) {
    try {
        // 从后端获取导航项详情
        const response = await fetch('http://127.0.0.1:5002/api/quick-navigation');
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '获取导航项数据失败');
        }
        
        const navigationData = Array.isArray(data) ? data : [];
        const item = navigationData.find(nav => nav.id == navigationId);
        
        if (!item) {
            throw new Error('找不到指定的导航项');
        }
        
        // 填充表单数据
        document.getElementById('navigationName').value = item.name;
        document.getElementById('navigationUrl').value = item.url;
        document.getElementById('navigationLogo').value = item.logo || '';
        document.getElementById('navigationIcon').value = item.icon || '';
        document.getElementById('navigationSort').value = item.sort_order || 1;
        document.getElementById('navigationStatus').value = item.status || 'active';
        
        // 显示Logo预览
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview && item.logo) {
            const logoImg = logoPreview.querySelector('img');
            if (logoImg) {
                logoImg.src = item.logo;
                logoImg.onload = () => logoPreview.style.display = 'block';
                logoImg.onerror = () => logoPreview.style.display = 'none';
            }
        }
        
        // 设置模态框标题和按钮
        document.getElementById('navigationModalLabel').textContent = '编辑快捷导航';
        document.getElementById('saveNavigationBtn').textContent = '保存';
        document.getElementById('saveNavigationBtn').setAttribute('data-action', 'edit');
        document.getElementById('saveNavigationBtn').setAttribute('data-id', navigationId);
        
        const modal = new bootstrap.Modal(document.getElementById('navigationModal'));
        modal.show();
        
    } catch (error) {
        showAlert('加载导航数据失败: ' + error.message, 'danger');
    }
}

// 保存快捷导航
async function saveNavigation() {
    const action = document.getElementById('saveNavigationBtn').getAttribute('data-action');
    const navigationId = document.getElementById('saveNavigationBtn').getAttribute('data-id');
    
    const formData = {
        name: document.getElementById('navigationName').value,
        url: document.getElementById('navigationUrl').value,
        logo: document.getElementById('navigationLogo').value,
        icon: document.getElementById('navigationIcon').value,
        sort_order: parseInt(document.getElementById('navigationSort').value) || 1,
        status: document.getElementById('navigationStatus').value
    };
    
    // 验证表单数据
    if (!formData.name || !formData.url) {
        showAlert('请填写必填字段：名称和URL', 'warning');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(formData.url);
    } catch (e) {
        showAlert('请输入有效的URL地址', 'warning');
        return;
    }
    
    const saveButton = document.getElementById('saveNavigationBtn');
    const originalText = saveButton.innerHTML;
    
    try {
        // 显示保存状态
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="bi bi-hourglass-split"></i> 保存中...';
        
        // 确定请求方法和URL
        const method = action === 'edit' ? 'PUT' : 'POST';
        const url = action === 'edit' ? `http://127.0.0.1:5002/api/quick-navigation/${navigationId}` : 'http://127.0.0.1:5002/api/quick-navigation';
        
        // 发送请求
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '操作失败');
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('navigationModal'));
        modal.hide();
        
        // 重新加载数据
        await loadQuickNavigation();
        
        showAlert(data.message || (action === 'add' ? '快捷导航添加成功' : '快捷导航更新成功'), 'success');
        
    } catch (error) {
        showAlert('保存失败: ' + error.message, 'danger');
    } finally {
        // 恢复按钮状态
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
    }
}

// 删除快捷导航
async function deleteNavigation(navigationId) {
    // 确认删除
    if (!confirm('确定要删除这个快捷导航吗？此操作不可恢复。')) {
        return;
    }
    
    try {
        // 找到对应的删除按钮并显示加载状态
        const deleteBtn = document.querySelector(`.delete-navigation[data-id="${navigationId}"]`);
        const originalText = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        
        const response = await fetch(`http://127.0.0.1:5002/api/quick-navigation/${navigationId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '删除失败');
        }
        
        // 显示成功消息
        showAlert(data.message || '快捷导航删除成功！', 'success');
        
        // 重新加载数据
        await loadQuickNavigation();
        
    } catch (error) {
        console.error('删除快捷导航失败:', error);
        showAlert('删除失败: ' + error.message, 'danger');
        
        // 恢复按钮状态
        const deleteBtn = document.querySelector(`.delete-navigation[data-id="${navigationId}"]`);
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        }
    }
}

// 更新控制面板统计数据
function updateDashboardStats() {
    // 这个函数用于更新控制面板的统计数据
    // 可以在这里添加统计逻辑
    
}

// Logo预览功能
function previewLogo() {
    const logoInput = document.getElementById('navigationLogo');
    const logoPreview = document.getElementById('logoPreview');
    const logoImg = logoPreview.querySelector('img');
    
    // 检查是否是文件上传还是URL输入
    if (logoInput.type === 'file' && logoInput.files && logoInput.files[0]) {
        // 文件上传预览
        const file = logoInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            logoImg.src = e.target.result;
            logoPreview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    } else if (logoInput.type === 'url' && logoInput.value) {
        // URL预览
        const logoUrl = logoInput.value;
        logoImg.src = logoUrl;
        logoImg.onload = () => logoPreview.style.display = 'block';
        logoImg.onerror = () => {
            logoPreview.style.display = 'none';
            showAlert('Logo加载失败，请检查URL是否正确', 'warning');
        };
    } else {
        logoPreview.style.display = 'none';
    }
}

// 图标预览功能
function previewIcon(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="图标预览" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">`;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
}

// 自动生成Logo URL
function autoGenerateLogo() {
    const urlInput = document.getElementById('navigationUrl');
    const logoInput = document.getElementById('navigationLogo');
    
    // 只有在URL输入模式下才自动生成
    if (logoInput.type === 'url' && urlInput.value && !logoInput.value) {
        try {
            const hostname = new URL(urlInput.value).hostname;
            logoInput.value = `https://logo.clearbit.com/${hostname}`;
            previewLogo();
        } catch (error) {
            
        }
    }
}

// 切换Logo输入模式（URL或文件上传）
function toggleLogoInputMode() {
    const logoInput = document.getElementById('navigationLogo');
    const logoLabel = document.querySelector('label[for="navigationLogo"]');
    const logoHelp = logoInput.nextElementSibling;
    
    if (logoInput.type === 'url') {
        // 切换到文件上传模式
        logoInput.type = 'file';
        logoInput.accept = 'image/*';
        logoInput.placeholder = '';
        logoLabel.textContent = 'Logo图片文件';
        logoHelp.textContent = '支持 JPG、PNG、SVG 格式，建议尺寸 64x64px';
        logoInput.setAttribute('onchange', 'previewLogo()');
        logoInput.removeAttribute('oninput');
        logoInput.removeAttribute('onblur');
    } else {
        // 切换到URL模式
        logoInput.type = 'url';
        logoInput.removeAttribute('accept');
        logoInput.placeholder = 'https://example.com/logo.png';
        logoLabel.textContent = 'Logo图片URL';
        logoHelp.textContent = '留空将自动根据网站域名生成Logo';
        logoInput.setAttribute('oninput', 'previewLogo()');
        logoInput.setAttribute('onblur', 'autoGenerateLogo()');
        logoInput.removeAttribute('onchange');
    }
    
    // 清空预览
    document.getElementById('logoPreview').style.display = 'none';
    logoInput.value = '';
}

// 显示添加分类模态框
function showAddCategoryModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addCategoryModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">添加分类</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addCategoryForm">
                        <div class="mb-3">
                            <label for="categoryTitle" class="form-label">分类名称</label>
                            <input type="text" class="form-control" id="categoryTitle" required>
                        </div>
                        <div class="mb-3">
                            <label for="categoryTitleEn" class="form-label">分类英文名称</label>
                            <input type="text" class="form-control" id="categoryTitleEn" placeholder="请输入英文名称">
                            <small class="text-muted">用于前台语言切换时显示</small>
                        </div>
                        <div class="mb-3">
                            <label for="categoryIcon" class="form-label">图标 (Bootstrap Icons类名)</label>
                            <input type="text" class="form-control" id="categoryIcon" placeholder="例如: bi-folder">
                            <small class="text-muted">访问 <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a> 查看可用图标</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="saveCategoryBtn">保存</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 绑定保存按钮事件
    document.getElementById('saveCategoryBtn').addEventListener('click', async function() {
        const title = document.getElementById('categoryTitle').value;
        const title_en = document.getElementById('categoryTitleEn').value;
        const icon = document.getElementById('categoryIcon').value || 'bi-folder';
        
        if (!title) {
            showAlert('请输入分类名称', 'warning');
            return;
        }
        
        try {
            // 添加英文名称字段到请求数据中
            await categoryApi.add({ title, title_en, icon });
            modalInstance.hide();
            showAlert('分类添加成功', 'success');
            loadCategories(); // 重新加载分类数据
            
            // 移除模态框
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        } catch (error) {
            showAlert('添加分类失败: ' + error.message, 'danger');
        }
    });
}

// 显示编辑分类模态框
function showEditCategoryModal(category) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'editCategoryModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">编辑分类</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="editCategoryForm">
                        <div class="mb-3">
                            <label for="editCategoryTitle" class="form-label">分类名称</label>
                            <input type="text" class="form-control" id="editCategoryTitle" value="${category.title}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editCategoryTitleEn" class="form-label">分类英文名称</label>
                            <input type="text" class="form-control" id="editCategoryTitleEn" value="${category.title_en || ''}" placeholder="请输入英文名称">
                            <small class="text-muted">用于前台语言切换时显示</small>
                        </div>
                        <div class="mb-3">
                            <label for="editCategoryIcon" class="form-label">图标 (Bootstrap Icons类名)</label>
                            <input type="text" class="form-control" id="editCategoryIcon" value="${category.icon}" placeholder="例如: bi-folder">
                            <small class="text-muted">访问 <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a> 查看可用图标</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="updateCategoryBtn">更新</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 绑定更新按钮事件
    document.getElementById('updateCategoryBtn').addEventListener('click', async function() {
        const title = document.getElementById('editCategoryTitle').value;
        const title_en = document.getElementById('editCategoryTitleEn').value;
        const icon = document.getElementById('editCategoryIcon').value || 'bi-folder';
        
        if (!title) {
            showAlert('请输入分类名称', 'warning');
            return;
        }
        
        try {
            // 添加英文名称字段到更新数据中
            await categoryApi.update(category.id, { title, title_en, icon });
            modalInstance.hide();
            showAlert('分类更新成功', 'success');
            loadCategories(); // 重新加载分类数据
            
            // 移除模态框
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        } catch (error) {
            showAlert('更新分类失败: ' + error.message, 'danger');
        }
    });
}

// 加载网站数据
async function loadWebsites() {
    try {
        
        
        // 获取网站数据响应
        const response = await toolApi.getAll();
        
        
        // 正确访问响应数据 - API包装在data字段中
        const websites = response.data || response;
        
        
        // 确保数据是数组
        if (!Array.isArray(websites)) {
            throw new Error('网站数据格式错误，期望数组格式');
        }
        
        const tbody = document.querySelector('#websites table tbody');
        if (!tbody) {
            throw new Error('找不到网站表格容器');
        }
        
        tbody.innerHTML = '';
        
        // 如果没有网站数据，显示提示信息
        if (websites.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无网站数据</td></tr>';
            return;
        }
        
        websites.forEach(website => {
            const row = document.createElement('tr');
            const iconField = website.icon || '';
            const isUrlIcon = iconField && (iconField.startsWith('/assets/') || iconField.startsWith('http'));
            const isBiIcon = iconField && iconField.startsWith('bi-');
            const iconHtml = isUrlIcon
                ? `<img src="${iconField}" alt="${website.name}" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px;"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none;">Logo</span>`
                : isBiIcon
                    ? `<i class="bi ${iconField}"></i>`
                    : `<span>Logo</span>`;

            row.innerHTML = `
                <td>${website.id}</td>
                <td>${website.name}</td>
                <td class="d-none d-lg-table-cell">${website.name_en || '-'}</td>
                <td class="d-none d-md-table-cell">${iconHtml}</td>
                <td class="d-none d-sm-table-cell">${website.category_id}</td>
                <td class="d-none d-lg-table-cell">${website.description || '无描述'}</td>
                <td class="d-none d-xl-table-cell">${website.description_en || '-'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary edit-website" data-id="${website.id}" title="编辑">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger delete-website" data-id="${website.id}" title="删除">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        
        
        // 绑定编辑和删除按钮事件
        bindWebsiteEvents();
        
        // 更新控制面板统计数据
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length > 1) {
            statElements[1].textContent = websites.length;
        }
        
    } catch (error) {
        console.error('加载网站数据失败:', error);
        showAlert('加载网站数据失败: ' + error.message, 'danger');
        
        // 显示错误状态
        const tbody = document.querySelector('#websites table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">数据加载失败，请刷新页面重试</td></tr>';
        }
    }
}

// 绑定网站编辑和删除事件
function bindWebsiteEvents() {
    // 编辑网站按钮
    document.querySelectorAll('.edit-website').forEach(button => {
        button.addEventListener('click', async function() {
            const toolId = this.getAttribute('data-id');
            
            try {
                // 获取网站数据响应
                const response = await toolApi.getAll();
                
                
                // 正确访问响应数据 - API包装在data字段中
                const tools = response.data || response;
                
                
                // 确保数据是数组
                if (!Array.isArray(tools)) {
                    throw new Error('网站数据格式错误，期望数组格式');
                }
                
                // 查找指定ID的网站
                const tool = tools.find(t => t.id == toolId);
                
                if (tool) {
                    showEditWebsiteModal(tool);
                } else {
                    showAlert('未找到指定的网站', 'warning');
                }
            } catch (error) {
                console.error('获取网站数据失败:', error);
                showAlert('获取网站数据失败: ' + error.message, 'danger');
            }
        });
    });
    
    // 删除网站按钮
    document.querySelectorAll('.delete-website').forEach(button => {
        button.addEventListener('click', async function() {
            if (confirm('确定要删除这个网站吗？')) {
                const toolId = this.getAttribute('data-id');
                try {
                    await toolApi.delete(toolId);
                    showAlert('网站删除成功', 'success');
                    loadWebsites(); // 重新加载网站数据
                } catch (error) {
                    showAlert('删除网站失败: ' + error.message, 'danger');
                }
            }
        });
    });
}

// 显示添加网站模态框
async function showAddWebsiteModal() {
    try {
        // 获取分类数据
        const response = await categoryApi.getAll();
        
        // 正确访问响应数据 - API包装在data字段中
        const categories = response.data || response;
        
        // 确保数据是数组
        if (!Array.isArray(categories)) {
            throw new Error('分类数据格式错误，期望数组格式');
        }
    
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'addWebsiteModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">添加网站</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addWebsiteForm">
                            <div class="mb-3">
                                <label for="websiteName" class="form-label">网站名称</label>
                                <input type="text" class="form-control" id="websiteName" required>
                            </div>
                            <div class="mb-3">
                                <label for="websiteNameEn" class="form-label">网站英文名称</label>
                                <input type="text" class="form-control" id="websiteNameEn" placeholder="请输入英文名称">
                                <small class="text-muted">用于前台语言切换时显示</small>
                            </div>
                            <div class="mb-3">
                                <label for="websiteDescription" class="form-label">描述</label>
                                <textarea class="form-control" id="websiteDescription" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="websiteDescriptionEn" class="form-label">英文描述</label>
                                <textarea class="form-control" id="websiteDescriptionEn" rows="2" placeholder="请输入英文描述"></textarea>
                                <small class="text-muted">用于前台语言切换时显示</small>
                            </div>
                            <div class="mb-3">
                                <label for="websiteIcon" class="form-label">网站图标</label>
                                <input type="file" class="form-control" id="websiteIcon" accept="image/*" onchange="previewIcon('websiteIcon', 'iconPreview')">
                                <small class="text-muted">支持 PNG、JPG、SVG 等图片格式，建议尺寸 32x32 像素</small>
                                <div id="iconPreview" class="mt-2" style="display: none;">
                                    <img src="" alt="图标预览" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="websiteUrl" class="form-label">URL</label>
                                <input type="url" class="form-control" id="websiteUrl" required>
                            </div>
                            <div class="mb-3">
                                <label for="websiteCategory" class="form-label">分类</label>
                                <select class="form-select" id="websiteCategory" required>
                                    ${categories.map(category => `<option value="${category.id}">${category.title}</option>`).join('')}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="saveWebsiteBtn">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 显示模态框
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // 绑定保存按钮事件
        document.getElementById('saveWebsiteBtn').addEventListener('click', async function() {
            const name = document.getElementById('websiteName').value;
            const name_en = document.getElementById('websiteNameEn').value;
            const description = document.getElementById('websiteDescription').value;
            const description_en = document.getElementById('websiteDescriptionEn').value;
            const iconFile = document.getElementById('websiteIcon').files[0]; // 获取上传的文件
            const url = document.getElementById('websiteUrl').value;
            const category_id = document.getElementById('websiteCategory').value;
            
            if (!name || !url || !category_id) {
                showAlert('请填写必填字段', 'warning');
                return;
            }
            
            try {
                let iconUrl = 'Logo'; // 默认显示Logo字样
                
                // 如果有上传图标文件，先上传图标
                if (iconFile) {
                    const formData = new FormData();
                    formData.append('file', iconFile);
                    
                    // 使用XMLHttpRequest直连后端API端口，避免经由前端静态服务导致501
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'http://localhost:5002/api/upload-icon', true);
                    xhr.setRequestHeader('Accept', 'application/json');
                    
                    const uploadResponse = await new Promise((resolve, reject) => {
                        xhr.onload = function() {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve({ ok: true, json: () => Promise.resolve(JSON.parse(xhr.responseText)) });
                            } else {
                                reject(new Error('上传失败: ' + xhr.statusText));
                            }
                        };
                        xhr.onerror = function() {
                            reject(new Error('网络错误'));
                        };
                        xhr.send(formData);
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        iconUrl = uploadResult.icon_url;
                    } else {
                        throw new Error('图标上传失败');
                    }
                }
                
                // 添加网站数据，包含图标URL
                await toolApi.add({ name, name_en, description, description_en, icon: iconUrl, url, category_id });
                modalInstance.hide();
                showAlert('网站添加成功', 'success');
                loadWebsites(); // 重新加载网站数据
                
                // 移除模态框
                modal.addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(modal);
                });
            } catch (error) {
                showAlert('添加网站失败: ' + error.message, 'danger');
            }
        });
        
    } catch (error) {
        console.error('获取分类数据失败:', error);
        showAlert('获取分类数据失败: ' + error.message, 'danger');
    }
}

// 显示编辑网站模态框
async function showEditWebsiteModal(tool) {
    try {
        // 获取所有分类
        const response = await categoryApi.getAll();
        
        
        // 正确访问响应数据 - API包装在data字段中
        const categories = response.data || response;
        
        
        // 确保数据是数组
        if (!Array.isArray(categories)) {
            throw new Error('分类数据格式错误，期望数组格式');
        }
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editWebsiteModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">编辑网站</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editWebsiteForm">
                            <div class="mb-3">
                                <label for="editWebsiteName" class="form-label">网站名称</label>
                                <input type="text" class="form-control" id="editWebsiteName" value="${tool.name}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteNameEn" class="form-label">网站英文名称</label>
                                <input type="text" class="form-control" id="editWebsiteNameEn" value="${tool.name_en || ''}" placeholder="请输入英文名称">
                                <small class="text-muted">用于前台语言切换时显示</small>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteDescription" class="form-label">描述</label>
                                <textarea class="form-control" id="editWebsiteDescription" rows="2">${tool.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteDescriptionEn" class="form-label">英文描述</label>
                                <textarea class="form-control" id="editWebsiteDescriptionEn" rows="2" placeholder="请输入英文描述">${tool.description_en || ''}</textarea>
                                <small class="text-muted">用于前台语言切换时显示</small>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteIcon" class="form-label">网站图标</label>
                                <input type="file" class="form-control" id="editWebsiteIcon" accept="image/*" onchange="previewIcon('editWebsiteIcon', 'editIconPreview')">
                                <small class="text-muted">支持 PNG、JPG、SVG 等图片格式，建议尺寸 32x32 像素</small>
                                <div id="editIconPreview" class="mt-2">
                                    ${tool.icon ? `<img src="${tool.icon}" alt="当前图标" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` : '<span class="text-muted">Logo</span>'}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteUrl" class="form-label">URL</label>
                                <input type="url" class="form-control" id="editWebsiteUrl" value="${tool.url}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editWebsiteCategory" class="form-label">分类</label>
                                <select class="form-select" id="editWebsiteCategory" required>
                                    ${categories.map(category => `<option value="${category.id}" ${category.id === tool.category_id ? 'selected' : ''}>${category.title}</option>`).join('')}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="updateWebsiteBtn">更新</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 显示模态框
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // 绑定更新按钮事件
        document.getElementById('updateWebsiteBtn').addEventListener('click', async function() {
            const name = document.getElementById('editWebsiteName').value;
            const name_en = document.getElementById('editWebsiteNameEn').value;
            const description = document.getElementById('editWebsiteDescription').value;
            const description_en = document.getElementById('editWebsiteDescriptionEn').value;
            const iconFile = document.getElementById('editWebsiteIcon').files[0]; // 获取上传的文件
            const url = document.getElementById('editWebsiteUrl').value;
            const category_id = document.getElementById('editWebsiteCategory').value;
            
            if (!name || !url || !category_id) {
                showAlert('请填写必填字段', 'warning');
                return;
            }
            
            try {
                let iconUrl = tool.icon || 'Logo'; // 保持原有图标或默认Logo字样
                
                // 如果有上传图标文件，先上传图标
                if (iconFile) {
                    const formData = new FormData();
                    formData.append('file', iconFile);
                    
                    // 使用XMLHttpRequest替代fetch进行文件上传
                    const xhr = new XMLHttpRequest();
                    // 直接请求后端API端口，避免经由前端静态服务导致501
                    xhr.open('POST', 'http://localhost:5002/api/upload-icon', true);
                    xhr.setRequestHeader('Accept', 'application/json');
                    
                    // 创建一个Promise来处理XMLHttpRequest
                    const uploadResponse = await new Promise((resolve, reject) => {
                        xhr.onload = function() {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve({
                                    ok: true,
                                    json: () => Promise.resolve(JSON.parse(xhr.responseText))
                                });
                            } else {
                                reject(new Error('上传失败: ' + xhr.statusText));
                            }
                        };
                        xhr.onerror = function() {
                            reject(new Error('网络错误'));
                        };
                        xhr.send(formData);
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        iconUrl = uploadResult.icon_url;
                    } else {
                        throw new Error('图标上传失败');
                    }
                }
                
                // 更新网站数据，包含图标URL
                await toolApi.update(tool.id, { name, name_en, description, description_en, icon: iconUrl, url, category_id });
                modalInstance.hide();
                showAlert('网站更新成功', 'success');
                loadWebsites(); // 重新加载网站数据
                
                // 移除模态框
                modal.addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(modal);
                });
            } catch (error) {
                showAlert('更新网站失败: ' + error.message, 'danger');
            }
        });
        
    } catch (error) {
        console.error('获取分类数据失败:', error);
        showAlert('获取分类数据失败: ' + error.message, 'danger');
    }
}

// 渲染快捷导航列表
function renderNavigationList(navigations) {
    const container = document.getElementById('navigation-list');
    
    if (!navigations || navigations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>
                <p class="text-muted mt-3">暂无快捷导航数据</p>
                <button class="btn btn-primary" onclick="showAddModal()">
                    <i class="bi bi-plus-circle"></i> 添加第一个快捷导航
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = navigations.map(nav => `
        <div class="navigation-item card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <img src="${nav.logo_url}" alt="${nav.name}" class="navigation-logo" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjAgMTBMMjUgMTVIMjJWMjVIMThWMTVIMTVMMjAgMTBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo='">
                    </div>
                    <div class="col">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1 fw-bold">${nav.name}</h6>
                                <p class="mb-1 text-muted small">${nav.url}</p>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="status-badge ${nav.is_active ? 'status-active' : 'status-inactive'}">
                                        <i class="bi bi-${nav.is_active ? 'check-circle' : 'x-circle'}"></i>
                                        ${nav.is_active ? '启用' : '禁用'}
                                    </span>
                                    <small class="text-muted">
                                        <i class="bi bi-eye"></i> 点击量: ${nav.click_count || 0}
                                    </small>
                                </div>
                            </div>
                            <div class="navigation-actions">
                                <button class="btn btn-outline-primary btn-sm" onclick="editNavigation(${nav.id})" title="编辑">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-${nav.is_active ? 'warning' : 'success'} btn-sm" 
                                        onclick="toggleNavigationStatus(${nav.id}, ${!nav.is_active})" 
                                        title="${nav.is_active ? '禁用' : '启用'}">
                                    <i class="bi bi-${nav.is_active ? 'eye-slash' : 'eye'}"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm delete-navigation" 
                                        data-id="${nav.id}" onclick="deleteNavigation(${nav.id})" title="删除">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 切换快捷导航状态（启用/禁用）
async function toggleNavigationStatus(navId, newStatus) {
    try {
        // 找到对应的状态切换按钮并显示加载状态
        const toggleBtn = document.querySelector(`button[onclick="toggleNavigationStatus(${navId}, ${!newStatus})"]`);
        const originalHTML = toggleBtn.innerHTML;
        toggleBtn.disabled = true;
        toggleBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        
        const response = await fetch(`http://127.0.0.1:5002/api/quick-navigation/${navId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_active: newStatus
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 显示成功消息
        showAlert(`快捷导航已${newStatus ? '启用' : '禁用'}！`, 'success');
        
        // 重新加载数据以更新界面
        await loadQuickNavigation();
        
    } catch (error) {
        console.error('切换状态失败:', error);
        showAlert('状态切换失败: ' + error.message, 'danger');
        
        // 恢复按钮状态
        const toggleBtn = document.querySelector(`button[onclick="toggleNavigationStatus(${navId}, ${!newStatus})"]`);
        if (toggleBtn) {
            toggleBtn.disabled = false;
            toggleBtn.innerHTML = originalHTML;
        }
    }
}

// 显示添加模态框
function showAddModal() {
    // 清空表单
    document.getElementById('navigation-form').reset();
    document.getElementById('navigation-id').value = '';
    document.getElementById('modal-title').textContent = '添加快捷导航';
    document.getElementById('save-btn').innerHTML = '<i class="bi bi-plus-circle"></i> 添加';
    
    // 清空Logo预览
    const logoPreview = document.getElementById('logo-preview');
    logoPreview.innerHTML = '<div class="preview-text">Logo预览将在这里显示</div>';
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('navigation-modal'));
    modal.show();
}