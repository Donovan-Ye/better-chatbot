# OpenAI 代理配置指南

本文档说明如何配置 OpenAI 请求通过代理服务器转发。

## 环境变量配置

在您的 `.env` 文件中添加以下配置：

```env
# OpenAI 代理配置
OPENAI_USE_PROXY=true
OPENAI_PROXY_URL=http://127.0.0.1:7890
```

## 配置选项

### OPENAI_USE_PROXY

- **默认值**: `true`
- **描述**: 是否启用 OpenAI 请求代理
- **可选值**:
  - `true` - 启用代理
  - `false` - 禁用代理

### OPENAI_PROXY_URL

- **默认值**: `http://127.0.0.1:7890`
- **描述**: 代理服务器地址
- **格式**: `http://host:port` 或 `https://host:port`

## 使用场景

### 1. 使用本地代理 (默认配置)

```env
OPENAI_USE_PROXY=true
OPENAI_PROXY_URL=http://127.0.0.1:7890
```

### 2. 使用自定义代理服务器

```env
OPENAI_USE_PROXY=true
OPENAI_PROXY_URL=http://your-proxy-server:8080
```

### 3. 禁用代理

```env
OPENAI_USE_PROXY=false
```

## 支持的功能

此代理配置适用于所有 OpenAI 相关的请求：

1. **AI SDK 模型调用** - 通过 `@ai-sdk/openai` 的所有请求
2. **实时语音 API** - OpenAI Realtime API 请求
3. **OpenAI 兼容提供商** - 自定义 OpenAI 兼容的 API 提供商
4. **Azure OpenAI** - Azure OpenAI 服务请求

## 技术实现

代理配置通过以下方式实现：

1. **自定义 fetch 函数** - 为 OpenAI API 请求创建支持代理的 fetch 函数
2. **环境变量设置** - 通过临时设置 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量
3. **智能路由** - 仅对 `api.openai.com` 域名的请求使用代理
4. **环境变量恢复** - 请求完成后自动恢复原始环境变量设置

## 故障排除

### 1. 代理连接失败

- 检查代理服务器是否正在运行
- 验证代理地址和端口是否正确
- 确认网络连接正常

### 2. 请求超时

- 检查代理服务器性能
- 考虑增加请求超时时间
- 验证代理服务器配置

### 3. 认证问题

- 如果代理服务器需要认证，请在 URL 中包含凭据：
  ```env
  OPENAI_PROXY_URL=http://username:password@proxy-server:port
  ```

## 安全注意事项

1. **凭据保护** - 不要在代码中硬编码代理凭据
2. **HTTPS 使用** - 在生产环境中使用 HTTPS 代理
3. **访问控制** - 确保代理服务器有适当的访问控制
4. **日志记录** - 注意代理服务器的日志记录策略

## 环境变量示例

完整的 `.env` 文件示例：

```env
# 基本配置
BETTER_AUTH_SECRET=your_secret_here
POSTGRES_URL=postgres://user:pass@localhost:5432/better_chatbot
OPENAI_API_KEY=sk-your-openai-api-key

# 代理配置 - 使用本地7890端口
OPENAI_USE_PROXY=true
OPENAI_PROXY_URL=http://127.0.0.1:7890

# 其他可选配置
OPENAI_BASE_URL=https://api.openai.com/v1
```
