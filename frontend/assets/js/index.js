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
    
    // 初始化语言切换功能
    initLanguageSwitcher();
});

// 语言配置数据
const languageConfig = {
    zh: {
        flag: '🇨🇳',
        name: '中文',
        shortName: '中',
        translations: {
            // 导航菜单
            home: '首页',
            hotTrends: '热榜&热点',
            hotTrendsShort: '热榜',
            globalNav: '全球导航',
            amazon: '亚马逊',
            sellerTools: '卖家工具',
            community: '社区&论坛',
            communityShort: '社区',
            logistics: '物流&海外仓',
            logisticsShort: '物流',
            crossBorder: '跨境电商',
            dataTools: '数据工具',
            toolbox: '工具箱',
            // 搜索和登录
            searchPlaceholder: '搜索工具或网站...',
            login: '登录',
            register: '注册',
            loginRegister: '登录/注册',
            member: '会员',
            // 时间显示
            usTime: '美东时间',
            usTimeShort: '美东',
            ukTime: '英国时间',
            ukTimeShort: '英国',
            deTime: '德国时间',
            deTimeShort: '德国',
            cnTime: '中国时间',
            cnTimeShort: '中国',
            // 主页内容
            navigationMenu: '导航菜单',
            searchPlaceholderMain: '输入关键词搜索...',
            baiduSearch: '百度',
            googleSearch: 'Google',
            bingSearch: 'Bing',
            yahooSearch: 'Yahoo',
            yandexSearch: 'Yandex',
            usTimeLabel: '美东时间: ',
            ukTimeLabel: '英国时间: ',
            deTimeLabel: '德国时间: ',
            cnTimeLabel: '中国时间: ',
            tradeLink: 'TradeLink',
            ebay: 'eBay',
            shopify: 'Shopify',
            tiktokShop: 'TikTok Shop',
            aliexpress: '速卖通',
            wish: 'Wish',
            crossBorderEcommerce: '跨境电商',
            amazonTraining: '亚马逊培训',
            amazonTools: '亚马逊工具',
            shareTitle: '分享',
            bookmarkTitle: '收藏',
            feedbackTitle: '反馈',
            // 侧边栏内容
            sidebarCategoriesTitle: '网站分类',
            sidebarCategoriesTitleShort: '分类',
            closeSidebar: '关闭侧边栏',
            homeRecommendation: '首页推荐',
            hotRecommendationTitle: '热门推荐',
            hotRecommendationTitleShort: '热门',
            hotWebsite: '热门网站',
            hotItem1Title: 'TradeLink研究院',
            hotItem1Desc: '亚马逊卖家必备',
            hotItem2Title: '卖家之家',
            hotItem2Desc: '跨境电商资讯平台'
        }
    },
    en: {
        flag: '🇺🇸',
        name: 'English',
        shortName: 'EN',
        translations: {
            // 导航菜单
            home: 'Home',
            hotTrends: 'Hot Trends',
            hotTrendsShort: 'Trends',
            globalNav: 'Global Nav',
            amazon: 'Amazon',
            sellerTools: 'Seller Tools',
            community: 'Community',
            communityShort: 'Community',
            logistics: 'Logistics',
            logisticsShort: 'Logistics',
            crossBorder: 'Cross-border',
            dataTools: 'Data Tools',
            toolbox: 'Toolbox',
            // 搜索和登录
            searchPlaceholder: 'Search tools or websites...',
            login: 'Login',
            register: 'Register',
            loginRegister: 'Login/Register',
            member: 'Member',
            // 时间显示
            usTime: 'US Time',
            usTimeShort: 'US',
            ukTime: 'UK Time',
            ukTimeShort: 'UK',
            deTime: 'DE Time',
            deTimeShort: 'DE',
            cnTime: 'CN Time',
            cnTimeShort: 'CN',
            // 主页内容
            navigationMenu: 'Navigation Menu',
            searchPlaceholderMain: 'Enter keywords to search...',
            baiduSearch: 'Baidu',
            googleSearch: 'Google',
            bingSearch: 'Bing',
            yahooSearch: 'Yahoo',
            yandexSearch: 'Yandex',
            usTimeLabel: 'US Time: ',
            ukTimeLabel: 'UK Time: ',
            deTimeLabel: 'DE Time: ',
            cnTimeLabel: 'CN Time: ',
            tradeLink: 'TradeLink',
            ebay: 'eBay',
            shopify: 'Shopify',
            tiktokShop: 'TikTok Shop',
            aliexpress: 'AliExpress',
            wish: 'Wish',
            crossBorderEcommerce: 'Cross-border E-commerce',
            amazonTraining: 'Amazon Training',
            amazonTools: 'Amazon Tools',
            shareTitle: 'Share',
            bookmarkTitle: 'Bookmark',
            feedbackTitle: 'Feedback',
            // 侧边栏内容
            sidebarCategoriesTitle: 'Categories',
            sidebarCategoriesTitleShort: 'Categories',
            closeSidebar: 'Close',
            homeRecommendation: 'Home',
            hotRecommendationTitle: 'Hot',
            hotRecommendationTitleShort: 'Hot',
            hotWebsite: 'Hot Site',
            hotItem1Title: 'TradeLink',
            hotItem1Desc: 'For Amazon Sellers',
            hotItem2Title: 'Seller Home',
            hotItem2Desc: 'E-commerce News'
        }
    }
};

// 初始化语言切换功能
function initLanguageSwitcher() {
    // 检查是否是首次访问（通过检查是否有访问标记）
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        // 首次访问，强制显示英文并标记已访问
        localStorage.setItem('hasVisited', 'true');
        localStorage.setItem('selectedLanguage', 'en');
        applyLanguage('en');
    } else {
        // 非首次访问，从本地存储获取保存的语言，默认为英文
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        applyLanguage(savedLanguage);
    }
}

// 切换语言函数
function switchLanguage(langCode, flag, name, shortName) {
    // 保存语言选择到本地存储
    localStorage.setItem('selectedLanguage', langCode);
    
    // 更新按钮显示
    updateLanguageButton(flag, name, shortName);
    
    // 应用语言翻译
    applyLanguage(langCode);
    
    // 显示切换成功提示
    const message = langCode === 'zh' ? '语言已切换为中文' : 'Language switched to English';
    showAlert(message, 'success');
}

// 更新语言按钮显示
function updateLanguageButton(flag, name, shortName) {
    const currentFlag = document.getElementById('currentFlag');
    const currentLanguage = document.getElementById('currentLanguage');
    const currentLanguageShort = document.getElementById('currentLanguageShort');
    
    if (currentFlag) currentFlag.textContent = flag;
    if (currentLanguage) currentLanguage.textContent = name;
    if (currentLanguageShort) currentLanguageShort.textContent = shortName;
}

// 应用语言翻译
function applyLanguage(langCode) {
    const config = languageConfig[langCode];
    if (!config) return;
    
    const translations = config.translations;
    
    // 更新语言按钮显示
    updateLanguageButton(config.flag, config.name, config.shortName);
    
    // 更新导航菜单文本
    updateElementText('[data-lang="home"]', translations.home);
    updateElementText('[data-lang="hotTrends"]', translations.hotTrends);
    updateElementText('[data-lang="hotTrendsShort"]', translations.hotTrendsShort);
    updateElementText('[data-lang="globalNav"]', translations.globalNav);
    updateElementText('[data-lang="amazon"]', translations.amazon);
    updateElementText('[data-lang="sellerTools"]', translations.sellerTools);
    updateElementText('[data-lang="community"]', translations.community);
    updateElementText('[data-lang="communityShort"]', translations.communityShort);
    updateElementText('[data-lang="logistics"]', translations.logistics);
    updateElementText('[data-lang="logisticsShort"]', translations.logisticsShort);
    updateElementText('[data-lang="crossBorder"]', translations.crossBorder);
    updateElementText('[data-lang="dataTools"]', translations.dataTools);
    updateElementText('[data-lang="toolbox"]', translations.toolbox);
    
    // 更新按钮和表单文本
    updateElementText('[data-lang="login"]', translations.login);
    updateElementText('[data-lang="register"]', translations.register);
    updateElementText('[data-lang="loginRegister"]', translations.loginRegister);
    updateElementText('[data-lang="member"]', translations.member);
    updatePlaceholder('[data-lang-placeholder="searchPlaceholder"]', translations.searchPlaceholder);
    
    // 更新时间标签
    updateElementText('[data-lang="usTime"]', translations.usTime);
    updateElementText('[data-lang="usTimeShort"]', translations.usTimeShort);
    updateElementText('[data-lang="ukTime"]', translations.ukTime);
    updateElementText('[data-lang="ukTimeShort"]', translations.ukTimeShort);
    updateElementText('[data-lang="deTime"]', translations.deTime);
    updateElementText('[data-lang="deTimeShort"]', translations.deTimeShort);
    updateElementText('[data-lang="cnTime"]', translations.cnTime);
    updateElementText('[data-lang="cnTimeShort"]', translations.cnTimeShort);
    
    // 更新主页内容翻译
    // 导航菜单标题
    updateElementText('[data-lang="navigationMenu"]', translations.navigationMenu);
    
    // 主搜索框占位符
    updatePlaceholder('[data-lang-placeholder="searchPlaceholderMain"]', translations.searchPlaceholderMain);
    
    // 搜索引擎按钮
    updateElementText('[data-lang="baiduSearch"]', translations.baiduSearch);
    updateElementText('[data-lang="googleSearch"]', translations.googleSearch);
    updateElementText('[data-lang="bingSearch"]', translations.bingSearch);
    updateElementText('[data-lang="yahooSearch"]', translations.yahooSearch);
    updateElementText('[data-lang="yandexSearch"]', translations.yandexSearch);
    
    // 时间显示标签
    updateElementText('[data-lang="usTimeLabel"]', translations.usTimeLabel);
    updateElementText('[data-lang="ukTimeLabel"]', translations.ukTimeLabel);
    updateElementText('[data-lang="deTimeLabel"]', translations.deTimeLabel);
    updateElementText('[data-lang="cnTimeLabel"]', translations.cnTimeLabel);
    
    // 快速导航按钮
    updateElementText('[data-lang="tradeLink"]', translations.tradeLink);
    updateElementText('[data-lang="ebay"]', translations.ebay);
    updateElementText('[data-lang="shopify"]', translations.shopify);
    updateElementText('[data-lang="tiktokShop"]', translations.tiktokShop);
    updateElementText('[data-lang="aliexpress"]', translations.aliexpress);
    updateElementText('[data-lang="wish"]', translations.wish);
    updateElementText('[data-lang="crossBorderEcommerce"]', translations.crossBorderEcommerce);
    updateElementText('[data-lang="amazonTraining"]', translations.amazonTraining);
    updateElementText('[data-lang="amazonTools"]', translations.amazonTools);
    
    // 侧边栏工具栏按钮标题
    updateTitle('[data-lang-title="shareTitle"]', translations.shareTitle);
    updateTitle('[data-lang-title="bookmarkTitle"]', translations.bookmarkTitle);
    updateTitle('[data-lang-title="feedbackTitle"]', translations.feedbackTitle);
    
    // 侧边栏内容翻译
    // 侧边栏标题
    updateElementText('[data-lang="sidebarCategoriesTitle"]', translations.sidebarCategoriesTitle);
    updateElementText('[data-lang="sidebarCategoriesTitleShort"]', translations.sidebarCategoriesTitleShort);
    updateTitle('[data-lang-title="closeSidebar"]', translations.closeSidebar);
    
    // 首页推荐
    updateElementText('[data-lang="homeRecommendation"]', translations.homeRecommendation);
    
    // 热门推荐
    updateElementText('[data-lang="hotRecommendationTitle"]', translations.hotRecommendationTitle);
    updateElementText('[data-lang="hotRecommendationTitleShort"]', translations.hotRecommendationTitleShort);
    updateTitle('[data-lang-title="hotWebsite"]', translations.hotWebsite);
    
    // 热门推荐项目
    updateElementText('[data-lang="hotItem1Title"]', translations.hotItem1Title);
    updateElementText('[data-lang="hotItem1Desc"]', translations.hotItem1Desc);
    updateElementText('[data-lang="hotItem2Title"]', translations.hotItem2Title);
    updateElementText('[data-lang="hotItem2Desc"]', translations.hotItem2Desc);
}

// 辅助函数：更新元素文本内容
function updateElementText(selector, text) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.textContent = text;
    });
}

// 辅助函数：更新输入框占位符
function updatePlaceholder(selector, text) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.placeholder = text;
    });
}

// 辅助函数：更新元素title属性
function updateTitle(selector, text) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.title = text;
    });
}

// 将语言切换函数暴露到全局作用域
window.switchLanguage = switchLanguage;

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
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    '亚马逊': {
        name: '亚马逊',
        description: '亚马逊卖家专用工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    'eBay': {
        name: 'eBay',
        description: 'eBay卖家专用工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    'Shopify': {
        name: 'Shopify',
        description: 'Shopify独立站工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    'TikTok Shop': {
        name: 'TikTok Shop',
        description: 'TikTok电商工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    '速卖通': {
        name: '速卖通',
        description: '速卖通卖家工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    'Wish': {
        name: 'Wish',
        description: 'Wish平台工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    '跨境电商': {
        name: '跨境电商',
        description: '跨境电商综合工具',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    '亚马逊培训': {
        name: '亚马逊培训',
        description: '亚马逊卖家培训资源',
        categories: []  // 空的fallback数据，优先使用后台API数据
    },
    '亚马逊工具': {
        name: '亚马逊工具',
        description: '亚马逊专业工具集合',
        categories: []  // 空的fallback数据，优先使用后台API数据
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
    
    // 为每个导航按钮添加点击事件
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const siteName = this.getAttribute('data-site');
        
            
            // 移除所有按钮的active类
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前按钮添加active类
            this.classList.add('active');
            
            // 切换到对应站点
            switchToSite(siteName);
        });
    });
    
    // 加载快捷导航数据
    loadQuickNavigationData();
}

// 切换到指定站点
async function switchToSite(siteName) {

    
    try {
        // 获取站点信息
        const siteInfo = siteData[siteName];
        if (!siteInfo) {
            console.error('未找到站点信息:', siteName);
            return;
        }
        
        // 更新页面标题和描述
        const titleElement = document.querySelector('.site-title');
        const descElement = document.querySelector('.site-description');
        
        if (titleElement) titleElement.textContent = siteInfo.name;
        if (descElement) descElement.textContent = siteInfo.description;
        
        // 获取主要内容容器
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到主内容容器');
            return;
        }
        
        // 清空现有内容
        mainContent.innerHTML = '';
        
        // 如果有圆形导航数据，创建圆形导航
        if (siteInfo.circularNavigation && siteInfo.circularNavigation.length > 0) {
            
            const circularNav = createCircularNavigation(siteInfo.circularNavigation);
            mainContent.appendChild(circularNav);
        }
        
        // 创建分类容器
        const categoriesContainer = document.createElement('div');
        categoriesContainer.id = 'categories-container';
        categoriesContainer.className = 'categories-container mt-4';
        mainContent.appendChild(categoriesContainer);
        
        // 处理分类数据
        // 修复：确保siteInfo.categories是数组
        if (!Array.isArray(siteInfo.categories)) {
            console.warn('siteInfo.categories不是数组类型:', siteInfo.categories);
            siteInfo.categories = []; // 设置为空数组作为fallback
        }
        
        siteInfo.categories.forEach((category, index) => {
            
            
            // 创建分类区域
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section mb-4';
            categorySection.id = `category-${category.id || index}`;
            
            // 创建分类标题
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title mb-3';
            categoryTitle.innerHTML = `<i class="bi ${category.icon || 'bi-folder'}"></i> ${category.name}`;
            categorySection.appendChild(categoryTitle);
            
            // 创建工具容器 - 使用ul元素
            const toolsContainer = document.createElement('ul');
            toolsContainer.className = 'tools-container list-unstyled';
            
            // 处理分类中的工具
            if (category.tools && category.tools.length > 0) {
                category.tools.forEach((tool, toolIndex) => {
                    
                    
                    // 创建工具卡片 - 使用li元素
                    const toolCard = createSiteToolCard(tool);
                    toolsContainer.appendChild(toolCard);
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
            
            categorySection.appendChild(toolsContainer);
            categoriesContainer.appendChild(categorySection);
        });
        
        
        
    } catch (error) {
        console.error('切换站点时出错:', error);
        showAlert('切换站点失败: ' + error.message, 'danger');
    }
}

// 加载快捷导航数据
async function loadQuickNavigationData() {
    try {
        
        
        // 获取API响应
        const response = await api.get('/quick-navigation');
        
        
        // 修复：正确访问API响应的data字段
        const quickNavData = response.data; // API包装后的数据在data字段中
        
        
        
        // 确保数据是数组
        if (!Array.isArray(quickNavData)) {
            throw new Error('快捷导航数据不是数组格式');
        }
        
        
        
        // 处理快捷导航数据...
        // 这里可以添加更多处理逻辑
        
    } catch (error) {
        console.error('加载快捷导航数据失败:', error);
        showAlert('加载快捷导航数据失败: ' + error.message, 'danger');
    }
}

function createCircularNavigation(navigationData) {
    
    
    const container = document.createElement('div');
    container.className = 'circular-nav-container mb-4';
    
    const title = document.createElement('h4');
    title.className = 'section-title mb-3';
    container.appendChild(title);
    
    const navGrid = document.createElement('ul');
    navGrid.className = 'circular-nav-list';
    
    navigationData.forEach((item, index) => {
        
        
        const navItem = document.createElement('li');
        navItem.className = 'circular-nav-item';
        
        navItem.innerHTML = `
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                <div class="circular-nav-icon">
                    ${item.icon && item.icon !== 'Logo' && !item.icon.startsWith('bi-') ? 
                        `<img src="${item.icon}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="icon-fallback" style="display: none;">Logo</div>` :
                        item.icon && item.icon.startsWith('bi-') ?
                        `<i class="bi ${item.icon}"></i>` :
                        `<div class="icon-fallback">Logo</div>`
                    }
                </div>
                <span class="circular-nav-name">${item.name}</span>
            </a>
        `;
        
        navGrid.appendChild(navItem);
    });
    
    container.appendChild(navGrid);
    
    
    return container;
}

// 创建站点工具卡片 - 长方形设计，使用li元素
function createSiteToolCard(tool) {
    const toolCard = document.createElement('li');
    toolCard.className = 'tool-card-item';
    
    toolCard.innerHTML = `
        <div class="tool-card">
            <a href="${tool.url}" target="_blank" class="text-decoration-none">
                <div class="tool-icon">
                    ${tool.icon && tool.icon !== 'Logo' && !tool.icon.startsWith('bi-') ? 
                        `<img src="${tool.icon}" alt="${tool.name}" style="width: 24px; height: 24px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                         <span style="display: none;">Logo</span>` :
                        tool.icon && tool.icon.startsWith('bi-') ?
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
    
    return toolCard;
}

// 等待createWebsiteCard函数加载完成的Promise
function waitForCreateWebsiteCard() {
    return new Promise((resolve, reject) => {
        // 如果函数已经存在，直接返回
        if (typeof window.createWebsiteCard === 'function') {
            resolve();
            return;
        }
        
        // 监听cardFunctionsLoaded事件
        const handleCardFunctionsLoaded = () => {
            if (typeof window.createWebsiteCard === 'function') {
                window.removeEventListener('cardFunctionsLoaded', handleCardFunctionsLoaded);
                resolve();
            }
        };
        
        window.addEventListener('cardFunctionsLoaded', handleCardFunctionsLoaded);
        
        // 设置超时，防止无限等待
        setTimeout(() => {
            window.removeEventListener('cardFunctionsLoaded', handleCardFunctionsLoaded);
            if (typeof window.createWebsiteCard === 'function') {
                resolve();
            } else {
                reject(new Error('createWebsiteCard函数加载超时'));
            }
        }, 10000); // 10秒超时
    });
}

// 新增函数：加载左侧导航分类
async function loadSidebarCategories() {
    
    
    try {
        // 等待DOM元素加载完成
        let attempts = 0;
        let sidebarCategories = null;
        
        while (!sidebarCategories && attempts < 20) {
            sidebarCategories = document.getElementById('sidebar-categories');
            if (!sidebarCategories) {
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        if (!sidebarCategories) {
            console.error('找不到sidebar-categories容器，跳过侧边栏分类加载');
            return;
        }
        
        
        
        // 获取分类数据
        const response = await api.get('/categories');
        // 修复：API直接返回数组，不是包装在data字段中
        const categories = response.data; // response.data就是API返回的数组
        if (!categories || !Array.isArray(categories)) {
            throw new Error('API返回的数据格式不正确');
        }
        
        
        
        // 清空现有的分类项（保留首页推荐）
        const existingItems = sidebarCategories.querySelectorAll('li:not(.home-item)');
        existingItems.forEach(item => item.remove());
        
        
        // 添加新的分类项
        categories.forEach((category, index) => {
            
            
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="#category-${category.id}" class="nav-link" data-category-id="${category.id}">
                    <i class="bi ${category.icon || 'bi-folder'}"></i>
                    <span>${category.title}</span>
                </a>
            `;
            
            // 添加点击事件，实现平滑滚动
            const link = listItem.querySelector('a');
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetElement = document.getElementById(`category-${category.id}`);
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新导航状态
                    document.querySelectorAll('#sidebar-categories .nav-link').forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    link.classList.add('active');
                }
            });
            
            sidebarCategories.appendChild(listItem);
        });
        
        
        
    } catch (error) {
        console.error('加载侧边栏分类失败:', error);
        throw error;
    }
}

// 注意：loadCategoriesAndTools函数已移至api.js
// 这里不再重复定义，直接使用api.js中的函数

// 更新分类计数
function updateCategoryCounts(categories) {
    // 修复：确保categories是数组类型
    if (!Array.isArray(categories)) {
        console.warn('updateCategoryCounts: categories不是数组类型:', categories);
        return; // 如果不是数组，直接返回，避免错误
    }
    
    const categoryCount = document.getElementById('category-count');
    const toolCount = document.getElementById('tool-count');
    
    if (categoryCount) {
        categoryCount.textContent = categories.length;
    }
    
    if (toolCount) {
        let totalTools = 0;
        categories.forEach(category => {
            if (category.tools && Array.isArray(category.tools)) {
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