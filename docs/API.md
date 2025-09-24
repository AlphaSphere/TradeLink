# 导航系统管理后台API文档

本文档详细说明了导航系统管理后台的API接口，供前端开发人员对接使用。所有接口均采用RESTful风格设计，返回JSON格式数据。

## 基础信息

- **基础URL**: `http://localhost:5001/api`
- **请求方式**: GET, POST, PUT, DELETE
- **数据格式**: JSON
- **状态码**:
  - 200: 请求成功
  - 400: 请求参数错误
  - 404: 资源不存在
  - 500: 服务器内部错误

## 分类管理API

### 1. 获取所有分类

获取所有分类及其包含的工具列表。

- **URL**: `/categories`
- **方法**: GET
- **参数**: 无
- **返回示例**:

```json
[
  {
    "id": 1,
    "title": "常用工具",
    "icon": "bi-tools",
    "created_at": "2023-07-24 10:00:00",
    "tools": [
      {
        "id": 1,
        "name": "Google",
        "description": "搜索引擎",
        "icon": "bi-google",
        "url": "https://www.google.com",
        "category_id": 1,
        "created_at": "2023-07-24 10:00:00"
      }
    ]
  }
]
```

### 2. 添加分类

添加新的分类。

- **URL**: `/categories`
- **方法**: POST
- **请求体**:

```json
{
  "title": "新分类名称",
  "icon": "bi-folder" // 可选，默认为"bi-folder"
}
```

- **返回示例**:

```json
{
  "id": 4,
  "message": "分类添加成功"
}
```

### 3. 更新分类

更新现有分类的信息。

- **URL**: `/categories/{id}`
- **方法**: PUT
- **请求体**:

```json
{
  "title": "更新后的分类名称",
  "icon": "bi-folder-fill" // 可选
}
```

- **返回示例**:

```json
{
  "message": "分类更新成功"
}
```

### 4. 删除分类

删除指定的分类及其包含的所有工具。

- **URL**: `/categories/{id}`
- **方法**: DELETE
- **参数**: 无
- **返回示例**:

```json
{
  "message": "分类删除成功"
}
```

## 工具管理API

### 1. 获取所有工具

获取所有导航工具。

- **URL**: `/tools`
- **方法**: GET
- **参数**: 无
- **返回示例**:

```json
[
  {
    "id": 1,
    "name": "Google",
    "description": "搜索引擎",
    "icon": "bi-google",
    "url": "https://www.google.com",
    "category_id": 1,
    "created_at": "2023-07-24 10:00:00"
  }
]
```

### 2. 获取特定分类下的工具

获取特定分类下的所有工具。

- **URL**: `/categories/{id}/tools`
- **方法**: GET
- **参数**: 无
- **返回示例**:

```json
[
  {
    "id": 1,
    "name": "Google",
    "description": "搜索引擎",
    "icon": "bi-google",
    "url": "https://www.google.com",
    "category_id": 1,
    "created_at": "2023-07-24 10:00:00"
  }
]
```

### 3. 添加工具

添加新的导航工具。

- **URL**: `/tools`
- **方法**: POST
- **请求体**:

```json
{
  "name": "新工具名称",
  "description": "工具描述", // 可选
  "icon": "bi-link", // 可选，默认为"bi-link"
  "url": "https://example.com",
  "category_id": 1
}
```

- **返回示例**:

```json
{
  "id": 5,
  "message": "工具添加成功"
}
```

### 4. 更新工具

更新现有工具的信息。

- **URL**: `/tools/{id}`
- **方法**: PUT
- **请求体**:

```json
{
  "name": "更新后的工具名称",
  "description": "更新后的描述", // 可选
  "icon": "bi-link-45deg", // 可选
  "url": "https://updated-example.com", // 可选
  "category_id": 2 // 可选，可以移动到其他分类
}
```

- **返回示例**:

```json
{
  "message": "工具更新成功"
}
```

### 5. 删除工具

删除指定的导航工具。

- **URL**: `/tools/{id}`
- **方法**: DELETE
- **参数**: 无
- **返回示例**:

```json
{
  "message": "工具删除成功"
}
```

## 其他API

### 1. 系统状态检查

检查系统运行状态。

- **URL**: `/status`
- **方法**: GET
- **参数**: 无
- **返回示例**:

```json
{
  "status": "running",
  "version": "1.0.0",
  "database": "connected"
}
```

## 错误处理

所有API在发生错误时会返回统一格式的错误信息：

```json
{
  "error": "错误描述信息"
}
```

## 前后端对接说明

1. **前台网站分类与管理后台分类管理**:
   - 前台网站应使用`/api/categories`接口获取所有分类
   - 分类的增删查改操作应通过对应的API完成
   - 前台展示时应保持与后台管理的分类结构一致

2. **前台导航卡片与管理后台工具管理**:
   - 前台导航卡片应使用`/api/tools`或`/api/categories/{id}/tools`接口获取工具数据
   - 工具的增删查改操作应通过对应的API完成
   - 前台展示的卡片应与后台管理的工具信息保持一致

3. **图标使用**:
   - 系统使用Bootstrap Icons，前端应确保正确引入相应的图标库
   - 图标字段格式为"bi-xxx"，对应Bootstrap Icons的类名

4. **数据刷新**:
   - 前台在进行增删查改操作后应及时刷新数据，确保用户看到最新内容
   - 建议实现简单的缓存机制，减少频繁请求

## 开发建议

1. 使用统一的API调用封装，处理错误和加载状态
2. 实现数据验证，确保提交的数据符合要求
3. 添加适当的用户反馈，如操作成功/失败提示
4. 考虑添加分页功能，当数据量较大时提高性能