import './App.css';
import * as tus from 'tus-js-client';
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const startUpload = (file) => {
    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: 'http://localhost:1080/files/',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.log('Failed to upload ' + file.name + ' because: ' + error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(file.name + ': ' + percentage + '%');
        },
        onSuccess: () => {
          console.log('Uploaded %s from %s', file.name, upload.url);
          // Post file details after successful upload
          axios.post('http://localhost:1080/uploaded-file', {
            fileName: file.name,
            fileUrl: upload.url
          })
          .then((res) => {
            console.log(res.data);
            resolve(res.data);
          })
          .catch((e) => {
            console.error('Error posting file details', e);
            reject(e);
          });
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        // Start the upload
        upload.start();
      });
    });
  };

  const fileUpload = async () => {
    if (files.length === 0) return;

    try {
      // Initiate all uploads in parallel
      await Promise.all(files.map((file) => startUpload(file)));
      console.log('All files uploaded successfully');
    } catch (error) {
      console.error('An error occurred while uploading files:', error);
    }
  };

  return (
    <div className="App">
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={fileUpload}>Upload All Files</button>
    </div>
  );
}

export default App;
