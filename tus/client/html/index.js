// Initialize Uppy\
document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  var uppy = Uppy.Core()
    .use(Uppy.Dashboard, {
      inline: true,
      target: "#drag-drop-area",
    })
    .use(Uppy.Tus, {
      endpoint: "http://localhost:1080/files/",
      metadata: {
        // If using file metadata, ensure that you are accessing the file correctly
        filename: (file) => file.name,
        filetype: (file) => file.type,
        data: "dummy file", // Custom metadata
        destination: "My-Folder", // Custom metadata
      },
      retryDelays: [0, 3000, 5000, 10000, 20000], // Retry logic
    });

  // Listen to upload success event
  uppy.on("upload-success", (file, response) => {
    console.log("Upload successful:", file);
    console.log("Server response:", response);
  });

  // Debug metadata being sent
  uppy.on("file-added", (file) => {
    console.log("File added:", file);
    console.log("Metadata:", file.meta); // Check metadata here
  });

  // If you want to dynamically set metadata before starting the upload
  uppy.on("upload", () => {
    uppy.setMeta({
      data: "dummy file", // Custom metadata
      destination: "My-Folder", // Custom metadata
    });
  });
});
