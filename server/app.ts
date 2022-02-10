import connectToDatabase from './database';
import createServer from './server';
import createIOSocket from './socket';
import update from './update_game';

connectToDatabase().then(db => {
  const server = createServer();
  createIOSocket(server, db);

  const refresh_rate = process.env.REFRESH_RATE;
  if (refresh_rate == null)
    throw Error('>> Environment Variable missing: "REFRESH_RATE"');

  setInterval(update, 1000 / parseInt(refresh_rate));
})
