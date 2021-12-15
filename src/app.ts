import connectToDatabase from './database';
import createServer from './server';
import createIOSocket from './socket';
import update from './update_game';

const db = await connectToDatabase();
const server = createServer();
createIOSocket(server, db);

setInterval(update, 1000/60);
