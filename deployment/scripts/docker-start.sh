#!/bin/bash

# 导航系统Docker一键启动脚本
# 作者: Navigation System Team
# 版本: 1.1.0
# 描述: 使用Docker容器化方式启动导航系统，支持端口占用检测和自动处理

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目根目录（脚本在 deployment/scripts/ 下，根目录为上上级）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 固定端口配置（避免随意变动）
FRONTEND_PORT=8080
BACKEND_PORT=5002
NGINX_PORT=80

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

# 检查命令是否存在
check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 检查端口占用并杀死进程
check_and_kill_port() {
    local port=$1
    local port_name=$2
    
    log_info "检查端口 $port ($port_name) 占用情况..."
    
    # 查找占用端口的进程
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        log_warning "端口 $port 被进程 $pid 占用"
        log_info "正在杀死占用端口 $port 的进程..."
        
        # 尝试优雅关闭
        kill -TERM $pid 2>/dev/null
        sleep 2
        
        # 检查进程是否还在运行
        if kill -0 $pid 2>/dev/null; then
            log_warning "进程 $pid 未响应TERM信号，强制杀死..."
            kill -KILL $pid 2>/dev/null
            sleep 1
        fi
        
        # 再次检查端口是否释放
        local new_pid=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$new_pid" ]; then
            log_error "无法释放端口 $port，请手动处理"
            return 1
        else
            log_success "端口 $port 已释放"
        fi
    else
        log_info "端口 $port 未被占用"
    fi
    
    return 0
}

# 检查所有必需端口
check_required_ports() {
    log_info "检查系统必需端口..."
    
    # 检查前端端口
    if ! check_and_kill_port $FRONTEND_PORT "前端服务"; then
        return 1
    fi
    
    # 检查后端端口
    if ! check_and_kill_port $BACKEND_PORT "后端API"; then
        return 1
    fi
    
    log_success "所有必需端口检查完成"
    return 0
}

# 检查Docker环境
check_docker_environment() {
    log_info "检查Docker环境..."
    
    # 检查Docker是否安装
    if ! check_command docker; then
        log_error "Docker未安装，请先安装Docker"
        log_info "macOS安装命令: brew install --cask docker"
        log_info "或访问: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # 检查Docker是否运行
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker未运行，请启动Docker Desktop"
        exit 1
    fi
    
    # 检查docker-compose是否可用
    if ! check_command docker-compose && ! docker compose version >/dev/null 2>&1; then
        log_error "docker-compose未安装或不可用"
        exit 1
    fi
    
    log_success "Docker环境检查完成"
}

# 检查并处理现有容器
check_existing_containers() {
    log_info "检查现有容器状态..."
    
    # 检查navigation-app容器
    if docker ps --format "table {{.Names}}" | grep -q "navigation-app"; then
        log_warning "发现navigation-app容器正在运行"
        echo "选择操作："
        echo "1) 重启现有容器 (推荐，快速启动)"
        echo "2) 重新构建并启动 (完全重建，较慢)"
        echo "3) 退出"
        read -p "请选择 (1-3): " choice
        
        case $choice in
            1)
                log_info "重启现有容器..."
                docker-compose -f "$PROJECT_ROOT/deployment/docker/docker-compose.yml" restart
                return 0
                ;;
            2)
                log_info "停止现有容器进行重建..."
                docker-compose -f "$PROJECT_ROOT/deployment/docker/docker-compose.yml" down
                return 1
                ;;
            3)
                log_info "用户取消操作"
                exit 0
                ;;
            *)
                log_warning "无效选择，默认重启现有容器"
                docker-compose -f "$PROJECT_ROOT/deployment/docker/docker-compose.yml" restart
                return 0
                ;;
        esac
    elif docker ps -a --format "table {{.Names}}" | grep -q "navigation-app"; then
        log_info "发现已停止的navigation-app容器，直接启动..."
        docker-compose -f "$PROJECT_ROOT/deployment/docker/docker-compose.yml" up -d
        return 0
    fi
    
    return 1
}

# 构建和启动Docker服务
start_docker_services() {
    log_info "构建和启动Docker服务..."
    
    cd "$PROJECT_ROOT/deployment/docker" || {
        log_error "无法进入Docker配置目录"
        exit 1
    }
    
    # 检查是否需要构建镜像
    if docker images | grep -q "docker_navigation-app"; then
        log_info "发现现有镜像，跳过构建步骤..."
        log_info "如需重新构建，请运行: docker-compose build --no-cache"
    else
        # 构建镜像
        log_info "构建Docker镜像..."
        if docker-compose build; then
            log_success "Docker镜像构建完成"
        else
            log_error "Docker镜像构建失败"
            exit 1
        fi
    fi
    
    # 启动服务
    log_info "启动Docker容器..."
    if docker-compose up -d; then
        log_success "Docker容器启动完成"
    else
        log_error "Docker容器启动失败"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    
    # 等待后端服务
    log_info "检查后端服务状态..."
    local backend_ready=false
    for i in {1..30}; do
        if curl -f http://localhost:$BACKEND_PORT/api/categories >/dev/null 2>&1; then
            backend_ready=true
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "后端服务启动超时"
            return 1
        fi
        log_info "等待后端服务启动... ($i/30)"
        sleep 2
    done
    
    if $backend_ready; then
        log_success "后端服务启动成功"
    fi
    
    # 等待前端服务
    log_info "检查前端服务状态..."
    local frontend_ready=false
    for i in {1..15}; do
        if curl -f http://localhost:$FRONTEND_PORT/ >/dev/null 2>&1; then
            frontend_ready=true
            break
        fi
        if [ $i -eq 15 ]; then
            log_error "前端服务启动超时"
            return 1
        fi
        log_info "等待前端服务启动... ($i/15)"
        sleep 2
    done
    
    if $frontend_ready; then
        log_success "前端服务启动成功"
    fi
    
    return 0
}

# 显示服务信息
show_service_info() {
    echo ""
    echo "=========================================="
    log_success "导航系统Docker启动完成！"
    echo "=========================================="
    echo ""
    
    echo "🌐 服务访问地址："
    echo "   前端页面: http://localhost:$FRONTEND_PORT"
    echo "   管理后台: http://localhost:$FRONTEND_PORT/pages/admin.html"
    echo "   后端API:  http://localhost:$BACKEND_PORT"
    echo ""
    echo "🐳 Docker容器状态："
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=navigation"
    echo ""
    echo "📝 查看日志："
    echo "   容器日志: docker logs navigation-app"
    echo "   实时日志: docker logs -f navigation-app"
    echo ""
    echo "🛑 停止服务："
    echo "   运行命令: ./deployment/scripts/docker-stop.sh"
    echo "   或者: docker-compose -f deployment/docker/docker-compose.yml down"
    echo ""
    echo "🔧 其他操作："
    echo "   进入容器: docker exec -it navigation-app bash"
    echo "   重启服务: docker-compose -f deployment/docker/docker-compose.yml restart"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "🐳 导航系统Docker启动脚本 v1.1.0"
    echo "=========================================="
    echo ""
    
    # 检查Docker环境
    check_docker_environment
    
    # 检查并处理端口占用
    log_info "检查端口占用情况..."
    if ! check_required_ports; then
        log_error "端口检查失败，无法继续启动"
        exit 1
    fi
    
    # 检查并处理现有容器
    if check_existing_containers; then
        # 容器已启动或重启，等待服务就绪
        if wait_for_services; then
            show_service_info
            log_success "所有服务启动完成！"
        else
            log_error "服务启动检查失败，请检查日志"
            exit 1
        fi
        return 0
    fi
    
    # 没有现有容器，进行完整启动流程
    start_docker_services
    
    # 等待服务启动
    if wait_for_services; then
        show_service_info
        log_success "所有服务启动完成！"
    else
        log_error "服务启动失败，请检查日志"
        exit 1
    fi
}

# 捕获中断信号，确保清理资源
trap 'log_warning "启动过程被中断"; exit 1' INT TERM

# 执行主函数
main "$@"