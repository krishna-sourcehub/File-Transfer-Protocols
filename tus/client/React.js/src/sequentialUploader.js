import './App.css';
import * as tus from 'tus-js-client';
import { useState } from 'react';
import axios from'axios';
function App() {
  const [files, setFiles] = useState([]);
  const handleFileChange = (e) => {
    // Get the selected files from the input element
    setFiles(Array.from(e.target.files));
  };

  const fileUpload = () => {
    if (files.length === 0) return;

    files.forEach((file) => {
      // Create a new tus upload for each file
      const upload = new tus.Upload(file, {
        endpoint: 'http://localhost:1080/files/',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: function (error) {
          console.log('Failed to upload ' + file.name + ' because: ' + error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(file.name + ': ' + percentage + '%');
        },
        onSuccess: function () {
          console.log('Download %s from %s', file.name, upload.url);
          axios.post('http://localhost:1080/uploaded-file',{fileName:file.name, fileUrl:upload.url})
          .then(res=>{ console.log(res);
            console.log(res.data);
          }).catch(e=>{
            console.error('error',e);
          })
        },
      });

      // Check if there are any previous uploads to continue
      upload.findPreviousUploads().then(function (previousUploads) {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        
        // Start the upload
        upload.start();
      });
    });
  };

  return (
    <div className="App">
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={fileUpload}>Upload All Files</button>
    </div>
  );
}

export default App;
