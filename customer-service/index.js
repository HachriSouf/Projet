const express = require('express');
const mongoose = require('mongoose');
const customerRoutes = require('./routes/custRoute'); 
const dotenv = require('dotenv');


const app = express();

dotenv.config();

// Middleware
app.use(express.json());

// Database connection

console.log('MongoDB URI:', process.env.MONGODB_URI);


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connecté à MongoDB'))
  .catch((error) => console.error('Erreur de connexion à MongoDB:', error));

app.use('/customer', customerRoutes);


app.get('/', (req, res) => {
  res.send('Service customer en fonctionnement!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
