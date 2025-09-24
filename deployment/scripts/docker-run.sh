#!/bin/bash

# 快捷导航系统 Docker 部署脚本
# 作者：AI助手
# 日期：2024年

echo "=== 快捷导航系统 Docker 部署脚本 ==="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误：Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo "错误：Docker未运行，请启动Docker Desktop"
    exit 1
fi

# 停止并删除现有容器
echo "1. 清理现有容器..."
docker stop navigation-app 2>/dev/null || true
docker rm navigation-app 2>/dev/null || true

# 构建镜像
echo "2. 构建Docker镜像..."
if docker build -t navigation-app:latest .; then
    echo "✓ 镜像构建成功"
else
    echo "✗ 镜像构建失败，尝试使用本地Dockerfile..."
    if docker build -f Dockerfile.local -t navigation-app:latest .; then
        echo "✓ 本地镜像构建成功"
    else
        echo "✗ 镜像构建失败，请检查网络连接"
        exit 1
    fi
fi

# 运行容器
echo "3. 启动容器..."
docker run -d \
    --name navigation-app \
    -p 8000:8000 \
    -p 5001:5001 \
    -v "$(pwd)/data:/app/data" \
    --restart unless-stopped \
    navigation-app:latest

# 检查容器状态
sleep 5
if docker ps | grep -q navigation-app; then
    echo "✓ 容器启动成功"
    echo ""
    echo "=== 访问地址 ==="
    echo "前台页面：http://localhost:8000/index.html"
    echo "后台管理：http://localhost:8000/admin.html"
    echo "API接口：http://localhost:5001/api/"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看日志：docker logs navigation-app"
    echo "停止服务：docker stop navigation-app"
    echo "重启服务：docker restart navigation-app"
    echo "删除容器：docker rm -f navigation-app"
else
    echo "✗ 容器启动失败"
    echo "查看错误日志："
    docker logs navigation-app
    exit 1
fi