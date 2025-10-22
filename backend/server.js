const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');


const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definido. Configure no painel do Render.');
  process.exit(1);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(helmet());

const dataRoutes = require('./src/routes/data.routes');
const authRoutes = require('./src/routes/auth.routes');
const expenseRoutes = require ('./src/routes/expenses.routes');
const categoryRoutes = require('./src/routes/category.routes');
const contactRoutes = require('./src/routes/contact.routes');

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api', expenseRoutes);
app.use('/api', categoryRoutes);
app.use('/api', contactRoutes);

app.get('/api', (req, res) =>{
    res.send('API is ready');
});

app.get('/test-route', (req, res) => res.send('OK'));

app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada'});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado'});
})

if (process.env.NODE_ENV !== 'test'){
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;




