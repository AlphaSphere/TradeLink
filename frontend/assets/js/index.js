// 前端首页JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在管理页面
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (!isAdminPage) {
        // 只在非管理页面执行这些初始化
        initQuickNavigation();
        loadCategoriesAndTools();
        initSearch();
        
        // 确保DOM完全加载后再自动加载TradeLink内容
        setTimeout(() => {
            switchToSite('TradeLink');
        }, 100);
    }
    
    // 主题切换功能在所有页面都可用
    initThemeToggle();
});

// 站点数据配置 - 定义不同站点的工具和链接
const siteData = {
    'TradeLink': {
        name: 'TradeLink',
        description: '跨境电商综合工具平台',
        // 圆形导航卡片数据
        circularNavigation: [
            { name: 'Amazon', icon: 'bi-shop', url: 'https://www.amazon.com', logo: 'https://logo.clearbit.com/amazon.com' },
            { name: 'eBay', icon: 'bi-bag', url: 'https://www.ebay.com', logo: 'https://logo.clearbit.com/ebay.com' },
            { name: 'Shopify', icon: 'bi-cart', url: 'https://www.shopify.com', logo: 'https://logo.clearbit.com/shopify.com' },
            { name: 'AliExpress', icon: 'bi-lightning', url: 'https://www.aliexpress.com', logo: 'https://logo.clearbit.com/aliexpress.com' },
            { name: 'Wish', icon: 'bi-star', url: 'https://www.wish.com', logo: 'https://logo.clearbit.com/wish.com' },
            { name: 'Etsy', icon: 'bi-heart', url: 'https://www.etsy.com', logo: 'https://logo.clearbit.com/etsy.com' },
            { name: 'Walmart', icon: 'bi-house', url: 'https://www.walmart.com', logo: 'https://logo.clearbit.com/walmart.com' },
            { name: 'Target', icon: 'bi-bullseye', url: 'https://www.target.com', logo: 'https://logo.clearbit.com/target.com' },
            { name: 'Google Ads', icon: 'bi-google', url: 'https://ads.google.com', logo: 'https://logo.clearbit.com/google.com' },
            { name: 'Facebook Ads', icon: 'bi-facebook', url: 'https://business.facebook.com', logo: 'https://logo.clearbit.com/facebook.com' },
            { name: 'PayPal', icon: 'bi-paypal', url: 'https://www.paypal.com', logo: 'https://logo.clearbit.com/paypal.com' },
            { name: 'Stripe', icon: 'bi-credit-card', url: 'https://stripe.com', logo: 'https://logo.clearbit.com/stripe.com' }
        ],
        categories: [
            {
                title: '数据分析工具',
                icon: 'bi-bar-chart-fill',
                tools: [
                    { name: 'Jungle Scout', description: '亚马逊产品研究工具', url: 'https://www.junglescout.com', icon: 'bi-search' },
                    { name: 'Helium 10', description: '亚马逊卖家工具套件', url: 'https://www.helium10.com', icon: 'bi-tools' },
                    { name: 'AMZScout', description: '亚马逊产品分析工具', url: 'https://amzscout.net', icon: 'bi-graph-up' }
                ]
            },
            {
                title: 'AI工具',
                icon: 'bi-robot',
                tools: [
                    { name: 'ChatGPT', description: 'AI对话助手', url: 'https://chat.openai.com', icon: 'bi-chat-dots' },
                    { name: 'Claude', description: 'AI助手', url: 'https://claude.ai', icon: 'bi-cpu' },
                    { name: 'Midjourney', description: 'AI图像生成', url: 'https://midjourney.com', icon: 'bi-image' }
                ]
            }
        ]
    },
    '亚马逊': {
        name: '亚马逊',
        description: '亚马逊卖家专用工具',
        categories: [
            {
                title: '亚马逊卖家工具',
                icon: 'bi-shop',
                tools: [
                    { name: 'Amazon Seller Central', description: '亚马逊卖家中心', url: 'https://sellercentral.amazon.com', icon: 'bi-house' },
                    { name: 'Amazon FBA Calculator', description: 'FBA费用计算器', url: 'https://sellercentral.amazon.com/fba/profitabilitycalculator', icon: 'bi-calculator' },
                    { name: 'Amazon Brand Registry', description: '品牌注册', url: 'https://brandregistry.amazon.com', icon: 'bi-shield-check' }
                ]
            },
            {
                title: '关键词工具',
                icon: 'bi-search',
                tools: [
                    { name: 'MerchantWords', description: '亚马逊关键词工具', url: 'https://www.merchantwords.com', icon: 'bi-key' },
                    { name: 'Sonar', description: '免费关键词工具', url: 'https://sonar-tool.com', icon: 'bi-soundwave' },
                    { name: 'Keyword Tool', description: '关键词研究工具', url: 'https://keywordtool.io', icon: 'bi-search-heart' }
                ]
            }
        ]
    },
    'eBay': {
        name: 'eBay',
        description: 'eBay卖家专用工具',
        categories: [
            {
                title: 'eBay卖家工具',
                icon: 'bi-shop-window',
                tools: [
                    { name: 'eBay Seller Hub', description: 'eBay卖家中心', url: 'https://www.ebay.com/sh/landing', icon: 'bi-house-door' },
                    { name: 'Terapeak', description: 'eBay市场研究工具', url: 'https://www.ebay.com/sh/research', icon: 'bi-graph-up-arrow' },
                    { name: 'eBay Promoted Listings', description: 'eBay推广工具', url: 'https://www.ebay.com/sh/marketing', icon: 'bi-megaphone' }
                ]
            },
            {
                title: '数据分析',
                icon: 'bi-bar-chart',
                tools: [
                    { name: 'SaleHoo', description: 'eBay产品研究', url: 'https://www.salehoo.com', icon: 'bi-binoculars' },
                    { name: 'WatchCount', description: 'eBay观察计数器', url: 'https://www.watchcount.com', icon: 'bi-eye' },
                    { name: 'eBay Fee Calculator', description: 'eBay费用计算器', url: 'https://www.fees.ebay.com', icon: 'bi-calculator-fill' }
                ]
            }
        ]
    },
    'Shopify': {
        name: 'Shopify',
        description: 'Shopify独立站工具',
        categories: [
            {
                title: 'Shopify应用',
                icon: 'bi-app-indicator',
                tools: [
                    { name: 'Shopify Admin', description: 'Shopify管理后台', url: 'https://admin.shopify.com', icon: 'bi-gear' },
                    { name: 'Shopify App Store', description: 'Shopify应用商店', url: 'https://apps.shopify.com', icon: 'bi-shop' },
                    { name: 'Oberlo', description: 'Shopify代发货应用', url: 'https://www.oberlo.com', icon: 'bi-truck' }
                ]
            },
            {
                title: '主题和设计',
                icon: 'bi-palette',
                tools: [
                    { name: 'Shopify Themes', description: 'Shopify主题商店', url: 'https://themes.shopify.com', icon: 'bi-brush' },
                    { name: 'Canva', description: '在线设计工具', url: 'https://www.canva.com', icon: 'bi-image-alt' },
                    { name: 'Unsplash', description: '免费图片素材', url: 'https://unsplash.com', icon: 'bi-camera' }
                ]
            }
        ]
    },
    'TikTok Shop': {
        name: 'TikTok Shop',
        description: 'TikTok电商工具',
        categories: [
            {
                title: 'TikTok Shop工具',
                icon: 'bi-tiktok',
                tools: [
                    { name: 'TikTok Shop Seller Center', description: 'TikTok Shop卖家中心', url: 'https://seller.tiktokshop.com', icon: 'bi-house-heart' },
                    { name: 'TikTok Creator Fund', description: 'TikTok创作者基金', url: 'https://www.tiktok.com/creators', icon: 'bi-cash-coin' },
                    { name: 'TikTok Ads Manager', description: 'TikTok广告管理', url: 'https://ads.tiktok.com', icon: 'bi-bullseye' }
                ]
            },
            {
                title: '内容创作工具',
                icon: 'bi-camera-video',
                tools: [
                    { name: 'CapCut', description: '视频编辑工具', url: 'https://www.capcut.com', icon: 'bi-scissors' },
                    { name: 'InShot', description: '手机视频编辑', url: 'https://inshot.com', icon: 'bi-phone' },
                    { name: 'Loom', description: '屏幕录制工具', url: 'https://www.loom.com', icon: 'bi-record-circle' }
                ]
            }
        ]
    },
    '速卖通': {
        name: '速卖通',
        description: '速卖通卖家工具',
        categories: [
            {
                title: '速卖通工具',
                icon: 'bi-lightning',
                tools: [
                    { name: 'AliExpress Seller Center', description: '速卖通卖家中心', url: 'https://sell.aliexpress.com', icon: 'bi-house-gear' },
                    { name: 'AliExpress Dropshipping Center', description: '速卖通代发货中心', url: 'https://portals.aliexpress.com', icon: 'bi-box-seam' },
                    { name: 'Alibaba.com', description: '阿里巴巴批发平台', url: 'https://www.alibaba.com', icon: 'bi-building' }
                ]
            },
            {
                title: '数据分析',
                icon: 'bi-graph-up',
                tools: [
                    { name: 'AliShark', description: '速卖通数据分析', url: 'https://www.alishark.com', icon: 'bi-bar-chart-line' },
                    { name: 'SaleSource', description: '速卖通选品工具', url: 'https://www.salesource.com', icon: 'bi-search' },
                    { name: 'Ecomhunt', description: '产品趋势分析', url: 'https://ecomhunt.com', icon: 'bi-trending-up' }
                ]
            }
        ]
    },
    'Wish': {
        name: 'Wish',
        description: 'Wish平台工具',
        categories: [
            {
                title: 'Wish商户工具',
                icon: 'bi-star',
                tools: [
                    { name: 'Wish Merchant Dashboard', description: 'Wish商户后台', url: 'https://merchant.wish.com', icon: 'bi-speedometer2' },
                    { name: 'Wish Express', description: 'Wish快速配送', url: 'https://merchant.wish.com/express', icon: 'bi-lightning-charge' },
                    { name: 'Wish Ads Manager', description: 'Wish广告管理', url: 'https://merchant.wish.com/ads', icon: 'bi-badge-ad' }
                ]
            },
            {
                title: '优化工具',
                icon: 'bi-tools',
                tools: [
                    { name: 'Wish Analytics', description: 'Wish数据分析', url: 'https://merchant.wish.com/analytics', icon: 'bi-pie-chart' },
                    { name: 'Product Boost', description: '产品推广工具', url: 'https://merchant.wish.com/boost', icon: 'bi-rocket-takeoff' },
                    { name: 'Wish API', description: 'Wish开发者API', url: 'https://merchant.wish.com/documentation/api', icon: 'bi-code-slash' }
                ]
            }
        ]
    },
    '跨境电商': {
        name: '跨境电商',
        description: '跨境电商综合工具',
        categories: [
            {
                title: '综合平台',
                icon: 'bi-globe',
                tools: [
                    { name: 'Google Trends', description: '谷歌趋势分析', url: 'https://trends.google.com', icon: 'bi-graph-up-arrow' },
                    { name: 'SimilarWeb', description: '网站流量分析', url: 'https://www.similarweb.com', icon: 'bi-bar-chart-steps' },
                    { name: 'Facebook Business', description: 'Facebook商业工具', url: 'https://business.facebook.com', icon: 'bi-facebook' }
                ]
            },
            {
                title: '物流工具',
                icon: 'bi-truck',
                tools: [
                    { name: 'DHL', description: 'DHL国际快递', url: 'https://www.dhl.com', icon: 'bi-box' },
                    { name: 'FedEx', description: 'FedEx联邦快递', url: 'https://www.fedex.com', icon: 'bi-send' },
                    { name: 'UPS', description: 'UPS快递服务', url: 'https://www.ups.com', icon: 'bi-truck-flatbed' }
                ]
            }
        ]
    },
    '亚马逊培训': {
        name: '亚马逊培训',
        description: '亚马逊卖家培训资源',
        categories: [
            {
                title: '培训课程',
                icon: 'bi-book',
                tools: [
                    { name: 'Amazon Seller University', description: '亚马逊卖家大学', url: 'https://sellercentral.amazon.com/learn', icon: 'bi-mortarboard' },
                    { name: 'Udemy Amazon Courses', description: 'Udemy亚马逊课程', url: 'https://www.udemy.com/courses/search/?q=amazon%20fba', icon: 'bi-play-circle' },
                    { name: 'Coursera E-commerce', description: 'Coursera电商课程', url: 'https://www.coursera.org/courses?query=e-commerce', icon: 'bi-journal-bookmark' }
                ]
            },
            {
                title: '社区论坛',
                icon: 'bi-people',
                tools: [
                    { name: 'Amazon Seller Forums', description: '亚马逊卖家论坛', url: 'https://sellercentral.amazon.com/forums', icon: 'bi-chat-square-text' },
                    { name: 'Reddit FBA', description: 'Reddit FBA社区', url: 'https://www.reddit.com/r/FulfillmentByAmazon', icon: 'bi-reddit' },
                    { name: 'Facebook Groups', description: 'Facebook卖家群组', url: 'https://www.facebook.com/groups', icon: 'bi-people-fill' }
                ]
            }
        ]
    },
    '亚马逊工具': {
        name: '亚马逊工具',
        description: '亚马逊专业工具集合',
        categories: [
            {
                title: '产品研究',
                icon: 'bi-search',
                tools: [
                    { name: 'Jungle Scout', description: '产品研究和市场分析', url: 'https://www.junglescout.com', icon: 'bi-binoculars-fill' },
                    { name: 'Viral Launch', description: '产品发现和优化', url: 'https://viral-launch.com', icon: 'bi-rocket' },
                    { name: 'AMZScout', description: '亚马逊产品分析', url: 'https://amzscout.net', icon: 'bi-graph-up' }
                ]
            },
            {
                title: '关键词优化',
                icon: 'bi-key',
                tools: [
                    { name: 'Helium 10', description: '关键词研究和优化', url: 'https://www.helium10.com', icon: 'bi-tools' },
                    { name: 'Cerebro', description: '反向ASIN查询', url: 'https://members.helium10.com/cerebro', icon: 'bi-brain' },
                    { name: 'MerchantWords', description: '亚马逊关键词数据库', url: 'https://www.merchantwords.com', icon: 'bi-database' }
                ]
            },
            {
                title: '库存管理',
                icon: 'bi-boxes',
                tools: [
                    { name: 'RestockPro', description: '库存补货管理', url: 'https://restockpro.com', icon: 'bi-arrow-repeat' },
                    { name: 'SoStocked', description: '智能库存规划', url: 'https://sostocked.com', icon: 'bi-stack' },
                    { name: 'Inventory Lab', description: '库存会计管理', url: 'https://inventorylab.com', icon: 'bi-clipboard-data' }
                ]
            }
        ]
    }
};

// 初始化快捷导航功能
function initQuickNavigation() {
    // 检查是否在管理页面
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) {
        return; // 在管理页面不执行快捷导航初始化
    }
    
    // 获取所有导航按钮
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // 为每个按钮添加点击事件监听器
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 获取按钮文本作为站点标识
            const siteName = this.textContent.trim();
            
            // 切换到对应站点
            switchToSite(siteName);
        });
    });
    
    // 注释掉这里的默认加载，因为我们在DOMContentLoaded中已经处理了
    // switchToSite('TradeLink');
}

// 切换到指定站点
async function switchToSite(siteName) {
    console.log('切换到站点:', siteName);
    
    // 检查是否在管理页面
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) {
        return; // 在管理页面不执行站点切换
    }
    
    // 获取站点数据
    const siteInfo = siteData[siteName];
    
    if (!siteInfo) {
        console.error('未找到站点数据:', siteName);
        showAlert(`暂未配置 ${siteName} 站点数据`, 'warning');
        return;
    }
    
    // 获取工具分类容器
    const toolCategoriesContainer = document.getElementById('tool-categories');
    if (!toolCategoriesContainer) {
        console.error('找不到工具分类容器');
        return;
    }
    
    // 清空容器
    toolCategoriesContainer.innerHTML = '';
    
    // 如果是TradeLink站点，从API获取并添加圆形导航卡片
    if (siteName === 'TradeLink') {
        try {
            const circularNavData = await loadQuickNavigationData();
            if (circularNavData && circularNavData.length > 0) {
                const circularNavContainer = createCircularNavigation(circularNavData);
                toolCategoriesContainer.appendChild(circularNavContainer);
            } else {
                // 如果API没有数据，使用默认数据作为备选
                if (siteInfo.circularNavigation) {
                    const circularNavContainer = createCircularNavigation(siteInfo.circularNavigation);
                    toolCategoriesContainer.appendChild(circularNavContainer);
                }
            }
        } catch (error) {
            console.error('加载快捷导航数据失败:', error);
            // 如果API请求失败，使用默认数据作为备选
            if (siteInfo.circularNavigation) {
                const circularNavContainer = createCircularNavigation(siteInfo.circularNavigation);
                toolCategoriesContainer.appendChild(circularNavContainer);
            }
        }
    }
    
    // 遍历站点分类并创建分类区块
    siteInfo.categories.forEach(category => {
        // 创建分类区块
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section mb-5';
        
        // 创建分类标题
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.innerHTML = `<i class="${category.icon}"></i> ${category.title}`;
        
        // 创建工具容器
        const toolsContainer = document.createElement('div');
        toolsContainer.className = 'tools-container';
        
        // 添加工具卡片
        if (category.tools && category.tools.length > 0) {
            category.tools.forEach(tool => {
                const toolCard = createSiteToolCard(tool);
                toolsContainer.appendChild(toolCard);
            });
        } else {
            // 如果没有工具，显示提示信息
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'text-muted';
            emptyMessage.textContent = '暂无工具';
            toolsContainer.appendChild(emptyMessage);
        }
        
        // 将分类标题和工具容器添加到分类区块
        categorySection.appendChild(categoryTitle);
        categorySection.appendChild(toolsContainer);
        
        // 将分类区块添加到主容器
        toolCategoriesContainer.appendChild(categorySection);
    });
    
    // 显示成功消息
    showAlert(`已切换到 ${siteInfo.name}`, 'success');
}

// 创建圆形导航卡片容器
// 从后台API加载快捷导航数据
async function loadQuickNavigationData() {
    try {
        // 使用api.js中的统一API配置
        const data = await api.get('/quick-navigation');
        
        // 将后台数据格式转换为前台需要的格式
        return data.map(item => ({
            name: item.name,
            icon: item.icon,
            url: item.url,
            logo: item.logo
        }));
    } catch (error) {
        console.error('加载快捷导航数据失败:', error);
        throw error;
    }
}

function createCircularNavigation(navigationData) {
    // 创建圆形导航容器
    const circularNavContainer = document.createElement('div');
    circularNavContainer.className = 'circular-nav-container mb-5';
    
    // 不再创建标题，直接显示导航列表
    
    // 创建UL列表
    const navList = document.createElement('ul');
    navList.className = 'circular-nav-list';
    
    // 遍历导航数据创建圆形卡片
    navigationData.forEach(navItem => {
        const listItem = document.createElement('li');
        
        // 创建导航项链接
        const navLink = document.createElement('a');
        navLink.className = 'circular-nav-item';
        navLink.href = navItem.url;
        navLink.target = '_blank'; // 在新窗口打开链接
        navLink.rel = 'noopener noreferrer'; // 安全性考虑
        
        // 创建圆形图标容器
        const iconContainer = document.createElement('div');
        iconContainer.className = 'circular-nav-icon';
        
        // 如果有logo，使用图片；否则使用Bootstrap图标
        if (navItem.logo) {
            const logoImg = document.createElement('img');
            logoImg.src = navItem.logo;
            logoImg.alt = navItem.name;
            logoImg.onerror = function() {
                // 如果图片加载失败，使用Bootstrap图标作为备选
                this.style.display = 'none';
                const fallbackIcon = document.createElement('i');
                fallbackIcon.className = navItem.icon || 'bi-link-45deg';
                iconContainer.appendChild(fallbackIcon);
            };
            iconContainer.appendChild(logoImg);
        } else {
            // 使用Bootstrap图标
            const icon = document.createElement('i');
            icon.className = navItem.icon || 'bi-link-45deg';
            iconContainer.appendChild(icon);
        }
        
        // 创建名称标签
        const nameLabel = document.createElement('div');
        nameLabel.className = 'circular-nav-name';
        nameLabel.textContent = navItem.name;
        
        // 组装导航项
        navLink.appendChild(iconContainer);
        navLink.appendChild(nameLabel);
        listItem.appendChild(navLink);
        navList.appendChild(listItem);
    });
    
    // 组装完整的圆形导航容器
    circularNavContainer.appendChild(navList);
    
    return circularNavContainer;
}

// 创建站点工具卡片
function createSiteToolCard(tool) {
    const toolCard = document.createElement('div');
    toolCard.className = 'tool-card';
    toolCard.setAttribute('data-name', tool.name.toLowerCase());
    toolCard.setAttribute('data-description', (tool.description || '').toLowerCase());
    
    // 创建卡片内容
    toolCard.innerHTML = `
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer">
            <div class="tool-icon">
                <i class="${tool.icon}"></i>
            </div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-desc">${tool.description || ''}</p>
            </div>
        </a>
    `;
    
    return toolCard;
}

// 加载分类和工具数据
async function loadCategoriesAndTools() {
    // 检查是否在管理页面
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) {
        return; // 在管理页面不执行
    }
    
    try {
        // 使用API获取所有分类及其工具
        const categories = await categoryApi.getAll();
        
        // 获取工具分类容器
        const toolCategoriesContainer = document.getElementById('tool-categories');
        if (!toolCategoriesContainer) {
            console.error('找不到工具分类容器');
            return;
        }
        
        // 清空容器
        toolCategoriesContainer.innerHTML = '';
        
        // 遍历分类并创建分类区块
        categories.forEach(category => {
            // 创建分类区块
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section mb-5';
            categorySection.id = `category-${category.id}`;
            
            // 创建分类标题
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.innerHTML = `<i class="${category.icon}"></i> ${category.title}`;
            
            // 创建工具容器
            const toolsContainer = document.createElement('div');
            toolsContainer.className = 'tools-container';
            
            // 添加工具卡片
            if (category.tools && category.tools.length > 0) {
                category.tools.forEach(tool => {
                    const toolCard = createToolCard(tool);
                    toolsContainer.appendChild(toolCard);
                });
            } else {
                // 如果没有工具，显示提示信息
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'text-muted';
                emptyMessage.textContent = '暂无工具';
                toolsContainer.appendChild(emptyMessage);
            }
            
            // 组装分类区块
            categorySection.appendChild(categoryTitle);
            categorySection.appendChild(toolsContainer);
            
            // 添加到主容器
            toolCategoriesContainer.appendChild(categorySection);
        });
        
        // 更新分类计数
        updateCategoryCounts(categories);
        
    } catch (error) {
        console.error('加载分类和工具数据失败:', error);
        showAlert('加载数据失败，请刷新页面重试', 'danger');
    }
}

// 创建工具卡片
function createToolCard(tool) {
    const toolCard = document.createElement('div');
    toolCard.className = 'tool-card';
    toolCard.setAttribute('data-id', tool.id);
    toolCard.setAttribute('data-name', tool.name.toLowerCase());
    toolCard.setAttribute('data-description', (tool.description || '').toLowerCase());
    
    // 创建卡片内容
    toolCard.innerHTML = `
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer">
            <div class="tool-icon">
                <i class="${tool.icon}"></i>
            </div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-desc">${tool.description || ''}</p>
            </div>
        </a>
    `;
    
    return toolCard;
}

// 更新分类计数
function updateCategoryCounts(categories) {
    const categoryCount = document.getElementById('category-count');
    const toolCount = document.getElementById('tool-count');
    
    if (categoryCount) {
        categoryCount.textContent = categories.length;
    }
    
    if (toolCount) {
        let totalTools = 0;
        categories.forEach(category => {
            if (category.tools) {
                totalTools += category.tools.length;
            }
        });
        toolCount.textContent = totalTools;
    }
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // 获取所有工具卡片
        const toolCards = document.querySelectorAll('.tool-card');
        
        // 如果搜索词为空，显示所有卡片和分类
        if (searchTerm === '') {
            toolCards.forEach(card => {
                card.style.display = '';
            });
            
            // 显示所有分类
            document.querySelectorAll('.category-section').forEach(section => {
                section.style.display = '';
            });
            
            return;
        }
        
        // 隐藏所有分类，后面会根据匹配结果显示
        document.querySelectorAll('.category-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // 过滤卡片
        toolCards.forEach(card => {
            const name = card.getAttribute('data-name');
            const description = card.getAttribute('data-description');
            
            // 如果名称或描述包含搜索词，显示卡片
            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = '';
                
                // 显示该卡片所在的分类
                const categorySection = card.closest('.category-section');
                if (categorySection) {
                    categorySection.style.display = '';
                }
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // 清除搜索按钮
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            // 触发input事件以更新显示
            searchInput.dispatchEvent(new Event('input'));
        });
    }
}

// 初始化主题切换
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // 检查本地存储中的主题设置
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    // 主题切换事件
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// 显示提示信息
// 统一的showAlert函数，避免重复定义
function showAlert(message, type = 'info') {
    // 移除已存在的提示框，防止重复显示
    const existingAlert = document.querySelector('.alert-custom');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 创建提示框元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
        border-radius: 8px;
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到页面
    document.body.appendChild(alertDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// 导出showAlert函数供其他模块使用
window.showAlert = showAlert;