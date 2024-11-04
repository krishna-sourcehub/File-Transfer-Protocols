import "./App.css";
import * as tus from "tus-js-client";
import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClick = () => {
    document.getElementById('fileID').click();
  };

  const startUpload = (file) => {
    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: "http://localhost:1080/files/",
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
          destination: "TA-IN",
        },
        onError: (error) => {
          console.error(`Failed to upload ${file.name}: ${error}`);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`${file.name}: ${percentage}%`);
        },
        onSuccess: () => {
          console.log(`Uploaded ${file.name} from ${upload.url}`);
          setUploadedFilesCount((prevCount) => {
            const newCount = prevCount + 1;
            setTotalPercentage(((newCount / files.length) * 100).toFixed(2)); // Update percentage here
            return newCount;
          });
          resolve(upload.url);
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  };

  const fileUpload = async () => {
    if (files.length === 0) return;

    setUploadedFilesCount(0); // Reset count before starting uploads
    setTotalPercentage(0); // Reset percentage

    try {
      await Promise.all(files.map(startUpload));
      console.log("All files uploaded successfully");
    } catch (error) {
      console.error("An error occurred while uploading files:", error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h3 style={{ textAlign: "center" }}>Upload Files</h3>
        <div className="drop_box">
          <header>
            <h4>Select File here</h4>
          </header>
          <p>Files Supported: PDF, TEXT, DOC, DOCX, MPEG, MP4</p>
          <input 
            type="file" 
            hidden 
            onChange={handleFileChange} 
            id="fileID" 
            multiple 
          />
          <button className="btn" onClick={handleClick}>Choose File</button>
          <button className="btn" onClick={fileUpload}>Upload</button>
        </div>

        <div className="drop_box">
          <header>
            <h4>Total Percentage of File Upload</h4>
          </header>
          {files.length > 0 && (
            <div>
              <p style={{ textAlign: "center" }}>Uploaded {uploadedFilesCount} of {files.length} files</p>
              <p>Total Upload Percentage: {totalPercentage}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
