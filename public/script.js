import {
  Room,
  RemoteParticipant,
  RoomEvent,
  LocalAudioTrack,
  LocalVideoTrack,
  createLocalVideoTrack,
  createLocalAudioTrack
} from "https://cdn.skypack.dev/livekit-client";

const LIVEKIT_URL = location.origin.replace(/^http/, 'ws');
const ROOM_NAME = 'main';
let room;

async function fetchToken(name, role, password = '') {
  const res = await fetch(`/token?identity=${encodeURIComponent(name)}&room=${ROOM_NAME}&role=${role}&password=${password}`);
  const data = await res.json();
  return data.token;
}

window.joinAsViewer = async function () {
  const name = document.getElementById('name').value;
  const token = await fetchToken(name, 'viewer');

  room = new Room();
  room.on(RoomEvent.TrackSubscribed, (track) => {
    if (track.kind === 'video') {
      const el = track.attach();
      document.body.appendChild(el);
    } else if (track.kind === 'audio') {
      track.attach().play();
    }
  });

  await room.connect(LIVEKIT_URL, token);
};

window.joinAsLecturer = async function () {
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;
  const token = await fetchToken(name, 'lecturer', password);

  room = new Room();
  await room.connect(LIVEKIT_URL, token);

  const audio = await createLocalAudioTrack();
  await room.localParticipant.publishTrack(audio);

  const video = await createLocalVideoTrack({ facingMode: 'environment' });
  await room.localParticipant.publishTrack(video);

  const list = document.getElementById('attendeeList');
  room.on(RoomEvent.ParticipantConnected, (participant) => {
    const li = document.createElement('li');
    li.innerText = participant.identity;
    li.id = `user-${participant.identity}`;
    list.appendChild(li);
  });

  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    const el = document.getElementById(`user-${participant.identity}`);
    if (el) el.remove();
  });
};
