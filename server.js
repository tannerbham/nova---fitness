const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || "";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/chat", (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: { message: "API key not configured on server." } });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const request = https.request(options, (apiRes) => {
    res.status(apiRes.statusCode);
    let data = "";
    apiRes.on("data", (chunk) => (data += chunk));
    apiRes.on("end", () => {
      try { res.json(JSON.parse(data)); }
      catch { res.send(data); }
    });
  });

  request.on("error", (e) => res.status(500).json({ error: { message: e.message } }));
  request.write(body);
  request.end();
});

app.listen(PORT, () => console.log(`Nova running at http://localhost:${PORT}`));
