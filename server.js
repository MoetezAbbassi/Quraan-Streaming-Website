require("dotenv").config();
const express = require("express");
const path = require("path");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// Token route
app.get("/token", (req, res) => {
  const { identity, role, password } = req.query;

  if (!identity || !role) {
    return res.status(400).json({ error: "Missing identity or role" });
  }

  if (role === "lecturer" && password !== process.env.LECTURER_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const roomName = "main";
  const grant = {
    room: roomName,
    roomJoin: true,
    canPublish: role === "lecturer",
    canPublishData: role === "lecturer",
    canSubscribe: true,
  };

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    ttl: 60 * 60,
  });
  token.addGrant({ video: grant });

  const jwt = token.toJwt();

  res.json({
    token: jwt,
    room: process.env.LIVEKIT_URL,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
