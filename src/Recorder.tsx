import React, { useState, useEffect, useRef } from "react";
import { UploadManager, UploadResult } from "./UploadManager";

interface RecordingProps {
  onDownloadRecording: () => void;
}

const RecordingComponent: React.FC<RecordingProps> = ({
  onDownloadRecording,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>("");
  const [progressTime, setProgressTime] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const [recordBegin, setIsRecordBegin] = useState<boolean>(false);
  const [isStream, setIsStream] = useState<boolean>(false);

  const [audioBlob, setAudioBlob] = useState<Blob>();

  const [uploadStatus, setUploadStatus] = useState<String>();
  const [uploadSize, setUploadSize] = useState<number>();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleStartRecording = () => {
    if (!mediaRecorder.current) return;
    if(!recordingName)
    {
      setIsRecordBegin(true);
      return;
    }
    setAudioChunks([]);
    setAudioUrl("");
    mediaRecorder.current.start();
    setIsRecording(true);
    progressInterval.current = setInterval(() => {
      setProgressTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (!mediaRecorder.current || !progressInterval.current) return;
    mediaRecorder.current.stop();
    setIsRecording(false);
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
        setUploadSize(0);
      });
  };

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
      recordingName==="" && recordBegin &&
      <div>Name your recoding to start!</div>
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
              link.download = recordingName+`.webm`;
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
              if(audioBlob)
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
          {isUploading ? "Uploading" : "Upload Recording"}
          </button>
          {
           uploadStatus &&
           <div>{uploadStatus}</div>
          }
          {
           uploadSize && 
           <div>{uploadSize} bytes</div>
          }
        </div>
      )}
    </div>
  );
};

export default RecordingComponent;
