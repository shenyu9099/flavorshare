# FlavorShare Logic Apps 部署说明

## 项目信息

| 配置项 | 值 |
|--------|-----|
| 订阅 ID | `4746f881-91c0-4654-b2e8-c3d96a6476b6` |
| 资源组 | `FlavorShare-RG` |
| 区域 | UK South |
| Cosmos DB 账户 | `flavorsharedb` |
| 存储账户 | `flavorsharestorage123` |

## API 接口清单

| # | 文件名 | 方法 | 端点 | 功能 |
|---|--------|------|------|------|
| 1 | `register-user.json` | POST | /api/register | 用户注册 |
| 2 | `login-user.json` | POST | /api/login | 用户登录 |
| 3 | `create-journal.json` | POST | /api/journals | 创建美食日记 |
| 4 | `get-journals.json` | GET | /api/journals | 获取所有日记 |
| 5 | `get-journal-by-id.json` | GET | /api/journals/{id} | 获取单个日记 |
| 6 | `update-journal.json` | PUT | /api/journals/{id} | 更新日记 |
| 7 | `delete-journal.json` | DELETE | /api/journals/{id} | 删除日记 |
| 8 | `upload-media.json` | POST | /api/media | 上传媒体文件 |

## 部署步骤

### 第一步：创建 API Connections

在 Azure Portal 中，需要先创建以下连接：

#### 1. Cosmos DB 连接
1. 搜索 "API connections" → "+ Create"
2. 搜索 "Azure Cosmos DB" → 选择
3. 填写：
   - Connection name: `documentdb`
   - Cosmos DB Account: 选择 `flavorsharedb`
   - Access Key: 从 Cosmos DB → Keys 复制 Primary Key
4. Create

#### 2. Blob Storage 连接
1. 搜索 "API connections" → "+ Create"
2. 搜索 "Azure Blob Storage" → 选择
3. 填写：
   - Connection name: `azureblob`
   - Storage Account: 选择 `flavorsharestorage123`
   - Access Key: 从存储账户 → Access keys 复制
4. Create

### 第二步：创建 Logic Apps

为每个 JSON 文件创建一个 Logic App：

1. 搜索 "Logic Apps" → "+ Create"
2. 选择 "Consumption" 类型
3. 填写：
   - Resource Group: `FlavorShare-RG`
   - Logic App name: `flavorshare-register` (根据接口名称)
   - Region: `UK South`
4. Create

### 第三步：导入工作流定义

1. 进入创建的 Logic App
2. 左侧菜单 → "Logic app code view"
3. 复制对应的 JSON 文件内容
4. 粘贴到代码视图
5. 点击 "Save"

### 第四步：获取 HTTP 端点 URL

1. 进入 Logic App → Overview
2. 点击 "Workflow URL" 旁边的复制按钮
3. 保存 URL 用于前端调用

## 数据结构

### Users 容器 (Cosmos DB)
```json
{
  "id": "user-xxx",
  "email": "user@example.com",
  "name": "用户名",
  "passwordHash": "密码",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Journals 容器 (Cosmos DB)
```json
{
  "id": "journal-xxx",
  "userId": "user-xxx",
  "title": "日记标题",
  "description": "描述",
  "coverImage": "https://...",
  "recipe": {
    "ingredients": ["材料1", "材料2"],
    "instructions": "步骤说明",
    "prepTime": 15,
    "cookTime": 30
  },
  "media": {
    "photos": [{"id": "xxx", "url": "https://...", "title": "照片"}],
    "videos": [],
    "audio": []
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Blob Storage 结构
```
media/
├── photos/
│   └── media-xxx-photo.jpg
├── videos/
│   └── media-xxx-video.mp4
└── audio/
    └── media-xxx-audio.mp3
```

## API 请求示例

### 1. 用户注册
```bash
POST /api/register
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

### 2. 用户登录
```bash
POST /api/login
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

### 3. 创建日记
```bash
POST /api/journals
Content-Type: application/json

{
  "userId": "user-xxx",
  "title": "我的第一篇美食日记",
  "description": "今天做了一道美味的意大利面",
  "coverImage": "https://...",
  "recipe": {
    "ingredients": ["意大利面", "番茄酱", "橄榄油"],
    "instructions": "1. 煮面\n2. 炒酱\n3. 混合",
    "prepTime": 10,
    "cookTime": 20
  }
}
```

### 4. 获取所有日记
```bash
GET /api/journals
```

### 5. 获取单个日记
```bash
GET /api/journals?id=journal-xxx&userId=user-xxx
```

### 6. 更新日记
```bash
PUT /api/journals
Content-Type: application/json

{
  "id": "journal-xxx",
  "userId": "user-xxx",
  "title": "更新后的标题"
}
```

### 7. 删除日记
```bash
DELETE /api/journals?id=journal-xxx&userId=user-xxx
```

### 8. 上传媒体
```bash
POST /api/media
Content-Type: application/json

{
  "journalId": "journal-xxx",
  "userId": "user-xxx",
  "fileName": "my-photo.jpg",
  "fileContent": "base64编码的文件内容",
  "mediaType": "photos",
  "contentType": "image/jpeg"
}
```

## 前端配置

更新 `src/config/api.js` 中的 URL：

```javascript
const AZURE_API_BASE_URL = 'https://your-logic-app-url';

export const API_ENDPOINTS = {
  USERS: {
    REGISTER: 'https://xxx.logic.azure.com/...',  // register Logic App URL
    LOGIN: 'https://xxx.logic.azure.com/...',     // login Logic App URL
  },
  JOURNALS: {
    CREATE: 'https://xxx.logic.azure.com/...',
    GET_ALL: 'https://xxx.logic.azure.com/...',
    // ...
  },
  MEDIA: {
    UPLOAD: 'https://xxx.logic.azure.com/...',
  },
};
```

## 注意事项

1. **CORS**: 所有接口已配置 `Access-Control-Allow-Origin: *`
2. **分区键**: Cosmos DB 查询需要提供正确的 partition key
3. **文件上传**: 媒体文件需要转换为 Base64 格式上传
4. **安全性**: 生产环境建议添加 API 密钥验证

