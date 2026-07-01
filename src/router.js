const { textToImage, imageToImage, submitVideo, pollVideo, downloadImage, downloadVideo } = require("./client");
const path = require("path");

const tasks = new Map();
const OUTPUT_DIR = path.join(__dirname, "..", "outputs");
const PORT = process.env.SERVER_PORT || 8000;

function ensureDir(dir) {
  if (!require("fs").existsSync(dir)) {
    require("fs").mkdirSync(dir, { recursive: true });
  }
}

function createTask(id, type, prompt, imageUrl) {
  var task = {
    id: id,
    type: type,
    prompt: prompt,
    status: "pending",
    result: null,
    error: null,
    local_file: null,
    url: null,
    createdAt: Date.now(),
  };
  if (imageUrl) task.image_url = imageUrl;
  tasks.set(id, task);
  return task;
}

function extractImageUrl(response) {
  if (response.data && response.data.length > 0) {
    return response.data[0].url || response.data[0].b64_json;
  }
  return null;
}

async function generateImage(req, res) {
  var body = req.body;
  var prompt = body.prompt;
  var image_url = body.image_url;
  var n = body.n;
  var size = body.size;
  
  if (!prompt) return res.status(400).json({ error: "prompt is required" });
  
  var taskId = "img_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  var fileName = taskId + ".png";
  var filePath = path.join(OUTPUT_DIR, fileName);
  var fileUrl = "http://localhost:" + PORT + "/outputs/" + fileName;
  ensureDir(OUTPUT_DIR);
  
  createTask(taskId, image_url ? "image-to-image" : "text-to-image", prompt, image_url);
  
  (async function() {
    try {
      var result;
      if (image_url) {
        result = await imageToImage(prompt, image_url, { n: n });
      } else {
        result = await textToImage(prompt, { n: n, size: size });
      }
      
      var imgUrl = extractImageUrl(result);
      if (imgUrl && !imgUrl.startsWith("data:")) {
        await downloadImage(imgUrl, filePath);
      }
      
      var t = tasks.get(taskId);
      t.status = "completed";
      t.result = result;
      t.local_file = filePath;
      t.url = fileUrl;
    } catch (err) {
      var t2 = tasks.get(taskId);
      t2.status = "failed";
      t2.error = err.message;
    }
  })();
  
  res.json({ task_id: taskId, status: "pending", url: fileUrl });
}

async function generateVideo(req, res) {
  var body = req.body;
  var prompt = body.prompt;
  var image_url = body.image_url;
  var duration = body.duration;
  
  if (!prompt) return res.status(400).json({ error: "prompt is required" });
  
  var taskId = "vid_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  var fileName = taskId + ".mp4";
  var filePath = path.join(OUTPUT_DIR, fileName);
  var fileUrl = "http://localhost:" + PORT + "/outputs/" + fileName;
  ensureDir(OUTPUT_DIR);
  
  createTask(taskId, image_url ? "image-to-video" : "text-to-video", prompt, image_url);
  
  (async function() {
    try {
      var submitted;
      if (image_url) {
        submitted = await submitVideo(prompt, { image_url: image_url, duration: duration });
      } else {
        submitted = await submitVideo(prompt, { duration: duration });
      }
      
      var t = tasks.get(taskId);
      t.status = "processing";
      t.api_task_id = submitted.task_id || submitted.id;
      
      var result = await pollVideo(t.api_task_id);
      t.status = "completed";
      t.result = result;
      
      if (result.video_url || (result.data && result.data.url)) {
        var videoUrl = result.video_url || result.data.url;
        await downloadVideo(videoUrl, filePath);
        t.local_file = filePath;
      }
      t.url = fileUrl;
    } catch (err) {
      var t2 = tasks.get(taskId);
      t2.status = "failed";
      t2.error = err.message;
    }
  })();
  
  res.json({ task_id: taskId, status: "pending", url: fileUrl });
}

function getTask(req, res) {
  var task = tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
}

function listTasks(req, res) {
  res.json(Array.from(tasks.values()));
}

module.exports = { generateImage, generateVideo, getTask, listTasks };