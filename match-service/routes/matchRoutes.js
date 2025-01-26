const express = require('express');
const axios = require('axios');
const Match = require('../models/Match');
const router = express.Router();

// URL du team-service depuis .env
const teamServiceUrl = process.env.TEAM_SERVICE_URL;

router.post('/', async (req, res) => {
    try {
      const { homeTeam, awayTeam, date } = req.body;
  
      // Vérifiez si les équipes existent
      const homeTeamResponse = await axios.get(`http://team-service:4006/teams/${homeTeam}`);
      const awayTeamResponse = await axios.get(`http://team-service:4006/teams/${awayTeam}`);
  
      if (!homeTeamResponse.data || !awayTeamResponse.data) {
        return res.status(404).json({ message: "L'une des équipes n'existe pas." });
      }
  
      // Créez le match
      const match = new Match({
        homeTeam,
        awayTeam,
        date,
      });
  
      await match.save();
      res.status(201).json({ message: 'Match ajouté avec succès.', match });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du match :', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout du match.' });
    }
  });
  
// Route pour récupérer tous les matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (err) {
    console.error('Erreur lors de la récupération des matches :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des matches.' });
  }
});

module.exports = router;
