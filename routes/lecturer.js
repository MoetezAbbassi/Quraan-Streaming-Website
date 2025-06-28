// routes/lecturer.js
import { Router } from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();
const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LECTURER_PASSWORD } = process.env;
const router = Router();
const log = (level, msg) => console.log(`[${level}] ${msg}`);

// POST /lecturer/login -> returns JWT token
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (password !== LECTURER_PASSWORD) {
    log('WARN', 'Failed lecturer login attempt');
    return res.status(401).json({ error: 'Invalid password' });
  }

  const identity = 'Moez';
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: 'Moez',
  });
  const grant = at.addGrant({
    roomJoin: true,
    room: '*',
    canPublish: true,
    canSubscribe: true,
    video: false,
    audio: true,
    recording: false,
  });
  const token = at.toJwt();
  log('INFO', `Lecturer logged in: identity=${identity}`);
  res.json({ token, url: LIVEKIT_URL });
});

export default router;
