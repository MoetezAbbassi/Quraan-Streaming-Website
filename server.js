// server.js
import express from 'express';
import dotenv from 'dotenv';
import lecturerRouter from './routes/lecturer.js';
import path from 'path';

dotenv.config();
const app = express();
const log = (level, msg) => console.log(`[${level}] ${msg}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public frontend
app.use(express.static('public'));

// Lecturer authentication and token generation
app.use('/lecturer', lecturerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log('INFO', `Server listening on port ${PORT}`));
