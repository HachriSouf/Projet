const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const betRoutes = require('./src/routes/betRoutes');
const consumeMatchEndedMessages = require('./src/controller/Consume');
const consumeCombinedBets = require('./src/controller/ConsumeCombined');



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
  res.send('service betting en fonctionnement!');
});

app.use('/bet', betRoutes);

(async () => {
  console.log('Starting Match Consumer...');
  await consumeMatchEndedMessages();
  await consumeCombinedBets();
})();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
