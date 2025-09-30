#!/bin/bash

# 导航系统Docker状态检查脚本
# 作者: Navigation System Team
# 版本: 1.0.0
# 描述: 检查Docker容器化导航系统的运行状态

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

# 检查Docker环境
check_docker_environment() {
    echo "🐳 Docker环境状态："
    
    # 检查Docker是否安装
    if command -v docker >/dev/null 2>&1; then
        local docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        echo -e "   ${GREEN}✅ Docker${NC}: 已安装 (版本: $docker_version)"
    else
        echo -e "   ${RED}❌ Docker${NC}: 未安装"
        return 1
    fi
    
    # 检查Docker是否运行
    if docker info >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Docker服务${NC}: 运行中"
    else
        echo -e "   ${RED}❌ Docker服务${NC}: 未运行"
        return 1
    fi
    
    # 检查docker-compose
    if command -v docker-compose >/dev/null 2>&1; then
        local compose_version=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        echo -e "   ${GREEN}✅ Docker Compose${NC}: 已安装 (版本: $compose_version)"
    elif docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version --short)
        echo -e "   ${GREEN}✅ Docker Compose${NC}: 已安装 (版本: $compose_version)"
    else
        echo -e "   ${YELLOW}⚠️  Docker Compose${NC}: 未安装或不可用"
    fi
    
    return 0
}

# 检查容器状态
check_container_status() {
    echo ""
    echo "📦 容器运行状态："
    
    # 检查导航应用容器
    local app_container=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation-app" | tail -n +2)
    if [ ! -z "$app_container" ]; then
        echo -e "   ${GREEN}✅ navigation-app${NC}: 运行中"
        echo "      $app_container"
        
        # 检查健康状态
        local health_status=$(docker inspect navigation-app --format='{{.State.Health.Status}}' 2>/dev/null)
        if [ "$health_status" = "healthy" ]; then
            echo -e "      ${GREEN}🏥 健康检查${NC}: 通过"
        elif [ "$health_status" = "unhealthy" ]; then
            echo -e "      ${RED}🏥 健康检查${NC}: 失败"
        elif [ "$health_status" = "starting" ]; then
            echo -e "      ${YELLOW}🏥 健康检查${NC}: 启动中"
        else
            echo -e "      ${YELLOW}🏥 健康检查${NC}: 未配置"
        fi
    else
        # 检查是否有停止的容器
        local stopped_container=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" --filter "name=navigation-app" | tail -n +2)
        if [ ! -z "$stopped_container" ]; then
            echo -e "   ${RED}❌ navigation-app${NC}: 已停止"
            echo "      $stopped_container"
        else
            echo -e "   ${RED}❌ navigation-app${NC}: 不存在"
        fi
    fi
    
    # 检查Nginx容器
    local nginx_container=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation-nginx" | tail -n +2)
    if [ ! -z "$nginx_container" ]; then
        echo -e "   ${GREEN}✅ navigation-nginx${NC}: 运行中"
        echo "      $nginx_container"
    else
        echo -e "   ${YELLOW}⚠️  navigation-nginx${NC}: 未运行 (可选服务)"
    fi
}

# 检查网络连接
check_network_connectivity() {
    echo ""
    echo "🌐 网络连接状态："
    
    # 检查前端服务
    if curl -s http://localhost:8000/ >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 前端服务${NC}: http://localhost:8000 - 可访问"
    else
        echo -e "   ${RED}❌ 前端服务${NC}: http://localhost:8000 - 无法访问"
    fi
    
    # 检查后端API
    if curl -s http://localhost:5001/api/categories >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 后端API${NC}: http://localhost:5001 - 可访问"
    else
        echo -e "   ${RED}❌ 后端API${NC}: http://localhost:5001 - 无法访问"
    fi
    
    # 检查管理后台
    if curl -s http://localhost:8000/pages/admin.html >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 管理后台${NC}: http://localhost:8000/pages/admin.html - 可访问"
    else
        echo -e "   ${RED}❌ 管理后台${NC}: http://localhost:8000/pages/admin.html - 无法访问"
    fi
}

# 检查Docker资源使用
check_docker_resources() {
    echo ""
    echo "💻 Docker资源使用："
    
    # 检查容器资源使用情况
    if docker ps --filter "name=navigation" --format "table {{.Names}}" | grep -q "navigation"; then
        echo "   📊 容器资源统计："
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker ps --filter "name=navigation" --format "{{.Names}}" | tr '\n' ' ')
    else
        echo -e "   ${YELLOW}⚠️  没有运行中的导航系统容器${NC}"
    fi
    
    # 检查镜像大小
    echo ""
    echo "   🖼️  相关镜像："
    local images=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(navigation|python)" | head -5)
    if [ ! -z "$images" ]; then
        echo "$images"
    else
        echo -e "      ${YELLOW}没有找到相关镜像${NC}"
    fi
}

# 检查日志状态
check_logs_status() {
    echo ""
    echo "📝 日志状态："
    
    if docker ps --format "table {{.Names}}" --filter "name=navigation-app" | grep -q "navigation-app"; then
        echo "   📋 最近的容器日志 (最后10行):"
        echo "   ----------------------------------------"
        docker logs --tail 10 navigation-app 2>/dev/null | sed 's/^/   /'
        echo "   ----------------------------------------"
        echo ""
        echo "   💡 查看完整日志: docker logs navigation-app"
        echo "   💡 实时查看日志: docker logs -f navigation-app"
    else
        echo -e "   ${YELLOW}⚠️  容器未运行，无法查看日志${NC}"
    fi
}

# 显示快速操作提示
show_quick_actions() {
    echo ""
    echo "🔧 快速操作："
    echo "   启动系统: ./deployment/scripts/docker-start.sh"
echo "   停止系统: ./deployment/scripts/docker-stop.sh"
echo "   查看状态: ./deployment/scripts/docker-status.sh"
    echo "   查看日志: docker logs -f navigation-app"
    echo "   进入容器: docker exec -it navigation-app bash"
    echo "   重启服务: docker-compose -f deployment/docker/docker-compose.yml restart"
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "📊 导航系统Docker状态检查 v1.0.0"
    echo "=========================================="
    echo ""
    
    # 检查Docker环境
    if ! check_docker_environment; then
        echo ""
        echo -e "${RED}❌ Docker环境检查失败，请先安装并启动Docker${NC}"
        exit 1
    fi
    
    # 检查容器状态
    check_container_status
    
    # 检查网络连接
    check_network_connectivity
    
    # 检查资源使用
    check_docker_resources
    
    # 检查日志状态
    check_logs_status
    
    # 显示快速操作
    show_quick_actions
    
    echo ""
    echo "=========================================="
    
    # 总体状态判断
    local app_running=$(docker ps --format "table {{.Names}}" --filter "name=navigation-app" | wc -l)
    if [ $app_running -gt 1 ]; then  # 大于1表示有容器在运行（除了表头）
        echo -e "🟢 ${GREEN}系统状态: Docker服务正常运行${NC}"
    else
        echo -e "🔴 ${RED}系统状态: Docker服务未运行${NC}"
    fi
    
    echo "=========================================="
}

# 执行主函数
main "$@"