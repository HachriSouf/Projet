const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const teamRoutes = require('./routes/teamRoutes');

dotenv.config();

const app = express();

// Middleware pour parser les JSON
app.use(express.json());

// Affiche l'URI MongoDB dans les logs pour debug
console.log('Connexion à MongoDB avec l\'URI :', process.env.MONGODB_URI);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connecté à MongoDB'))
  .catch((error) => {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1); // Arrête l'application si la connexion échoue
  });

// Route de base pour tester le service
app.get('/', (req, res) => {
  res.send('Service team-service en fonctionnement !');
});

// Utilisation des routes pour gérer les équipes
app.use('/teams', teamRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`Service d'équipes en écoute sur le port ${PORT}`);
});
