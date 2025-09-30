#!/bin/bash

# 导航系统Docker停止脚本
# 作者: Navigation System Team
# 版本: 1.0.0
# 描述: 安全停止Docker容器化的导航系统

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 停止Docker服务
stop_docker_services() {
    log_info "停止Docker服务..."
    
    cd "$PROJECT_ROOT/deployment/docker" || {
        log_error "无法进入Docker配置目录"
        exit 1
    }
    
    # 使用docker-compose停止服务
    if docker-compose down; then
        log_success "Docker服务已停止"
    else
        log_warning "docker-compose停止失败，尝试手动停止容器..."
        
        # 手动停止容器
        if docker ps --format "table {{.Names}}" | grep -q "navigation-app"; then
            log_info "停止navigation-app容器..."
            docker stop navigation-app
            docker rm navigation-app
        fi
        
        if docker ps --format "table {{.Names}}" | grep -q "navigation-nginx"; then
            log_info "停止navigation-nginx容器..."
            docker stop navigation-nginx
            docker rm navigation-nginx
        fi
    fi
    
    cd "$PROJECT_ROOT"
}

# 清理Docker资源
cleanup_docker_resources() {
    log_info "清理Docker资源..."
    
    # 删除网络（如果存在且未被使用）
    if docker network ls --format "table {{.Name}}" | grep -q "navigation_navigation-network"; then
        log_info "删除Docker网络..."
        docker network rm navigation_navigation-network >/dev/null 2>&1 || true
    fi
    
    # 清理未使用的镜像（可选）
    read -p "是否清理未使用的Docker镜像？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "清理未使用的Docker镜像..."
        docker image prune -f
        log_success "Docker镜像清理完成"
    fi
    
    log_success "Docker资源清理完成"
}

# 显示停止信息
show_stop_info() {
    echo ""
    echo "=========================================="
    log_success "导航系统Docker服务已完全停止！"
    echo "=========================================="
    echo ""
    echo "📋 停止状态："
    echo "   ✅ Docker容器已停止"
    echo "   ✅ Docker网络已清理"
    echo "   ✅ 端口已释放"
    echo ""
    echo "🐳 当前Docker状态："
    local running_containers=$(docker ps --format "table {{.Names}}" --filter "name=navigation" | wc -l)
    if [ $running_containers -eq 1 ]; then  # 只有表头
        echo "   没有运行中的导航系统容器"
    else
        echo "   运行中的容器："
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation"
    fi
    echo ""
    echo "🚀 重新启动："
    echo "   运行命令: ./deployment/scripts/docker-start.sh"
    echo ""
    echo "🔧 其他操作："
    echo "   查看所有容器: docker ps -a"
    echo "   查看镜像: docker images"
    echo "   完全清理: docker system prune -a"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "🛑 导航系统Docker停止脚本 v1.0.0"
    echo "=========================================="
    echo ""
    
    # 检查是否有容器在运行
    local running_containers=$(docker ps --format "table {{.Names}}" --filter "name=navigation" | wc -l)
    if [ $running_containers -eq 1 ]; then  # 只有表头，没有实际容器
        log_info "没有检测到运行中的导航系统容器"
        echo ""
        echo "🔍 检查所有相关容器："
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation"
        echo ""
        read -p "是否继续清理资源？(y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "操作已取消"
            exit 0
        fi
    else
        log_info "检测到运行中的导航系统容器："
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation"
        echo ""
    fi
    
    # 执行停止流程
    stop_docker_services
    cleanup_docker_resources
    show_stop_info
    
    log_success "所有Docker服务已安全停止！"
}

# 捕获中断信号
trap 'log_warning "停止过程被中断"; exit 1' INT TERM

# 执行主函数
main "$@"