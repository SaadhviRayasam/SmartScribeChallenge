import React, { useState, useEffect, useRef } from "react";
import { UploadManager } from "./UploadManager";
import "./Recorder.css";

interface RecordingProps {
  onDownloadRecording: () => void;
  onResettingRecording: () => void;
}

const RecordingComponent: React.FC<RecordingProps> = ({
  onDownloadRecording, onResettingRecording
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>("");
  const [progressTime, setProgressTime] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  //Recording States
  const [recordBegin, setIsRecordBegin] = useState<boolean>(false);
  const [isStream, setIsStream] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob>();

  //Upload States
  const [uploadStatus, setUploadStatus] = useState<String>();
  const [uploadSize, setUploadSize] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  //Volume States
  const [volume, setVolume] = useState(0);

  const handleStartRecording = () => {
    if (!mediaRecorder.current) return;
    if (!recordingName) {
      setIsRecordBegin(true);
      return;
    }
    setAudioChunks([]);
    setAudioUrl("");
    mediaRecorder.current.start();
    setIsRecording(true); //Recording in progress
    progressInterval.current = setInterval(() => {
      setProgressTime((prevTime) => prevTime + 1);
    }, 1000);

    //Resetting values
    onResettingRecording();
    setUploadSize(0);
    setUploadStatus("");
  };

  const handleStopRecording = () => {
    if (!mediaRecorder.current || !progressInterval.current) return;
    mediaRecorder.current.stop();
    setIsRecording(false); //Recording stopped
    // progressInterval.current = null;
    setProgressTime(0);
    clearInterval(progressInterval.current);
  };

  const handleUpload = (audioBlob: Blob) => {
    setIsUploading(true);
    UploadManager.upload(audioBlob)
      .then((response) => {
        setIsUploading(false);
        console.log(
          `Upload successful. Transcript: ${response.transcript}, Size: ${response.size} bytes`
        );
        setUploadStatus(response.transcript);
        setUploadSize(response.size);
      })
      .catch((error) => {
        console.error("Upload failed:", error.message);
        setUploadStatus(error.message);
        setUploadSize(0); //Default size for error
        setIsUploading(false);
      });
  };

  const uploadMessage = uploadSize === 0 ? "error" : "success";

  useEffect(() => {
    const initMediaRecorder = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error(
          "Media Devices or getUserMedia not supported in this browser."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream);
        setIsStream(true);
        mediaRecorder.current.ondataavailable = (event) => {
          setAudioChunks((currentChunks) => [...currentChunks, event.data]);
        };

        //Microphone Volume Functionality
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = function () {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          const arraySum = array.reduce((a, value) => a + value, 0);
          const level = arraySum / array.length;
          setVolume(level > 10 ? 9 : level);
        };

      } catch (err) {
        console.error("Failed to get user media", err);
      }
    };

    initMediaRecorder();
  }, []);

  useEffect(() => {
    if (audioChunks.length > 0 && !isRecording) {
      const audioB = new Blob(audioChunks, {
        type: "audio/webm;codecs=opus",
      });
      setAudioBlob(audioB);
      const url = URL.createObjectURL(audioB);
      setAudioUrl(url);
    }
  }, [audioChunks, isRecording]);


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        height: "70vh",
        padding: "20px",
        boxSizing: "border-box",
        border: "2px solid",
      }}
    >
      <input
        type="text"
        value={recordingName}
        onChange={(e) => setRecordingName(e.target.value)}
        placeholder="Name your recording"
        style={{
          width: "80%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {
        recordingName === "" && recordBegin &&
        <div className="error">Name your recoding to start!</div>
      }

      {isRecording &&
        <div className="wrapper">
          <span style={{ height: `${volume * 5 * Math.random()}%` }}></span>
          <span style={{ height: `${volume * 10 * Math.random()}%` }}></span>
          <span style={{ height: `${volume * 10}%` }}></span>
          <span style={{ height: `${volume * 10 * Math.random()}%` }}></span>
          <span style={{ height: `${volume * 5 * Math.random()}%` }}></span>
        </div>
      }

      {isStream &&
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      }
      <div style={{ marginBottom: "20px" }}>
        Progress Time: {progressTime} seconds
      </div>
      {audioUrl && (
        <div>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = audioUrl;
              link.download = recordingName + `.webm`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onDownloadRecording();

            }}
            style={{
              width: "80%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            Download Recording
          </button>

          <button
            onClick={() => {
              if (audioBlob)
                handleUpload(audioBlob);
            }}
            style={{
              width: "80%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isUploading ? "Uploading ..." : "Upload Recording"}
          </button>
          {
            uploadStatus &&
            <div className={uploadMessage}>{uploadStatus}</div>
          }
          {
            uploadSize != 0 &&
            <div className={uploadMessage}>Audio File Size: {uploadSize} bytes</div>
          }
        </div>
      )}
    </div>
  );
};

export default RecordingComponent;
