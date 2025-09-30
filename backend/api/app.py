from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sqlite3
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid
import time

# 加载环境变量 - 更新配置文件路径
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config', '.env'))

# 创建Flask应用
app = Flask(__name__)
# 配置CORS，允许所有来源和方法，包括缓存控制头
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
                            "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"]}},
     supports_credentials=True)

# 配置文件上传
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'assets', 'uploads', 'website-icons', 'logos')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

import logging

# 配置日志记录
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 获取数据库连接
def get_db_connection():
    """
    获取数据库连接 - 更新数据库文件路径
    """
    try:
        # 更新数据库文件路径，指向新的database目录
        db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'navigation.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 使查询结果可以像字典一样访问
        return conn
    except Exception as e:
        logger.error(f"数据库连接错误: {e}")
        return None

# 初始化数据库表结构
def init_db():
    """
    初始化数据库表结构
    """
    conn = get_db_connection()
    if not conn:
        logger.error("无法连接到数据库，请检查配置")
        return
    
    cursor = conn.cursor()
    try:
        # 创建分类表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT,
            icon TEXT DEFAULT 'bi-folder',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # 创建工具表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_en TEXT,
            description TEXT,
            description_en TEXT,
            icon TEXT DEFAULT 'bi-link',
            url TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
        ''')
        
        # 创建快捷导航表
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS quick_navigation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT DEFAULT 'bi-link',
            url TEXT NOT NULL,
            logo TEXT,
            sort_order INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        logger.info("数据库表结构初始化完成")
    except Exception as e:
        logger.error(f"初始化数据库表结构错误: {e}")
    finally:
        cursor.close()
        conn.close()

# 导入初始数据
def import_initial_data():
    """
    导入初始数据到数据库
    """
    conn = get_db_connection()
    if not conn:
        logger.error("无法连接到数据库，无法导入初始数据")
        return
    
    cursor = conn.cursor()
    try:
        # 检查是否已有数据
        cursor.execute("SELECT COUNT(*) FROM categories")
        count = cursor.fetchone()[0]
        
        if count > 0:
            logger.info("数据库中已有数据，跳过初始化")
            return
            
        # 添加一些默认分类
        categories = [
            ("常用工具", "bi-tools"),
            ("开发资源", "bi-code-square"),
            ("设计工具", "bi-palette"),
            ("数据分析", "bi-bar-chart")
        ]
        
        for title, icon in categories:
            cursor.execute("INSERT INTO categories (title, icon) VALUES (?, ?)", (title, icon))
        
        # 添加一些默认工具
        tools = [
            ("Google", "搜索引擎", "bi-google", "https://www.google.com", 1),
            ("GitHub", "代码托管平台", "bi-github", "https://github.com", 2),
            ("Stack Overflow", "程序员问答社区", "bi-stack-overflow", "https://stackoverflow.com", 2),
            ("Figma", "在线设计工具", "bi-palette", "https://www.figma.com", 3),
            ("Google Analytics", "网站分析工具", "bi-graph-up", "https://analytics.google.com", 4)
        ]
        
        for name, description, icon, url, category_id in tools:
            cursor.execute("INSERT INTO tools (name, description, icon, url, category_id) VALUES (?, ?, ?, ?, ?)", 
                         (name, description, icon, url, category_id))
        
        # 添加默认快捷导航数据
        quick_nav_items = [
            ("Amazon", "bi-shop", "https://www.amazon.com", "https://logo.clearbit.com/amazon.com", 1),
            ("eBay", "bi-bag", "https://www.ebay.com", "https://logo.clearbit.com/ebay.com", 2),
            ("Shopify", "bi-cart", "https://www.shopify.com", "https://logo.clearbit.com/shopify.com", 3),
            ("AliExpress", "bi-lightning", "https://www.aliexpress.com", "https://logo.clearbit.com/aliexpress.com", 4),
            ("Wish", "bi-star", "https://www.wish.com", "https://logo.clearbit.com/wish.com", 5),
            ("Etsy", "bi-heart", "https://www.etsy.com", "https://logo.clearbit.com/etsy.com", 6),
            ("Walmart", "bi-house", "https://www.walmart.com", "https://logo.clearbit.com/walmart.com", 7),
            ("Target", "bi-bullseye", "https://www.target.com", "https://logo.clearbit.com/target.com", 8),
            ("Google Ads", "bi-google", "https://ads.google.com", "https://logo.clearbit.com/google.com", 9),
            ("Facebook Ads", "bi-facebook", "https://business.facebook.com", "https://logo.clearbit.com/facebook.com", 10),
            ("PayPal", "bi-paypal", "https://www.paypal.com", "https://logo.clearbit.com/paypal.com", 11),
            ("Stripe", "bi-credit-card", "https://stripe.com", "https://logo.clearbit.com/stripe.com", 12)
        ]
        
        for name, icon, url, logo, sort_order in quick_nav_items:
            cursor.execute("INSERT INTO quick_navigation (name, icon, url, logo, sort_order) VALUES (?, ?, ?, ?, ?)", 
                         (name, icon, url, logo, sort_order))
        
        conn.commit()
        logger.info("初始数据导入成功")
    except Exception as e:
        conn.rollback()
        logger.error(f"导入初始数据失败: {e}")
    finally:
        cursor.close()
        conn.close()

# API路由 - 获取所有分类
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """
    获取所有分类及其工具
    """
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # 获取所有分类
            cursor.execute("SELECT * FROM categories ORDER BY title")
            categories = []
            for row in cursor.fetchall():
                category = dict(row)
                category['tools'] = []
                categories.append(category)
            
            # 获取所有工具
            cursor.execute("SELECT * FROM tools")
            tools = [dict(row) for row in cursor.fetchall()]
            
            # 将工具分配到对应的分类中
            for category in categories:
                for tool in tools:
                    if tool['category_id'] == category['id']:
                        category['tools'].append(tool)
            
            return jsonify(categories)
        except Exception as e:
            return jsonify({"error": f"获取数据失败: {str(e)}"}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "数据库连接失败"}), 500

# API路由 - 添加分类
@app.route('/api/categories', methods=['POST'])
def add_category():
    """
    添加新分类
    """
    data = request.json
    
    # 验证必要字段
    if not data or 'title' not in data:
        return jsonify({"error": "缺少必要字段"}), 400
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # 插入新分类，包含英文名称字段
            query = "INSERT INTO categories (title, title_en, icon) VALUES (?, ?, ?)"
            values = (data['title'], data.get('title_en', ''), data.get('icon', 'bi-folder'))
            
            cursor.execute(query, values)
            connection.commit()
            category_id = cursor.lastrowid
            
            return jsonify({"id": category_id, "message": "分类添加成功"})
        except Exception as e:
            connection.rollback()
            return jsonify({"error": f"添加分类失败: {str(e)}"}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "数据库连接失败"}), 500

# API路由 - 获取所有工具
@app.route('/api/tools', methods=['GET'])
def get_tools():
    """
    获取所有工具列表
    """
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # 获取所有工具及其分类信息
            query = """
            SELECT t.id, t.name, t.url, t.description, t.icon, t.category_id,
                   c.title as category_title, c.icon as category_icon
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY c.title, t.name
            """
            
            cursor.execute(query)
            tools = cursor.fetchall()
            
            # 转换为字典格式
            tools_list = []
            for tool in tools:
                tools_list.append({
                    "id": tool["id"],
                    "name": tool["name"],
                    "url": tool["url"],
                    "description": tool["description"],
                    "icon": tool["icon"],
                    "category_id": tool["category_id"],
                    "category_title": tool["category_title"],
                    "category_icon": tool["category_icon"]
                })
            
            return jsonify(tools_list)
        except Exception as e:
            return jsonify({"error": f"获取工具列表失败: {str(e)}"}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "数据库连接失败"}), 500

# API路由 - 添加工具
@app.route('/api/tools', methods=['POST'])
def add_tool():
    """
    添加新工具
    """
    data = request.json
    
    # 验证必要字段
    if not data or 'name' not in data or 'url' not in data or 'category_id' not in data:
        return jsonify({"error": "缺少必要字段"}), 400
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # 检查分类是否存在
            cursor.execute("SELECT id FROM categories WHERE id = ?", (data['category_id'],))
            category = cursor.fetchone()
            if not category:
                return jsonify({"error": "指定的分类不存在"}), 400
            
            # 插入新工具，包含英文名称和英文描述字段
            query = """
            INSERT INTO tools (category_id, name, name_en, url, description, description_en, icon) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            values = (
                data['category_id'],
                data['name'],
                data.get('name_en', ''),
                data['url'],
                data.get('description', ''),
                data.get('description_en', ''),
                data.get('icon', 'bi-link')
            )
            
            cursor.execute(query, values)
            connection.commit()
            tool_id = cursor.lastrowid
            
            return jsonify({"id": tool_id, "message": "工具添加成功"})
        except Exception as e:
            connection.rollback()
            return jsonify({"error": f"添加工具失败: {str(e)}"}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "数据库连接失败"}), 500

# API路由 - 删除分类
@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """
    删除指定分类
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    cursor = conn.cursor()
    try:
        # 检查分类是否存在
        cursor.execute("SELECT id FROM categories WHERE id = ?", (category_id,))
        category = cursor.fetchone()
        if not category:
            return jsonify({"error": "指定的分类不存在"}), 404
            
        # 先删除该分类下的所有工具
        cursor.execute("DELETE FROM tools WHERE category_id = ?", (category_id,))
        
        # 再删除分类
        cursor.execute("DELETE FROM categories WHERE id = ?", (category_id,))
        conn.commit()
        
        return jsonify({"message": "分类删除成功"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"删除错误: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# API路由 - 删除工具
@app.route('/api/tools/<int:tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    """
    删除指定工具
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
        conn.commit()
        
        # SQLite不支持rowcount，所以我们不检查
        return jsonify({"message": "工具删除成功"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"删除错误: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# API路由 - 更新分类
@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """
    更新指定分类
    """
    data = request.json
    
    # 验证必要字段
    if not data or 'title' not in data:
        return jsonify({"error": "缺少必要字段"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    cursor = conn.cursor()
    try:
        # 检查分类是否存在
        cursor.execute("SELECT id FROM categories WHERE id = ?", (category_id,))
        category = cursor.fetchone()
        if not category:
            return jsonify({"error": "指定的分类不存在"}), 404
            
        # 更新分类，包含英文名称字段
        query = "UPDATE categories SET title = ?, title_en = ?, icon = ? WHERE id = ?"
        values = (data['title'], data.get('title_en', ''), data.get('icon', 'bi-folder'), category_id)
        
        cursor.execute(query, values)
        conn.commit()
        
        return jsonify({"message": "分类更新成功"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"更新错误: {e}"}), 500
    finally:
        cursor.close()
        conn.close()
        
# API路由 - 更新工具
@app.route('/api/tools/<int:tool_id>', methods=['PUT'])
def update_tool(tool_id):
    """
    更新指定工具
    """
    data = request.json
    
    # 验证必要字段
    if not data or 'name' not in data or 'url' not in data or 'category_id' not in data:
        return jsonify({"error": "缺少必要字段"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    cursor = conn.cursor()
    try:
        # 检查工具是否存在
        cursor.execute("SELECT id FROM tools WHERE id = ?", (tool_id,))
        tool = cursor.fetchone()
        if not tool:
            return jsonify({"error": "指定的工具不存在"}), 404
            
        # 检查分类是否存在
        cursor.execute("SELECT id FROM categories WHERE id = ?", (data['category_id'],))
        category = cursor.fetchone()
        if not category:
            return jsonify({"error": "指定的分类不存在"}), 400
            
        # 更新工具，包含英文名称和英文描述字段
        query = """
        UPDATE tools 
        SET name = ?, name_en = ?, description = ?, description_en = ?, icon = ?, url = ?, category_id = ?
        WHERE id = ?
        """
        values = (
            data['name'],
            data.get('name_en', ''),
            data.get('description', ''),
            data.get('description_en', ''),
            data.get('icon', 'bi-link'),
            data['url'],
            data['category_id'],
            tool_id
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        return jsonify({"message": "工具更新成功"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"更新错误: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# ==================== 快捷导航管理API ====================

@app.route('/api/quick-navigation', methods=['GET'])
def get_quick_navigation():
    """
    获取所有快捷导航项
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quick_navigation ORDER BY sort_order ASC, id ASC")
        navigation_items = cursor.fetchall()
        
        # 转换为字典列表
        result = []
        for item in navigation_items:
            result.append({
                "id": item["id"],
                "name": item["name"],
                "icon": item["icon"],
                "url": item["url"],
                "logo": item["logo"],
                "sort_order": item["sort_order"],
                "status": item["status"],
                "created_at": item["created_at"],
                "updated_at": item["updated_at"]
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"获取快捷导航失败: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/quick-navigation', methods=['POST'])
def add_quick_navigation():
    """
    添加新的快捷导航项
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    try:
        data = request.get_json()
        
        # 验证必填字段
        if not data.get('name') or not data.get('url'):
            return jsonify({"error": "名称和URL是必填字段"}), 400
        
        cursor = conn.cursor()
        
        # 获取最大排序值
        cursor.execute("SELECT MAX(sort_order) FROM quick_navigation")
        max_sort = cursor.fetchone()[0] or 0
        
        # 插入新记录
        cursor.execute("""
            INSERT INTO quick_navigation (name, icon, url, logo, sort_order, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data.get('icon', 'bi-link'),
            data['url'],
            data.get('logo', ''),
            data.get('sort_order', max_sort + 1),
            data.get('status', 'active')
        ))
        
        conn.commit()
        
        # 获取新插入的记录
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM quick_navigation WHERE id = ?", (new_id,))
        new_item = cursor.fetchone()
        
        return jsonify({
            "message": "快捷导航添加成功",
            "navigation": dict(new_item)
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"添加快捷导航失败: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/quick-navigation/<int:nav_id>', methods=['PUT'])
def update_quick_navigation(nav_id):
    """
    更新快捷导航项
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    try:
        data = request.get_json()
        
        # 验证必填字段
        if not data.get('name') or not data.get('url'):
            return jsonify({"error": "名称和URL是必填字段"}), 400
        
        cursor = conn.cursor()
        
        # 检查记录是否存在
        cursor.execute("SELECT * FROM quick_navigation WHERE id = ?", (nav_id,))
        existing_item = cursor.fetchone()
        
        if not existing_item:
            return jsonify({"error": "快捷导航项不存在"}), 404
        
        # 更新记录
        cursor.execute("""
            UPDATE quick_navigation 
            SET name = ?, icon = ?, url = ?, logo = ?, sort_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            data['name'],
            data.get('icon', existing_item['icon']),
            data['url'],
            data.get('logo', existing_item['logo']),
            data.get('sort_order', existing_item['sort_order']),
            data.get('status', existing_item['status']),
            nav_id
        ))
        
        conn.commit()
        
        # 获取更新后的记录
        cursor.execute("SELECT * FROM quick_navigation WHERE id = ?", (nav_id,))
        updated_item = cursor.fetchone()
        
        return jsonify({
            "message": "快捷导航更新成功",
            "navigation": dict(updated_item)
        })
        
    except Exception as e:
        return jsonify({"error": f"更新快捷导航失败: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/quick-navigation/<int:nav_id>', methods=['DELETE'])
def delete_quick_navigation(nav_id):
    """
    删除快捷导航项
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    try:
        cursor = conn.cursor()
        
        # 检查记录是否存在
        cursor.execute("SELECT * FROM quick_navigation WHERE id = ?", (nav_id,))
        existing_item = cursor.fetchone()
        
        if not existing_item:
            return jsonify({"error": "快捷导航项不存在"}), 404
        
        # 删除记录
        cursor.execute("DELETE FROM quick_navigation WHERE id = ?", (nav_id,))
        conn.commit()
        
        return jsonify({"message": "快捷导航删除成功"})
        
    except Exception as e:
        return jsonify({"error": f"删除快捷导航失败: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/api/quick-navigation/reorder', methods=['POST'])
def reorder_quick_navigation():
    """
    重新排序快捷导航项
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "数据库连接失败"}), 500
    
    try:
        data = request.get_json()
        navigation_ids = data.get('navigation_ids', [])
        
        if not navigation_ids:
            return jsonify({"error": "导航项ID列表不能为空"}), 400
        
        cursor = conn.cursor()
        
        # 更新排序
        for index, nav_id in enumerate(navigation_ids):
            cursor.execute("""
                UPDATE quick_navigation 
                SET sort_order = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            """, (index + 1, nav_id))
        
        conn.commit()
        
        return jsonify({"message": "快捷导航排序更新成功"})
        
    except Exception as e:
        return jsonify({"error": f"更新排序失败: {str(e)}"}), 500
    finally:
        conn.close()

def allowed_file(filename):
    """
    检查文件扩展名是否被允许
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-icon', methods=['POST'])
def upload_icon():
    """
    上传图标文件
    """
    try:
        # 检查是否有文件被上传
        if 'file' not in request.files:
            return jsonify({"error": "没有选择文件"}), 400
        
        file = request.files['file']
        
        # 检查文件名是否为空
        if file.filename == '':
            return jsonify({"error": "没有选择文件"}), 400
        
        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({"error": "不支持的文件类型，请上传 PNG、JPG、JPEG、GIF、SVG 或 WEBP 格式的图片"}), 400
        
        # 生成安全的文件名并安全提取扩展名（兼容无扩展名文件）
        filename = secure_filename(file.filename or '')
        name_part, ext_part = os.path.splitext(filename)
        file_extension = ext_part.lower().lstrip('.')

        # 若无扩展名，尝试根据MIME类型推断
        if not file_extension:
            mime = getattr(file, 'mimetype', '')
            mime_map = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/gif': 'gif',
                'image/svg+xml': 'svg',
                'image/webp': 'webp'
            }
            file_extension = mime_map.get(mime, '')

        # 再次校验扩展名是否允许
        if not file_extension or file_extension not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "不支持的文件类型，请上传 PNG、JPG、JPEG、GIF、SVG 或 WEBP 格式的图片"}), 400
        
        # 生成唯一的文件名，避免冲突
        unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{file_extension}"
        
        # 保存文件
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # 返回文件的相对URL路径
        icon_url = f"/assets/uploads/website-icons/logos/{unique_filename}"
        
        return jsonify({
            "message": "图标上传成功",
            "icon_url": icon_url,
            "filename": unique_filename
        }), 200
        
    except Exception as e:
        logger.error(f"图标上传失败: {e}")
        return jsonify({"error": f"图标上传失败: {str(e)}"}), 500

# 主函数
if __name__ == '__main__':
    # 初始化数据库并导入初始数据
    init_db()
    import_initial_data()
    
    # 获取端口号，固定使用5001端口（与Docker配置保持一致）
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    
    # 启动Flask应用，绑定到0.0.0.0以允许外部访问
    # 生产环境中应该设置debug=False
    app.run(debug=False, host='0.0.0.0', port=port)