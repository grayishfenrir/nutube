const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timelineRange = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");

const video = document.createElement("video");
const { url } = videoContainer.dataset;
video.src = url;
videoContainer.prepend(video);

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(14, 19);

playBtn.addEventListener("click", () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
});

muteBtn.addEventListener("click", () => {
    if (video.muted) {
        video.muted = false
    } else {
        video.muted = true
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : (volumeValue === "0" ? 0.5 : volumeValue);
});

volumeRange.addEventListener("input", (e) => {
    const {
        target: { value },
    } = e;

    if (video.muted) {
        video.muted = false;
    } else if (value === "0") {
        video.muted = true;
    }
    volumeValue = value;
    video.volume = volumeValue;
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
});

video.addEventListener("loadedmetadata", (e) => {
    videoControls.style.top = `${video.offsetHeight - 50}px`;
    const totalSeconds = Math.floor(video.duration);
    totalTime.innerText = formatTime(totalSeconds);
    timelineRange.max = totalSeconds;
});

video.addEventListener("timeupdate", () => {
    const currentSeconds = Math.floor(video.currentTime);
    currentTime.innerText = formatTime(currentSeconds);
    timelineRange.value = currentSeconds;
});

timelineRange.addEventListener("input", (e) => {
    const {
        target: { value },
    } = e;
    video.currentTime = timelineRange.value;
});

fullScreenBtn.addEventListener("click", () => {
    const fullScreen = document.fullscreenElement;
    if (fullScreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
});

const hideControls = () => videoControls.classList.remove("showing");

video.addEventListener("mousemove", () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }

    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000);
});

video.addEventListener("mouseleave", () => {
    controlsTimeout = setTimeout(hideControls, 3000);
});

video.addEventListener("ended", async () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/views`, {
        method: "POST",
    });
});

window.addEventListener("resize", (e) => {
    videoControls.style.top = `${video.offsetHeight - 50}px`;
});