# 数据库文档

## 数据库概述

本项目使用SQLite作为数据库，提供轻量级的数据存储解决方案。

SQLite数据库文件位于 `backend/database/navigation.db`。

## 数据库配置

- 数据库类型：SQLite
- 数据库文件路径：`backend/database/navigation.db`
- 字符编码：UTF-8
- 连接池：无需配置（SQLite为文件数据库）

## 数据表结构

### 1. categories（分类表）
存储工具分类信息。

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明：**
- `id`: 分类ID（主键，自增）
- `title`: 分类名称
- `icon`: 分类图标（Bootstrap图标类名）
- `created_at`: 创建时间

### 2. tools（工具表）
存储各种工具网站信息。

```sql
CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    url TEXT NOT NULL,
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);
```

**字段说明：**
- `id`: 工具ID（主键，自增）
- `name`: 工具名称
- `description`: 工具描述
- `icon`: 工具图标（Bootstrap图标类名）
- `url`: 工具链接
- `category_id`: 所属分类ID（外键）
- `created_at`: 创建时间

### 3. quick_navigation（快捷导航表）
存储快捷导航按钮信息。

```sql
CREATE TABLE quick_navigation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    url TEXT NOT NULL,
    logo TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明：**
- `id`: 导航ID（主键，自增）
- `name`: 导航名称
- `icon`: 导航图标（Bootstrap图标类名）
- `url`: 导航链接
- `logo`: 导航logo图片URL
- `sort_order`: 排序顺序
- `created_at`: 创建时间

## 初始数据

初始数据导入逻辑位于 `backend/api/app.py` 文件的 `import_initial_data()` 函数中。

### 默认分类数据
- 常用工具（bi-tools）
- 开发资源（bi-code-square）
- 设计工具（bi-palette）
- 数据分析（bi-bar-chart）

### 默认工具数据
- Google（搜索引擎）
- GitHub（代码托管平台）
- Stack Overflow（程序员问答社区）
- Figma（在线设计工具）
- Google Analytics（网站分析工具）

### 默认快捷导航数据
包含Amazon、eBay、Shopify等12个电商平台的快捷导航。

## 数据库操作

### 连接数据库
```python
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'navigation.db')
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"数据库连接失败: {e}")
        return None
```

### 初始化数据库
数据库表结构会在应用启动时自动创建，如果表不存在的话。

## 数据库管理

### 查看数据库
SQLite数据库文件（navigation.db）可以使用以下工具进行查看和编辑：

- **DB Browser for SQLite**：图形化界面工具
- **SQLite命令行**：使用`sqlite3 backend/database/navigation.db`命令打开数据库
- **VS Code插件**：SQLite Viewer等插件

### 备份数据库
建议定期备份数据库文件（navigation.db），可以简单地复制该文件到安全位置。

### 数据库迁移
如需修改数据库结构，建议：
1. 备份现有数据库
2. 修改`init_db()`函数中的表结构
3. 测试新结构的兼容性
4. 如需要，编写数据迁移脚本