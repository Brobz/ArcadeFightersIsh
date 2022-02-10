import express from 'express';
import { Server } from 'http';

export default function createServer() {

  const app = express();
  const server = new Server(app);

  // Serve all site contents from the /client folder from default route "/"
  app.use(express.static(__dirname + "/client"));

  //The 404 Route (must be the last route on the file)
  app.get('*', (req : any, res : any) => {
    res.sendFile(__dirname + "/client/404.html");
  });

  // Start the server (listen on specified port for incoming connections)
  server.listen(process.env.PORT || 5000);

  // All done!
  console.log(">> Server Ready!");

  return server;
}
