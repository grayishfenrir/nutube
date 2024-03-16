import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
    actionBtn.removeEventListener("click", handleDownload);
    actionBtn.innerText = "Transcoding...";
    actionBtn.disabled = true;

    // const webmFileName = "recording.webm";
    // const outputMp4FileName = "MyRecording.mp4";
    // const thumbnailFileName = "thimbnail.jpg";

    const r1 = (Math.random() + 1).toString(36).substring(7);
    const r2 = (Math.random() + 1).toString(36).substring(7);
    const r3 = (Math.random() + 1).toString(36).substring(7);
    const webmFileName = `${r1}.webm`;
    const outputMp4FileName = `${r2}.mp4`;
    const thumbnailFileName = `${r3}.jpg`;

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg.on("log", ({ type, message }) => {
        // TODO: make Progress bar?
        console.log(message);
    });

    await ffmpeg.writeFile(webmFileName, await fetchFile(videoFile));

    // transcode to 60frame mp4
    await ffmpeg.exec(["-i", webmFileName, "-r", "60", outputMp4FileName]);
    const mp4File = await ffmpeg.readFile(outputMp4FileName);
    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const mp4Url = URL.createObjectURL(mp4Blob);

    // make thumbnail
    await ffmpeg.exec(["-i", webmFileName, "-ss", "00:00:01", "-frames:v", "1", thumbnailFileName]);
    const thumbFile = await ffmpeg.readFile(thumbnailFileName);
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
    const thumbUrl = URL.createObjectURL(thumbBlob);

    download(mp4Url, outputMp4FileName)
        .then(download(thumbUrl, thumbnailFileName).then(
            async () => {
                await ffmpeg.deleteFile(webmFileName);
                await ffmpeg.deleteFile(outputMp4FileName);
                await ffmpeg.deleteFile(thumbnailFileName);

                URL.revokeObjectURL(mp4Url);
                URL.revokeObjectURL(thumbUrl);
                URL.revokeObjectURL(videoFile);
            }
        ));
    actionBtn.disabled = false;
    actionBtn.innerText = "Record Again";
    actionBtn.addEventListener("click", handleStart);
};

const download = (fileUrl, fileName) => {
    return new Promise(function (resolve) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        resolve();
    });
};

const handleStart = () => {
    actionBtn.innerText = "Recording";
    actionBtn.disabled = true
    actionBtn.removeEventListener("click", handleStart);

    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
        videoFile = URL.createObjectURL(e.data);
        video.srcObject = null;
        video.src = videoFile;
        video.play();
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click", handleDownload);
    }
    recorder.start();
    setTimeout(() => {
        recorder.stop();
    }, 5000);
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 1024,
            height: 576,
        },
    });
    video.srcObject = stream;
    video.play();
};

init();

actionBtn.addEventListener("click", handleStart);