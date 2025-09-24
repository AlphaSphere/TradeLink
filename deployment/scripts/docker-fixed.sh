#!/bin/bash

# 快捷导航系统 - 修复版Docker运行脚本

echo "=== 快捷导航系统 - Docker容器化部署 ==="

# 停止现有容器
docker stop navigation-app 2>/dev/null || true
docker rm navigation-app 2>/dev/null || true

# 使用Python官方镜像运行
echo "启动Docker容器..."
docker run -d \
    --name navigation-app \
    -p 8000:8000 \
    -p 5001:5001 \
    -v "$(pwd):/app" \
    -w /app \
    --restart unless-stopped \
    python:3.11-slim \
    bash -c "
        echo '=== 安装系统依赖 ==='
        apt-get update && apt-get install -y curl procps
        
        echo '=== 安装Python依赖 ==='
        pip install -r requirements.txt
        
        echo '=== 创建数据目录 ==='
        mkdir -p /app/data
        
        echo '=== 启动后端Flask服务 ==='
        cd /app/serve
        export FLASK_ENV=production
        python app.py &
        FLASK_PID=\$!
        
        echo '=== 等待后端服务启动 ==='
        sleep 5
        
        echo '=== 启动前端HTTP服务 ==='
        cd /app
        python -m http.server 8000 &
        HTTP_PID=\$!
        
        echo '=== 服务启动完成 ==='
        echo 'Flask PID:' \$FLASK_PID
        echo 'HTTP PID:' \$HTTP_PID
        
        # 保持容器运行
        wait
    "

echo "等待服务启动..."
sleep 15

# 检查容器状态
if docker ps | grep -q navigation-app; then
    echo "✓ Docker容器启动成功"
    
    # 检查服务状态
    echo "检查服务状态..."
    docker exec navigation-app curl -s http://localhost:5001/api/categories > /dev/null
    if [ $? -eq 0 ]; then
        echo "✓ 后端API服务正常"
    else
        echo "⚠ 后端API服务可能未完全启动，请稍等片刻"
    fi
    
    docker exec navigation-app curl -s http://localhost:8000/ > /dev/null
    if [ $? -eq 0 ]; then
        echo "✓ 前端HTTP服务正常"
    else
        echo "⚠ 前端HTTP服务可能未完全启动，请稍等片刻"
    fi
    
    echo ""
    echo "=== 🎉 部署成功！==="
    echo "前台页面：http://localhost:8000/index.html"
    echo "后台管理：http://localhost:8000/admin.html"
    echo "API接口：http://localhost:5001/api/"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看日志：docker logs navigation-app"
    echo "查看状态：docker ps"
    echo "进入容器：docker exec -it navigation-app bash"
    echo "停止服务：docker stop navigation-app"
    echo "重启服务：docker restart navigation-app"
    echo "删除容器：docker rm -f navigation-app"
else
    echo "✗ 容器启动失败"
    echo "查看错误日志："
    docker logs navigation-app
    exit 1
fi