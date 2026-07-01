# Multimodal Generation Agent

An API proxy that bridges a text-only AI model with external image/video generation services. It intercepts generation-related keywords in conversations and routes them to Agnes AI APIs.

一个 API 代理层，将纯文本 AI 模型与外部图像/视频生成服务桥接起来。通过拦截对话中的生成相关关键词，将请求路由到 Agnes AI API。

## Features 功能特性

- **Text-to-Image 文生图** — Input text description, generate image
- **Image-to-Image 图生图** — Based on reference image, style transfer or modification
- **Image-to-Video 图生视频** — Make static image into a short video
- **Smart Routing 智能路由** — Auto-detect intent, select correct generation mode
- **Async Task Management 异步任务管理** — Task status query, non-blocking
- **Local Storage 本地存储** — Generated files saved locally, accessible via HTTP
- **Multi-platform 多端适配** — Discord Bot, Web Frontend, CLI, other AI Agents

## Tech Stack 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: Agnes AI (agnes-image-2.0-flash, agnes-video-v2.0)
- **Storage**: Local filesystem

## Installation 安装

### Prerequisites 前置要求

- Node.js >= 18
- Agnes API Key

### Steps 步骤

```bash
# Clone repository
git clone https://github.com/babcbdusu/multimodal-gen-agent.git
cd multimodal-gen-agent

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your AGNES_API_KEY
```

## Configuration 配置

Create a `.env` file in the project root:

```env
AGNES_API_KEY=your_api_key_here
AGNES_BASE_URL=https://apihub.agnes-ai.com/v1
SERVER_PORT=8000
```

## Usage 使用

### Start Server 启动服务

```bash
# Windows
start.bat

# Or directly
node src/app.js
```

### API Endpoints API 端点

#### 1. Unified Generation Endpoint 统一生成接口

```bash
POST http://localhost:8000/generate
```

**Request Body 请求体:**

```json
{
  "prompt": "描述文字",
  "image_url": "参考图片URL (可选)",
  "type": "text-to-image | image-to-image | image-to-video (可选，自动检测)",
  "size": "1920x1080 (仅图片)",
  "duration": 5 (仅视频，单位秒)
}
```

**Response 响应:**

```json
{
  "task_id": "img_xxxxx",
  "status": "pending",
  "url": "http://localhost:8000/outputs/xxxxx.png"
}
```

#### 2. Query Task Status 查询任务状态

```bash
GET http://localhost:8000/tasks/{task_id}
```

**Response 响应:**

```json
{
  "id": "img_xxxxx",
  "type": "text-to-image",
  "prompt": "a cute cat",
  "status": "completed",
  "result": {...},
  "local_file": "C:\\...\\outputs\\img_xxxxx.png",
  "url": "http://localhost:8000/outputs/img_xxxxx.png",
  "createdAt": 1782924568686
}
```

#### 3. List All Tasks 列出所有任务

```bash
GET http://localhost:8000/tasks
```

#### 4. Health Check 健康检查

```bash
GET http://localhost:8000/health
```

## Examples 示例

### Text-to-Image 文生图

```bash
curl -X POST http://localhost:8000/generate -H "Content-Type: application/json" -d '{
  "prompt": "a golden retriever puppy playing in the snow",
  "size": "1920x1080"
}'
```

### Image-to-Image 图生图

```bash
curl -X POST http://localhost:8000/generate -H "Content-Type: application/json" -d '{
  "prompt": "cyberpunk style",
  "image_url": "https://example.com/reference.jpg"
}'
```

### Image-to-Video 图生视频

```bash
curl -X POST http://localhost:8000/generate -H "Content-Type: application/json" -d '{
  "prompt": "a cat walking on the beach at sunset",
  "image_url": "https://example.com/frame.jpg",
  "duration": 5
}'
```

## Project Structure 项目结构

```
multimodal-gen-agent/
├── src/
│   ├── app.js          # Express server entry point
│   ├── client.js       # Agnes API client
│   └── router.js       # Route handlers & task management
├── outputs/            # Generated files (auto-created)
├── .env                # API configuration
├── package.json
├── start.bat           # Windows startup script
└── README.md
```

## Integration 集成

### Discord Bot

```javascript
// Example: Discord command handler
client.on('message', async (msg) => {
  if (msg.content.startsWith('/img')) {
    const prompt = msg.content.slice(4);
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    msg.reply(`Task submitted: ${data.task_id}`);
  }
});
```

### Web Frontend

```html
<form onsubmit="generate(event)">
  <input type="text" id="prompt" placeholder="Describe your image" />
  <button type="submit">Generate</button>
</form>

<script>
async function generate(e) {
  e.preventDefault();
  const prompt = document.getElementById('prompt').value;
  const res = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  console.log('Task ID:', data.task_id);
}
</script>
```

## License 许可证

MIT