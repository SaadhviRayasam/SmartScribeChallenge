import "./App.css";
import RecordingComponent from "./Recorder";
import { useState } from "react";

function App() {
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  return (
    <>
      <div>User has downloaded recording: {String(isDownloaded)}</div>
      <RecordingComponent onDownloadRecording={function (): void {
        setIsDownloaded(true);
      }} onResettingRecording={function (): void {
        setIsDownloaded(false);
      }} />
    </>
  );
}

export default App;
