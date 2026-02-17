const WORK_INTERVAL_SECONDS = 15 * 60;
const BREATH_SECONDS = 4;

const countdownElement = document.getElementById("countdown");
const toggleButton = document.getElementById("toggleTimer");
const breathingCard = document.getElementById("breathingCard");
const breathingTitle = document.getElementById("breathingTitle");
const breathingCount = document.getElementById("breathingCount");
const breathingHint = document.getElementById("breathingHint");
const closeBreathingButton = document.getElementById("closeBreathing");

let timerId;
let breathingId;
let remaining = WORK_INTERVAL_SECONDS;
let isRunning = false;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderCountdown() {
  countdownElement.textContent = formatTime(remaining);
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showSystemNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  new Notification("Koniec 15-minútového okna", {
    body: "Nadýchni sa zhlboka a pomaly vydýchni. Nádych 4 doby, výdych 4 doby.",
  });
}

function playReminderTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 660;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.6);

  oscillator.start(now);
  oscillator.stop(now + 0.6);
}

function stopBreathingGuide() {
  clearInterval(breathingId);
  breathingCard.classList.add("hidden");
  breathingHint.textContent = "Nádych na 4 doby, potom výdych na 4 doby.";
}

function startBreathingGuide() {
  breathingCard.classList.remove("hidden");
  let phase = "inhale";
  let count = BREATH_SECONDS;

  breathingTitle.textContent = "Nadýchni sa";
  breathingCount.textContent = count;

  clearInterval(breathingId);
  breathingId = setInterval(() => {
    count -= 1;

    if (count > 0) {
      breathingCount.textContent = count;
      return;
    }

    phase = phase === "inhale" ? "exhale" : "inhale";
    count = BREATH_SECONDS;

    if (phase === "inhale") {
      breathingTitle.textContent = "Nadýchni sa";
      breathingHint.textContent = "Nádych na 4 doby.";
    } else {
      breathingTitle.textContent = "Pomaly vydýchni";
      breathingHint.textContent = "Výdych na 4 doby.";
    }

    breathingCount.textContent = count;
  }, 1000);
}

function finishWorkInterval() {
  showSystemNotification();
  playReminderTone();
  startBreathingGuide();
  remaining = WORK_INTERVAL_SECONDS;
  renderCountdown();
}

function startTimer() {
  requestNotificationPermission();
  isRunning = true;
  toggleButton.textContent = "Pozastaviť";

  clearInterval(timerId);
  timerId = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      finishWorkInterval();
      return;
    }

    renderCountdown();
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  toggleButton.textContent = "Pokračovať";
  clearInterval(timerId);
}

toggleButton.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
    return;
  }

  startTimer();
});

closeBreathingButton.addEventListener("click", () => {
  stopBreathingGuide();
});

renderCountdown();
