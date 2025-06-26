require('dotenv').config();
const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

function createToken(identity, isLecturer = false) {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    ttl: 60 * 60, // 1 hour
  });

  at.addGrant({
    roomJoin: true,
    room: 'main-room',
    canPublish: isLecturer,
    canSubscribe: true,
  });

  return at.toJwt();
}

app.post('/token', (req, res) => {
  const { role, password } = req.body;

  if (role === 'lecturer') {
    if (password !== process.env.LECTURER_PASSWORD) {
      return res.status(403).json({ error: 'Invalid password' });
    }
    const token = createToken('lecturer-' + Date.now(), true);
    return res.json({ token, url: process.env.LIVEKIT_URL });
  }

  // Viewer
  const token = createToken('viewer-' + Date.now(), false);
  return res.json({ token, url: process.env.LIVEKIT_URL });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
