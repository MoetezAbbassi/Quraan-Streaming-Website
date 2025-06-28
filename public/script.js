async function connectToRoom(identity, role, password = '') {
  const status = document.getElementById('status');
  const attendeeList = document.getElementById('attendeeList');
  const videoContainer = document.getElementById('videoContainer');

  status.textContent = "Connecting...";

  try {
    const res = await fetch(`/token?identity=${encodeURIComponent(identity)}&role=${role}&password=${encodeURIComponent(password)}`);
    const data = await res.json();

    if (!res.ok) {
      status.textContent = `❌ ${data.error || 'Token fetch failed'}`;
      return;
    }

    const room = new window.Livekit.Room();

    room.on(window.Livekit.RoomEvent.ParticipantConnected, participant => {
      const li = document.createElement('li');
      li.id = `participant-${participant.sid}`;
      li.textContent = participant.identity;
      if (attendeeList) attendeeList.appendChild(li);
    });

    room.on(window.Livekit.RoomEvent.ParticipantDisconnected, participant => {
      const li = document.getElementById(`participant-${participant.sid}`);
      if (li) li.remove();
    });

    room.on(window.Livekit.RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'video') {
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.controls = true;
        videoElement.style.maxWidth = '100%';
        videoElement.onclick = () => {
          videoElement.requestFullscreen();
        };
        track.attach(videoElement);
        if (videoContainer) videoContainer.appendChild(videoElement);
      } else if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
      }
    });

    await room.connect(data.room, data.token);
    status.textContent = "✅ You are live!";

    if (role === 'lecturer') {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = new window.Livekit.LocalAudioTrack(audioStream.getAudioTracks()[0]);
      await room.localParticipant.publishTrack(audioTrack);

      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = new window.Livekit.LocalVideoTrack(screenStream.getVideoTracks()[0]);
      await room.localParticipant.publishTrack(screenTrack);
    }
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Go Live failed: ${err.message}`;
  }
}
