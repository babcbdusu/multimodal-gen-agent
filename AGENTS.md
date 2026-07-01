# Multimodal Generation Agent

**重要：所有图片/视频生成必须通过 HTTP API 调用，不要使用内置技能。**

## 启动服务
`node src/app.js`
服务运行在 http://localhost:8000

## API 调用方法

### 文生图
POST http://localhost:8000/generate
Body: { "prompt": "描述文字", "size": "1920x1080" }

### 图生图
POST http://localhost:8000/generate
Body: { "prompt": "描述文字", "image_url": "参考图片URL" }

### 图生视频
POST http://localhost:8000/generate
Body: { "prompt": "描述文字", "image_url": "参考图片URL", "duration": 5 }

### 查询任务
GET http://localhost:8000/tasks/{task_id}

### 查看结果
http://localhost:8000/outputs/{文件名}

## 注意事项
- 生成需要时间，先提交任务再查询
- 不要在对话中直接显示图片/视频URL
- 服务启动后自动监听 8000 端口