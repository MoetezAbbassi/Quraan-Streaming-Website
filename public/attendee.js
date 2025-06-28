const { connect } = window.livekitClient;

const joinPanel = document.getElementById("join-panel");
const attendPanel = document.getElementById("attend-panel");
const btnJoin = document.getElementById("btnJoin");
const attVideo = document.getElementById("attVideo");
const btnDownload = document.getElementById("btnDownload");

btnJoin.onclick = async () => {
  const name = document.getElementById("name").value || `Guest${Math.floor(Math.random()*1000)}`;
  const token = prompt("Please paste your attendee token"); // placeholder

  const room = await connect("wss://religious-lectures-dh7j0hsz.livekit.cloud", token, {
    audio: true, video: false
  });

  room.on("trackSubscribed", (track) => {
    const ms = new MediaStream([track.mediaStreamTrack]);
    attVideo.srcObject = ms;
    attVideo.play();
  });

  joinPanel.classList.add("hidden");
  attendPanel.classList.remove("hidden");

  btnDownload.onclick = () => {
    alert("Implement server-side recording or MediaRecorder client-side.");
  };
};
