async function connectToRoom(identity, role, password = "") {
  const statusEl = document.getElementById("status");
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  try {
    setStatus("🔐 Requesting token...");

    const res = await fetch(`/token?identity=${encodeURIComponent(identity)}&role=${role}&password=${encodeURIComponent(password)}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const { token } = await res.json();
    setStatus("🔗 Connecting to room...");

    const room = new window.LiveKit.Room();

    room.on(window.LiveKit.RoomEvent.ParticipantConnected, (participant) => {
      console.log(`✅ ${participant.identity} joined`);
      const list = document.getElementById("attendeeList");
      if (list) {
        const li = document.createElement("li");
        li.textContent = participant.identity;
        li.id = `participant-${participant.sid}`;
        list.appendChild(li);
      }
    });

    room.on(window.LiveKit.RoomEvent.ParticipantDisconnected, (participant) => {
      const li = document.getElementById(`participant-${participant.sid}`);
      if (li) li.remove();
    });

    room.on(window.LiveKit.RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === "video") {
        const container = document.getElementById("videoContainer");
        if (container) {
          const videoEl = track.attach();
          videoEl.style.maxWidth = "100%";
          videoEl.style.cursor = "zoom-in";
          videoEl.onclick = () => {
            const zoomed = videoEl.style.transform === "scale(2)";
            videoEl.style.transform = zoomed ? "scale(1)" : "scale(2)";
            videoEl.style.transition = "transform 0.2s";
          };
          container.innerHTML = "";
          container.appendChild(videoEl);
        }
      }
    });

    await room.connect(window.LIVEKIT_URL, token);
    setStatus("✅ Connected");

    if (role === "lecturer") {
      setStatus("🎙 Publishing audio...");
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = new window.LiveKit.LocalAudioTrack(micStream.getAudioTracks()[0]);
      await room.localParticipant.publishTrack(audioTrack);

      setStatus("🖥 Starting screenshare...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = new window.LiveKit.LocalVideoTrack(screenStream.getVideoTracks()[0]);
      await room.localParticipant.publishTrack(screenTrack);

      setStatus("🚀 You are live!");
    }
  } catch (err) {
    console.error("❌ Connection failed:", err);
    setStatus(`❌ ${err.message}`);
  }
}
