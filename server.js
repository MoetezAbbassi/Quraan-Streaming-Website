require('dotenv').config(); // Load .env variables

const express = require('express');
const path = require('path');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Check if password is loaded correctly
console.log("Lecturer password from .env is:", process.env.LECTURER_PASSWORD);

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Token endpoint
app.get('/token', (req, res) => {
  const { identity, room, role, password } = req.query;

  // Validate required fields
  if (!identity || !room || !role) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  // Verify password if role is lecturer
  if (role === 'lecturer') {
    if (password !== process.env.LECTURER_PASSWORD) {
      console.log('⚠️ Invalid password attempt for lecturer:', password);
      return res.status(403).json({ error: 'Invalid password' });
    }
  }

  // Generate access token
  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity }
    );

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: role === 'lecturer',
      canPublishData: role === 'lecturer',
      canSubscribe: true,
    });

    const token = at.toJwt();
    return res.json({ token });
  } catch (err) {
    console.error('Error generating token:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
