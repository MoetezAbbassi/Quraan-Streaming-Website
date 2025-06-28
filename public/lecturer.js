import { connect, Room } from 'livekit-client';

const loginForm = document.getElementById('loginForm');
const streamingUI = document.getElementById('streamingUI');
const screenVideo = document.getElementById('screenShare');
const endBtn = document.getElementById('endBtn');

let room;

loginForm.addEventListener('submit', async ev => {
  ev.preventDefault();
  const password = document.getElementById('password').value;

  const resp = await fetch('/lecturer/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ password }),
  });
  if (!resp.ok) return alert('Auth failed');

  const { token, url } = await resp.json();
  room = await connect(url, token, { audio: true });
  alert('Connected as lecturer!');
  loginForm.style.display = 'none';
  streamingUI.style.display = 'block';

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const [track] = room.localParticipant.publishStream(stream);
  screenVideo.srcObject = new MediaStream([track.mediaStreamTrack]);
});

endBtn.addEventListener('click', () => {
  room.disconnect();
  location.reload();
});
