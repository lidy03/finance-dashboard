const express = require('express');
require('dotenv').config();
const authRoutes = require('./src/routes/auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.use(cors({
    origin: '*',
    methods: 'GET, HEAD, PUT, POST, DELETE',
    Credentials: true,
}));

app.get('/api', (req, res) =>{
    res.send('API is ready');
});

app.get('/test-route', (req, res) => res.send('OK'));

module.exports = app;




