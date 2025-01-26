const express = require('express');
const fs = require('fs');
const path = require('path');
const Team = require('../models/Team'); // Modèle MongoDB
const router = express.Router();

router.post('/import', async (req, res) => {
  try {
    console.log('Début de l\'importation...');

    // Liste des fichiers à importer
    const files = [
      { filePath: path.join(__dirname, 'champions-league-24-25-teams.json'), format: 'default' },
      { filePath: path.join(__dirname, 'csvjson.json'), format: 'custom' }
    ];

    for (const file of files) {
      console.log('Chemin du fichier JSON :', file.filePath);

      if (fs.existsSync(file.filePath)) {
        const rawData = JSON.parse(fs.readFileSync(file.filePath, 'utf-8'));
        console.log(`Données brutes lues depuis le fichier ${file.filePath}:`, rawData);

        // Adapter les données en fonction du format
        const adaptedData = rawData.map(item => {
          if (file.format === 'default') {
            return {
              name: item.name,
              country: item.country,
              coefficient: item.coefficient
            };
          } else if (file.format === 'custom') {
            return {
              name: item.Club,
              country: item.Country,
              coefficient: item.Elo // Transforme Elo en coefficient
            };
          }
        });

        console.log(`Données adaptées pour le fichier ${file.filePath}:`, adaptedData);

        // Insérer les données dans MongoDB
        await Team.insertMany(adaptedData);
        console.log(`Données insérées avec succès depuis ${file.filePath}`);
      } else {
        console.error(`Le fichier ${file.filePath} n'existe pas.`);
      }
    }

    res.status(200).send('Tous les fichiers ont été importés avec succès !');
  } catch (err) {
    console.error('Erreur durant l\'importation :', err);
    res.status(500).send('Erreur lors de l\'importation des équipes.');
  }
});

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    console.error('Erreur lors de la récupération des équipes :', err);
    res.status(500).send('Erreur lors de la récupération des équipes.');
  }
});
module.exports = router;
