
fetch("https://apihub.agnes-ai.com/v1/videos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-VyduEFPBRQFmc7Yh3kqL89mP8HxVPsMcB7Nrzs2u0gq0bTnL"
  },
  body: JSON.stringify({
    model: "agnes-video-v2.0",
    prompt: "a cat walking",
    image_url: "https://platform-outputs.agnes-ai.space/images/t2i/0d100a12b54b4565919d627582761461.png"
  })
})
.then(function(r) {
  return r.json().then(function(d) {
    console.log("Status:", r.status);
    console.log(JSON.stringify(d, null, 2));
  });
})
.catch(function(e) { console.error("Error:", e.message); });
