import { connect } from 'livekit-client';

const joinBtn = document.getElementById('joinBtn');
const attendUI = document.getElementById('attendUI');
const attendeeVideo = document.getElementById('attendeeVideo');
const downloadBtn = document.getElementById('downloadBtn');

joinBtn.addEventListener('click', async () => {
  const name = document.getElementById('nameInput').value || `Guest${Math.floor(Math.random()*1000)}`;
  // These factors are placeholders—you'd get a valid token from your backend in prod.
  const token = prompt('Paste attendee token from backend'); 
  const room = await connect('wss://religious-lectures-dh7j0hsz.livekit.cloud', token, { audio: true, video: false });
  
  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      const stream = new MediaStream([track.mediaStreamTrack]);
      attendeeVideo.srcObject = stream;
      attendeeVideo.play();
    }
  });

  joinBtn.disabled = true;
  attendUI.style.display = 'block';

  downloadBtn.addEventListener('click', () => {
    const mediaStream = attendeeVideo.srcObject;
    // Download logic via MediaRecorder or server-side recording.
    alert('Implement download server or MediaRecorder here');
  });
});
