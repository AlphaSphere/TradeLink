# 使用官方Python 3.11运行时作为基础镜像（更稳定的版本）
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=backend/api/app.py \
    FLASK_ENV=production

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt并安装Python依赖
COPY backend/config/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 创建数据目录并设置权限
RUN mkdir -p /app/backend/database && \
    chmod 755 /app/backend/database

# 设置入口脚本权限
RUN chmod +x /app/deployment/scripts/docker-entrypoint.sh

# 暴露端口
EXPOSE 5001 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/ && curl -f http://localhost:5001/api/categories || exit 1

# 启动命令
CMD ["/app/deployment/scripts/docker-entrypoint.sh"]