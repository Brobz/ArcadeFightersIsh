import connectToDatabase from './database';
import createServer from './server';
import createIOSocket from './socket';
import update from './update_game';

connectToDatabase().then(db => {
  const server = createServer();
  createIOSocket(server, db);

  setInterval(update, 1000/60);
})
