const { connect } = window.livekitClient;

console.log("[lecturer.js] Script loaded");

const loginPanel = document.getElementById("login-panel");
const streamPanel = document.getElementById("stream-panel");
const preview = document.getElementById("preview");
const btnLogin = document.getElementById("btnLogin");
const btnShare = document.getElementById("btnShare");
const btnMute = document.getElementById("btnMute");
const btnEnd = document.getElementById("btnEnd");

let room, micEnabled = true;

btnLogin.onclick = async () => {
  console.log("[Login] Clicked");
  const pwd = document.getElementById("pwd").value;

  try {
    const resp = await fetch("/lecturer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd })
    });

    if (!resp.ok) {
      alert("Login failed");
      return;
    }

    const { token, url } = await resp.json();
    console.log("[Login] Got token and URL");

    room = await connect(url, token, { audio: true });
    console.log("[LiveKit] Connected");

    loginPanel.classList.add("hidden");
    streamPanel.classList.remove("hidden");
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed: " + err.message);
  }
};

btnShare.onclick = async () => {
  if (!room) return alert("Not connected");

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const [pubTrack] = room.localParticipant.publishStream(stream);
    preview.srcObject = new MediaStream([pubTrack.mediaStreamTrack]);
  } catch (err) {
    console.error("Screen share error:", err);
  }
};

btnMute.onclick = () => {
  if (!room) return;
  micEnabled = !micEnabled;
  room.localParticipant.audioTracks.forEach(t => t.track.setMuted(!micEnabled));
  btnMute.textContent = micEnabled ? "Mute Mic" : "Unmute Mic";
};

btnEnd.onclick = () => {
  if (room) room.disconnect();
  location.reload();
};
