const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bookRoutes = require('./src/routes/bookRoutes');


const app = express();

dotenv.config();

app.use(express.json());


console.log('MongoDB URI:', process.env.MONGODB_URI);


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connecté à MongoDB'))
  .catch((error) => console.error('Erreur de connexion à MongoDB:', error));



app.get('/', (req, res) => {
  res.send('Service bookmaker en fonctionnement!');
});

app.use('/bookmaker',bookRoutes);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
