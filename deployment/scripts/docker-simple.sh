#!/bin/bash

# 快捷导航系统 - 简化Docker运行脚本
# 直接在容器中运行现有的Python服务

echo "=== 快捷导航系统 - 简化部署 ==="

# 停止现有容器
docker stop navigation-simple 2>/dev/null || true
docker rm navigation-simple 2>/dev/null || true

# 使用Python官方镜像直接运行
echo "启动容器..."
docker run -d \
    --name navigation-simple \
    -p 8000:8000 \
    -p 5001:5001 \
    -v "$(pwd):/app" \
    -w /app \
    python:3.11-slim \
    bash -c "
        # 安装依赖
        pip install -r requirements.txt
        
        # 启动后端服务
        cd serve && python app.py &
        
        # 等待后端启动
        sleep 3
        
        # 启动前端服务
        cd /app && python -m http.server 8000
    "

echo "等待服务启动..."
sleep 10

# 检查服务状态
if docker ps | grep -q navigation-simple; then
    echo "✓ 服务启动成功"
    echo ""
    echo "访问地址："
    echo "前台：http://localhost:8000/index.html"
    echo "后台：http://localhost:8000/admin.html"
    echo ""
    echo "管理命令："
    echo "查看日志：docker logs navigation-simple"
    echo "停止服务：docker stop navigation-simple"
else
    echo "✗ 服务启动失败"
    docker logs navigation-simple
fi