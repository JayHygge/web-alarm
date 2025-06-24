// --- Analog Clock Drawing ---
const analogDiv = document.getElementById("clock-analog");
const canvas = document.createElement("canvas");
canvas.width = 180;
canvas.height = 180;
analogDiv.appendChild(canvas);
const ctx = canvas.getContext("2d");

function drawAnalogClock(date) {
  ctx.clearRect(0, 0, 180, 180);
  // Clock face
  ctx.save();
  ctx.translate(90, 90);
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, 2 * Math.PI);
  ctx.fillStyle = "#fffbe7";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f9d423";
  ctx.stroke();
  // Dots for hours
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 6);
    ctx.beginPath();
    ctx.arc(0, -65, 4, 0, 2 * Math.PI);
    ctx.fillStyle = i % 3 === 0 ? "#ff4e50" : "#f9d423";
    ctx.fill();
    ctx.restore();
  }
  // Hands
  const hour = date.getHours() % 12;
  const min = date.getMinutes();
  const sec = date.getSeconds();
  // Hour hand
  ctx.save();
  ctx.rotate(((hour + min / 60) * Math.PI) / 6);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(0, -40);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ff4e50";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
  // Minute hand
  ctx.save();
  ctx.rotate(((min + sec / 60) * Math.PI) / 30);
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(0, -60);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#f9d423";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
  // Second hand
  ctx.save();
  ctx.rotate((sec * Math.PI) / 30);
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(0, -65);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff4e50";
  ctx.stroke();
  ctx.restore();
  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "#f9d423";
  ctx.fill();
  ctx.restore();
}

// --- Digital Clock (Countdown) ---
const digitalDiv = document.getElementById("clock-digital");
function pad(n) {
  return n.toString().padStart(2, "0");
}
let countdownTotal = 0; // Store the total countdown duration in seconds
function updateDigitalCountdown(now) {
  if (alarmActive && alarmTime) {
    let diff = Math.ceil((alarmTime - now) / 1000); // Use ceil to show the full duration
    diff = Math.max(0, diff);
    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;
    digitalDiv.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  } else {
    digitalDiv.textContent = "00:00:00";
  }
}

// --- Alarm Dropdowns (Duration) ---
const hourSel = document.getElementById("alarm-hour");
const minSel = document.getElementById("alarm-minute");
const secSel = document.getElementById("alarm-second");

function populateDropdowns() {
  // Clear existing
  hourSel.innerHTML = "";
  minSel.innerHTML = "";
  secSel.innerHTML = "";
  // Hours: 0, 1, 2
  for (let h = 0; h <= 2; h++) {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = pad(h);
    hourSel.appendChild(opt);
  }
  // Minutes: 0-59
  for (let m = 0; m < 60; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = pad(m);
    minSel.appendChild(opt);
  }
  // Seconds: 0-59
  for (let s = 0; s < 60; s++) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = pad(s);
    secSel.appendChild(opt);
  }
  // Default: 0h 0m 0s
  hourSel.value = 0;
  minSel.value = 0;
  secSel.value = 0;
}

// --- Alarm Logic (Countdown) ---
let alarmTime = null;
let alarmActive = false;
let alarmPlayCount = 0;
const alarmAudio = document.getElementById("alarm-audio");
let alarmShouldPlay = false;

function getSelectedAlarmDuration() {
  const h = parseInt(hourSel.value, 10);
  const m = parseInt(minSel.value, 10);
  const s = parseInt(secSel.value, 10);
  return h * 3600 + m * 60 + s;
}

function checkAlarm(now) {
  if (!alarmActive || !alarmTime) return;
  if (now >= alarmTime) {
    alarmActive = false;
    alarmShouldPlay = true;
    playAlarmSoundTwice();
  }
}

function playAlarmSoundTwice() {
  alarmPlayCount = 0;
  if (!alarmShouldPlay) return;
  alarmShouldPlay = false;
  alarmAudio.currentTime = 0;
  alarmAudio
    .play()
    .then(() => {
      alarmPlayCount = 1;
    })
    .catch(() => {
      alert("Alarm! (Audio could not be played)");
    });
}

alarmAudio.addEventListener("ended", () => {
  if (alarmPlayCount === 1) {
    alarmAudio.currentTime = 0;
    alarmAudio
      .play()
      .then(() => {
        alarmPlayCount = 2;
      })
      .catch(() => {
        alert("Alarm! (Audio could not be played)");
      });
  }
});

// --- Form Handlers ---
document.getElementById("alarm-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const duration = getSelectedAlarmDuration();
  if (duration <= 0 || duration > 2 * 3600) {
    alert("Please select a duration between 1 second and 2 hours.");
    return;
  }
  const now = new Date();
  alarmTime = new Date(now.getTime() + duration * 1000);
  alarmActive = true;
  alarmShouldPlay = false;
  countdownTotal = duration; // Store the total duration for accurate display
});

document.getElementById("reset-alarm").addEventListener("click", function () {
  alarmActive = false;
  alarmTime = null;
  alarmShouldPlay = false;
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
  populateDropdowns();
});

// --- Main Loop ---
function tick() {
  const now = new Date();
  drawAnalogClock(now);
  updateDigitalCountdown(now);
  checkAlarm(now);
  requestAnimationFrame(tick);
}

// --- Init ---
populateDropdowns();
tick();
