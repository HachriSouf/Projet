const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const matchRoutes = require('./routes/matchRoutes');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4007;
const MONGODB_URI = process.env.MONGODB_URI;

// Connexion à MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connecté à MongoDB pour match-service'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Routes
app.use('/matches', matchRoutes);

app.listen(PORT, () => {
  console.log(`Service match-service en écoute sur le port ${PORT}`);
});
