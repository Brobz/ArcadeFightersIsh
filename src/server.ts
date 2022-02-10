import express from 'express';
import { Server } from 'http';

export default function createServer() {

  const app = express();
  const server = new Server(app);

  app.use(express.static(__dirname + "/client"));

  server.listen(process.env.PORT || 5000);

  console.log(">> Server Ready!");

  return server;
}
