const express = require('express');
const fs = require('fs');
const path = require('path');
const Team = require('../models/Team'); // Modèle MongoDB
const mongoose = require('mongoose'); // Ajout de l'import manquant
const router = express.Router();
const axios = require('axios');


router.post('/import', async (req, res) => {
  try {
    console.log("Début de l'importation...");

    // Liste des fichiers à importer
    const files = [
      { filePath: path.join(__dirname, 'champions-league-24-25-teams.json'), format: 'default' },
      { filePath: path.join(__dirname, 'csvjson.json'), format: 'custom' }
    ];

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const file of files) {
      console.log("Chemin du fichier JSON :", file.filePath);

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

        let insertedCount = 0;
        let skippedCount = 0;

        for (const team of adaptedData) {
          const existingTeam = await Team.findOne({ name: team.name });

          if (!existingTeam) {
            await Team.create(team);
            insertedCount++;
          } else {
            skippedCount++;
          }
        }

        console.log(`Données insérées depuis ${file.filePath}: ${insertedCount} nouvelles équipes.`);
        console.log(`Équipes déjà existantes ignorées: ${skippedCount}`);

        totalInserted += insertedCount;
        totalSkipped += skippedCount;
      } else {
        console.error(`Le fichier ${file.filePath} n'existe pas.`);
      }
    }

    res.status(200).json({
      message: "Importation terminée.",
      inserted: totalInserted,
      skipped: totalSkipped,
    });

  } catch (err) {
    console.error("Erreur durant l'importation :", err);
    res.status(500).json({ error: "Erreur lors de l'importation des équipes." });
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

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('ID invalide.');
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).send('Équipe introuvable.');
    }
    res.status(200).json(team);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'équipe :', err);
    res.status(500).send('Erreur lors de la récupération de l\'équipe.');
  }
});

router.get('/name/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;

    // Recherche dans la base de données par le nom
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable.' });
    }

    res.status(200).json(team);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'équipe :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'équipe.' });
  }
});

module.exports = router;
