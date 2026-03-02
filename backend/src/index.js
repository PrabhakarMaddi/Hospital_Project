const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' },
});

// Make io available in controllers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tokens', tokenRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Hospital API is running' });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { io };
