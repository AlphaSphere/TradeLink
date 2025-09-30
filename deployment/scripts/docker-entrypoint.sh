#!/bin/bash
set -e

# 颜色输出函数
print_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

print_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# 检查数据库目录
if [ ! -d "/app/data" ]; then
    print_info "创建数据目录..."
    mkdir -p /app/data
fi

# 设置数据目录权限
chmod 755 /app/data

# 检查环境变量
FLASK_ENV=${FLASK_ENV:-production}
print_info "运行环境: $FLASK_ENV"

# 初始化数据库（如果需要）
print_info "检查数据库状态..."
cd /app/backend/api
python -c "
import sys
sys.path.append('/app/backend/api')
from app import init_db
try:
    init_db()
    print('数据库初始化完成')
except Exception as e:
    print(f'数据库初始化失败: {e}')
    sys.exit(1)
"

# 启动后端服务
print_info "启动Flask后端服务..."
if [ "$FLASK_ENV" = "production" ]; then
    # 生产环境使用gunicorn
    gunicorn --bind 0.0.0.0:5001 --workers 2 --timeout 120 --access-logfile - --error-logfile - app:app &
else
    # 开发环境使用Flask开发服务器
    python app.py &
fi

BACKEND_PID=$!
print_info "后端服务PID: $BACKEND_PID"

# 等待后端服务启动
print_info "等待后端服务启动..."
sleep 5

# 检查后端服务是否正常
for i in {1..10}; do
    if curl -f http://localhost:5001/api/categories >/dev/null 2>&1; then
        print_info "后端服务启动成功"
        break
    fi
    if [ $i -eq 10 ]; then
        print_error "后端服务启动失败"
        exit 1
    fi
    print_warning "等待后端服务启动... ($i/10)"
    sleep 2
done

# 启动前端服务
print_info "启动前端HTTP服务..."
cd /app/frontend
# 创建一个临时的Python HTTP服务器脚本，实现根目录重定向
cat > temp_server.py << 'EOF'
import http.server
import socketserver
from urllib.parse import urlparse
import os

class RedirectHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 如果访问根目录，重定向到 /pages/index.html
        if self.path == '/' or self.path == '':
            self.send_response(302)
            self.send_header('Location', '/pages/index.html')
            self.end_headers()
            return
        # 其他请求正常处理
        super().do_GET()

PORT = 8000
with socketserver.TCPServer(("", PORT), RedirectHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()
EOF

python temp_server.py &
FRONTEND_PID=$!
print_info "前端服务PID: $FRONTEND_PID"

# 等待前端服务启动
sleep 3

# 检查前端服务是否正常
if curl -f http://localhost:8000/ >/dev/null 2>&1; then
    print_info "前端服务启动成功"
else
    print_error "前端服务启动失败"
    exit 1
fi

print_info "所有服务启动完成！"
print_info "前端访问地址: http://localhost:8000"
print_info "后端API地址: http://localhost:5001"

# 优雅关闭处理
cleanup() {
    print_info "正在关闭服务..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_info "服务已关闭"
    exit 0
}

trap cleanup SIGTERM SIGINT

# 保持容器运行
wait