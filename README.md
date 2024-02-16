# SmartScribe SWE Intern Code Challenge

Welcome to my implementation of SmartScribe Software Engineering Intern Code Challenge!

## Objectives

The task was to build and improve upon a React component that allows users to record audio, name their recordings, download the audio file, and simulate an upload process for transcription. The challenge is divided into stages, each with its own set of requirements. The specific instructions are in the INSTRUCTIONS.md file in the repo.

- **Stage I**: Focuses on fixing some existing bugs.
- **Stage II**: Aims at improving the user experience based on given criteria and using browser media APIs.
- **Stage III**: Involves implementing a new feature related to audio upload and transcription simulation.
- **BONUS Stage IV**: (Optional) Enhances the application by providing visual feedback on microphone input volume.

## Methodology and Implementation

**Stage I : Fix the problems**:
- When a user clicks the stop recording button, the time interval is cleared, and progress time is reset using the `clearInterval` function.
- On downloading the recorded audio, the downloaded status is updated to true by setting the `isDownloaded` const to true.

**Stage II : Improve the UX**:
- If microphone access is blocked, the user will not be allowed to record. This is implemented using the `isStream` state, which can take boolean values. It is set to true when media access is allowed.
- When the user attempts to record without providing a name, an error message (in red) is displayed. Only upon naming is recording functionality enabled. The `recordingName` state should be a non-empty string for the `Start Recording` button to be enabled.
- Once the audio is recorded to the user's satisfaction, it can be downloaded. The downloaded file has the same name as the recording. The `recordingName` is fetched, and the downloaded file is in the format of `recordingName.webm`

**Stage III : Implement a new feature**: 
- The upload button simulates a transcription process whereby the audio is sent to a server, and a transcript is returned. The function takes 5 seconds to run and can either fail or succeed. On click of this button, the `handleUpload` function is triggered.
- During the 5-second processing time, the button reads `Uploading ...`, indicating that it is in progress. The state `isUploading` which takes boolean values, keeps track of the upload status to display the appropriate name on the button.
- An error message (in red) is displayed in the event of an upload failure. It prompts the user to try re-uploading. This is implemented using the `uploadStatus` state, which holds String values. By default, it is an empty string and is updated by the `UploadManager.ts` to display the error.
- When the upload is successful, the success message, along with the size of the transcript in bytes (in green), is shown. Again, the `uploadStatus` state stores the transcript of the audio file.

**BONUS : Stage IV : Indicate Microphone Input Volume**: 
- Five green candle sticks of varying length are shown to indicate that the microphone is working along with the intensity of the volume. The height of the sticks indicate the volume of the audio captured.
- This can be viewed throughout the recording process, and is implemented using the `volume` state. This state is utilized to calculate the height to be shown.

## Conclusion and Future Work

It was a lot of fun to play around and implement this challenge! While testing the application, I noticed the following scenario: After downloading (and/or uploading) the recording, the download (and/or upload) status is updated. Next, if the user starts recording again, the download (and/or upload) status will still be visible. This case was also handled by resetting values when recording starts. 

As a future work, I would like to implement a feature where the user can edit/copy-paste the transcript after uploading. This feature would mock the SmartScribe technology to edit and prepare note to copy and paste into the EHR.
