require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const filRoutes = require('./routes/filRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/fil', filRoutes);

app.get('/api/sante', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Serveur Sofra demarre sur le port ${PORT}`));
});
