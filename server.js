import express from "express";
import dotenv from "dotenv";
import { AccessToken } from "livekit-server-sdk";
import path from "path";
dotenv.config();

const {
  LIVEKIT_URL, LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET, LECTURER_PASSWORD
} = process.env;

const app = express();
const log = (lvl, msg) => console.log(`[${lvl}] ${msg}`);

app.use(express.json());
app.use(express.static("public"));

// Redirect root to attendee page
app.get("/", (req, res) => res.redirect("/attendee.html"));

// Lecturer-login endpoint
app.post("/lecturer/login", (req, res) => {
  const { password } = req.body;
  if (password !== LECTURER_PASSWORD) return res.status(401).json({ error: "Invalid password" });

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: "Moez",
    name: "Moez"
  });

  at.addGrant({
    roomJoin: true, room: "*",
    canPublish: true, canSubscribe: true,
    audio: true, video: false
  });

  const jwt = at.toJwt();
  log("INFO", `Lecturer authenticated as Moez`);
  res.json({ token: jwt, url: LIVEKIT_URL });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log("INFO", `Server started on port ${PORT}`));
