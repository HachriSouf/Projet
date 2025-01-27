const express = require('express');
const fs = require('fs');
const path = require('path');
const Team = require('../models/Team'); // Modèle MongoDB
const mongoose = require('mongoose'); // Ajout de l'import manquant
const router = express.Router();
const axios = require('axios');


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


router.post('/', async (req, res) => {
  try {
    const { homeTeam, awayTeam, matchId } = req.body;

    if (!homeTeam || !awayTeam || !matchId) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Appels API au service `team-service` pour récupérer les équipes
    const homeResponse = await axios.get(`http://team-service:4006/teams/name/${homeTeam}`);
    const awayResponse = await axios.get(`http://team-service:4006/teams/name/${awayTeam}`);

    const homeTeamData = homeResponse.data;
    const awayTeamData = awayResponse.data;

    if (!homeTeamData || !awayTeamData) {
      return res.status(404).json({ error: 'Une ou les deux équipes sont introuvables.' });
    }

    const homeCoefficient = homeTeamData.coefficient;
    const awayCoefficient = awayTeamData.coefficient;

    // Calcul des probabilités
    const totalCoefficient = homeCoefficient + awayCoefficient;
    const probHome = homeCoefficient / totalCoefficient;
    const probAway = awayCoefficient / totalCoefficient;
    const probDraw = 0.1; // Probabilité fixe pour un match nul (10%)

    // Calcul des cotes
    const homeOdd = (1 / probHome).toFixed(2);
    const awayOdd = (1 / probAway).toFixed(2);
    const drawOdd = (1 / probDraw).toFixed(2);

    // Création et sauvegarde des cotes
    const odd = new Odd({
      homeTeam,
      awayTeam,
      homeOdd,
      drawOdd,
      awayOdd,
      matchId,
    });

    await odd.save();
    res.status(201).json({ message: 'Cotes calculées et ajoutées avec succès.', odd });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des cotes :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout des cotes.' });
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

router.get('/name/:name', async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.name });
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable.' });
    }
    res.status(200).json(team);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'équipe :', err);
    res.status(500).send('Erreur lors de la récupération de l\'équipe.');
  }
});


module.exports = router;
