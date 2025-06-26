require('dotenv').config();
const express = require('express');
const { AccessToken, VideoGrant } = require('livekit-server-sdk');

const app = express();
const PORT = process.env.PORT || 10000;

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LECTURER_PASSWORD = process.env.LECTURER_PASSWORD;
const ROOM_NAME = "main";

app.use(express.static('public'));

app.get('/token', (req, res) => {
  const { identity, role, password } = req.query;

  if (!identity || !role) {
    return res.status(400).json({ error: "Missing identity or role" });
  }

  if (role === 'lecturer') {
    if (password !== LECTURER_PASSWORD) {
      return res.status(401).json({ error: "Incorrect password" });
    }
  }

  // Create AccessToken for LiveKit
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
  });
  const grant = new VideoGrant({ room: ROOM_NAME });
  at.addGrant(grant);

  const token = at.toJwt();
  res.json({ token, room: ROOM_NAME });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
