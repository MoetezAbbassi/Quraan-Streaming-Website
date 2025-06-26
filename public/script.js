async function startBroadcast() {
  const password = document.getElementById('password').value;

  const res = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'lecturer', password }),
  });

  if (!res.ok) {
    alert('Invalid password');
    return;
  }

  const { token, url } = await res.json();
  const room = await Livekit.connect(url, token);

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  const audio = await navigator.mediaDevices.getUserMedia({ audio: true });

  stream.addTrack(audio.getAudioTracks()[0]);

  room.localParticipant.publishTracks(stream.getTracks());
  alert('You are live!');
}

async function startViewer() {
  const res = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'viewer' }),
  });

  const { token, url } = await res.json();
  const room = await Livekit.connect(url, token);

  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      const el = track.attach();
      document.getElementById('video').appendChild(el);
    }
  });
}
