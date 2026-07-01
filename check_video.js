
var id = "task_wgmyHYwExacpiPzLHz974BlsGQNoBbj1";
fetch("https://apihub.agnes-ai.com/v1/videos/" + id, {
  headers: { "Authorization": "Bearer sk-VyduEFPBRQFmc7Yh3kqL89mP8HxVPsMcB7Nrzs2u0gq0bTnL" }
}).then(function(r) { return r.json(); }).then(function(d) {
  console.log("Status:", d.status);
  console.log("Progress:", d.progress);
  if (d.status === "completed") console.log("Video URL:", d.remixed_from_video_id);
}).catch(function(e) { console.error(e.message); });
