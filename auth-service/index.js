const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes'); 
const initializeAdminUser = require('./src/controller/admin');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
console.log('Connecté à MongoDB');
initializeAdminUser();
})
.catch((error) => console.error('Erreur de connexion à MongoDB:', error));

app.get('/', (req, res) => {
  res.send('Service d\'authentification en fonctionnement!');
});


app.use('/auth', authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Service d'authentification en écoute sur le port ${PORT}`);
});
