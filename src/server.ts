import express from 'express';
import { Server } from 'http';

export default function createServer() {

  const app = express();
  const server = new Server(app);

  // Serve all site contents from the /client folder to all default route "/" requests
  app.use(express.static(__dirname + "/client"));

  //The 404 Route (must be the last route on the file)
  app.all('*', (req : any, res : any) => {
    res.status(404).sendFile(__dirname + "/client/404.html");
  });

  // Start the server (listen on specified port for incoming connections)
  server.listen(process.env.PORT || 5000);

  // All done!
  console.log(">> Server Ready!");

  return server;
}
