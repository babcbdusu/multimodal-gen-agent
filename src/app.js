const express = require("express");
require("dotenv").config();
const { generateImage, generateVideo, getTask, listTasks } = require("./router");
const path = require("path");

const app = express();
const PORT = process.env.SERVER_PORT || 8000;
const OUTPUT_DIR = path.join(__dirname, "..", "outputs");

app.use(express.json());

// Serve generated files statically
app.use("/outputs", express.static(OUTPUT_DIR));

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.post("/generate", (req, res) => {
  var body = req.body;
  var type = body.type;
  var prompt = body.prompt;
  var image_url = body.image_url;
  
  if (!prompt) return res.status(400).json({ error: "prompt is required" });
  
  if (!type) type = detectType(prompt, image_url);
  
  switch (type) {
    case "text-to-image":
    case "image-to-image":
      return generateImage(req, res);
    case "text-to-video":
    case "image-to-video":
      return generateVideo(req, res);
    default:
      return res.status(400).json({ error: "Unknown type: " + type });
  }
});

function detectType(prompt, image_url) {
  var actionKeywords = ["动", "walk", "run", "fly", "swim", "dance", "move", "motion", "animate", "video", "视频", "clip", "film", "playing", "sunset", "beach"];
  var hasAction = actionKeywords.some(function(kw) { return prompt.toLowerCase().includes(kw); });
  
  if (image_url) {
    return hasAction ? "image-to-video" : "image-to-image";
  }
  return hasAction ? "text-to-video" : "text-to-image";
}

app.get("/tasks", listTasks);
app.get("/tasks/:id", getTask);
app.post("/image", generateImage);
app.post("/video", generateVideo);

app.listen(PORT, function() {
  console.log("Server running on http://localhost:" + PORT);
  console.log("Generated files accessible at: http://localhost:" + PORT + "/outputs/");
});