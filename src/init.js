import 'dotenv/config';
import './configs/db.js';
import app from './configs/server.js';

// models
import './models/Video.js';
import './models/User.js';
import './models/Session.js';
import './models/Comment.js';

const PORT = process.env.SERVER_PORT

app.listen(PORT, () => console.log(`start litening ${PORT}`));