require('dotenv').config();
const express = require('express');
const { AccessToken, VideoGrant } = require('livekit-server-sdk');

const app = express();
const PORT = process.env.PORT || 10000;

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LECTURER_PASSWORD = process.env.LECTURER_PASSWORD;
const ROOM_NAME = "main";

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error("ERROR: LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set in .env");
  process.exit(1);
}

app.use(express.static('public'));

app.get('/token', (req, res) => {
  try {
    const { identity, role, password } = req.query;

    if (!identity || !role) {
      return res.status(400).json({ error: "Missing identity or role" });
    }

    if (role === 'lecturer' && password !== LECTURER_PASSWORD) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
    const grant = new VideoGrant({ room: ROOM_NAME });
    at.addGrant(grant);

    const token = at.toJwt();
    res.json({ token, room: ROOM_NAME });

  } catch (err) {
    console.error('Token generation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
