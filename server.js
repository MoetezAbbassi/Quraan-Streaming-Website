require('dotenv').config();
const express = require('express');
const path = require('path');
const { AccessToken } = require('livekit-server-sdk');
const app = express();

const {
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  LIVEKIT_URL,
  LECTURER_PASSWORD,
} = process.env;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/token', async (req, res) => {
  const { identity, role, password } = req.query;

  if (!identity || !role) {
    return res.status(400).json({ error: 'Missing identity or role' });
  }

  if (role === 'lecturer' && password !== LECTURER_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
  });

  token.addGrant({
    roomJoin: true,
    room: 'main',
    canPublish: role === 'lecturer',
    canPublishData: true,
    canSubscribe: true,
  });

  res.json({ token: token.toJwt(), room: LIVEKIT_URL });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
