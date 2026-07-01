require("dotenv").config();

const IMAGE_MODEL = "agnes-image-2.0-flash";
const VIDEO_MODEL = "agnes-video-v2.0";
const BASE_URL = process.env.AGNES_BASE_URL || "https://apihub.agnes-ai.com/v1";
const API_KEY = process.env.AGNES_API_KEY;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
}

async function apiPost(path, data) {
  var resp = await fetch(BASE_URL + path, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  var json = await resp.json();
  if (!resp.ok) {
    throw new Error(json.error?.message || json.detail || "API error: " + resp.status);
  }
  return json;
}

async function apiGet(path) {
  var resp = await fetch(BASE_URL + path, {
    method: "GET",
    headers: authHeaders(),
  });
  var json = await resp.json();
  if (!resp.ok) {
    throw new Error(json.error?.message || json.detail || "API error: " + resp.status);
  }
  return json;
}

// Text-to-Image
async function textToImage(prompt, opts = {}) {
  return apiPost("/images/generations", {
    model: IMAGE_MODEL,
    prompt: prompt,
    n: opts.n || 1,
    size: opts.size || "1024x1024",
  });
}

// Image-to-Image
async function imageToImage(prompt, imageUrl, opts = {}) {
  return apiPost("/images/generations", {
    model: IMAGE_MODEL,
    prompt: prompt,
    image_url: imageUrl,
    n: opts.n || 1,
  });
}

// Submit video generation (async)
async function submitVideo(prompt, opts = {}) {
  var data = {
    model: VIDEO_MODEL,
    prompt: prompt,
    seconds: opts.duration || 5,
  };
  if (opts.image_url) data.image_url = opts.image_url;
  return apiPost("/videos", data);
}

// Poll video task
async function pollVideo(apiTaskId, intervalMs = 5000, timeoutMs = 300000) {
  var start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      var result = await apiGet("/videos/" + encodeURIComponent(apiTaskId));
      if (result.status === "completed") {
        return result;
      }
    } catch (e) {
      // ignore polling errors
    }
    await new Promise(function(r) { setTimeout(r, intervalMs); });
  }
  throw new Error("Video generation timed out");
}

// Image-to-Video
async function imageToVideo(prompt, imageUrl, opts = {}) {
  var submitted = await submitVideo(prompt, Object.assign({}, opts, { image_url: imageUrl }));
  return pollVideo(submitted.task_id || submitted.id);
}

// Text-to-Video
async function textToVideo(prompt, opts = {}) {
  var submitted = await submitVideo(prompt, opts);
  return pollVideo(submitted.task_id || submitted.id);
}

// Download image from URL to local file
async function downloadImage(url, outputPath) {
  var resp = await fetch(url);
  var buffer = Buffer.from(await resp.arrayBuffer());
  require("fs").writeFileSync(outputPath, buffer);
  return outputPath;
}

// Download video from URL to local file
async function downloadVideo(url, outputPath) {
  var resp = await fetch(url);
  var buffer = Buffer.from(await resp.arrayBuffer());
  require("fs").writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = {
  textToImage, imageToImage, imageToVideo, textToVideo,
  submitVideo, pollVideo,
  downloadImage, downloadVideo,
  IMAGE_MODEL, VIDEO_MODEL,
};