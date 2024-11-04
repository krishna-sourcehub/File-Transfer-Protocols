const { FileStore } = require("@tus/file-store");
const express = require("express");
const { Server } = require("@tus/server");
const { EVENTS } = require("@tus/server");
const cors = require("cors");
const crypto = require("crypto");


const server = new Server({
  path: "/files",
  datastore: new FileStore({ directory: "./uploads" }),


  // optional  functionality deponds on your needs
  // Add the custom Name and custom location for files 
  namingFunction(req) {
    const id = crypto.randomBytes(16).toString("hex");
    const folder = getFolderForUser(req); // your custom logic
    return `users/${folder}/${id}`;
  },
  // return the file location URL
  generateUrl(req, { proto, host, path, id }) {
    id = Buffer.from(id, "utf-8").toString("base64url");
    return `${proto}://${host}${path}/${id}`;
  },


  getFileIdFromRequest(req, lastPath) {
    // lastPath is everything after the last `/`
    // If your custom URL is different, this might be undefined
    // and you need to extract the ID yourself
    return Buffer.from(lastPath, "base64url").toString("utf-8");
  }
});


function getFolderForUser(req) {
    return "UserId";
  }

// when first part file uploading time this event is triggered  
// server.on(EVENTS.POST_CREATE, (req, res, upload) => { //working
//     console.log("event triggered post create");
// });

// while patching the file offset at this time event will triggered
// server.on(EVENTS.POST_RECEIVE_V2, (req, upload) => {  // working
//     console.log("event triggered post receive 2", upload);
// })

// after file upload, this event will triggered and return uploaded file path, id and location 
server.on(EVENTS.POST_FINISH, (req, res, upload) => {
  //working
  console.log("event triggered post finished", upload);
});

// this event called after an upload has been terminated and a response has been sent to the client.
// server.on(EVENTS.POST_TERMINATE, (req, res, id) => {
//     console.log("event triggered post terminate");
// });

const app = express();

// Enable JSON parsing for incoming requests
app.use(express.json());

// Enable CORS for all origins (modify as necessary)
app.use(cors({ origin: "*" }));

// Handle all routes under /files for Tus protocol
app.all("/files/*", (req, res) => {
  server.handle(req, res);
});

const host = "localhost";
const port = 1080;

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
