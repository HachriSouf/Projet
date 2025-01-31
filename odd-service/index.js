const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const oddsRoutes = require('./routes/oddsRoutes'); // Importer les routes
const consumeMatchCreatedMessage = require('./routes/consume');
dotenv.config();

const app = express();

// Middleware pour parser les JSON
app.use(express.json());

// Affiche l'URI MongoDB dans les logs pour debug
console.log('Connexion à MongoDB avec l\'URI :', process.env.MONGODB_URI);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch((error) => {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  });


// Route de base pour tester le service
app.get('/', (req, res) => {
  res.send('Service odd-service en fonctionnement !');
});

// Utiliser les routes pour gérer les cotes
app.use('/odds', oddsRoutes);

(async () => {
  console.log('Starting Match Consumer...');
  await consumeMatchCreatedMessage();
})();

// Démarrage du serveur
const PORT = process.env.PORT || 4008;
app.listen(PORT, () => {
  console.log(`Service des cotes en écoute sur le port ${PORT}`);
});
