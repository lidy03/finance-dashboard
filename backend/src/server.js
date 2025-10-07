const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', authRoutes);

app.use(cors({
    origin: '*',
    methods: 'GET, HEAD, PUT, POST, DELETE',
    Credentials: true,
}));

app.get('/api', (req, res) =>{
    res.send('API is ready');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});


