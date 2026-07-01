
fetch("https://apihub.agnes-ai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-VyduEFPBRQFmc7Yh3kqL89mP8HxVPsMcB7Nrzs2u0gq0bTnL"
  },
  body: JSON.stringify({
    model: "agnes-image-2.0-flash",
    prompt: "a blue square",
    n: 1,
    size: "512x512"
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
.catch(e => console.error("Error:", e.message));
