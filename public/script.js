import {
  Room,
  RoomEvent
} from "https://cdn.skypack.dev/livekit-client";

const LIVEKIT_URL = location.origin.replace(/^http/, 'ws');
const ROOM_NAME = 'main';

window.joinAsViewer = async function () {
  const name = document.getElementById('name').value.trim();
  if (!name) {
    alert('Please enter your name.');
    return;
  }

  const res = await fetch(`/token?identity=${encodeURIComponent(name)}&room=${ROOM_NAME}&role=viewer`);
  const { token } = await res.json();

  const room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track) => {
    if (track.kind === 'video') {
      const video = track.attach();
      document.body.appendChild(video);
    } else if (track.kind === 'audio') {
      const audio = track.attach();
      audio.play();
    }
  });

  await room.connect(LIVEKIT_URL, token);
};
