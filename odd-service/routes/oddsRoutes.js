const express = require('express');
const Odd = require('../models/Odd');
const router = express.Router();
const axios = require('axios');

// const matchService = axios.create({
//   baseURL: "http://trd_project-match-service-1:4007",
//   timeout: 5000,
//   headers: { "Content-Type": "application/json" },
// });
// router.post('/', async (req, res) => {
//   try {
//     const { matchId } = req.body;

//     if (!matchId) {
//       return res.status(400).json({ error: 'matchId est requis.' });
//     }

//     const matchResponse = await matchService.get(`/matches/${matchId}`);
//     const match = matchResponse.data.match;

//     const homeTeam = match.homeTeam;
//     const awayTeam = match.awayTeam;

//     const homeResponse = await axios.get(`http://team-service:4006/teams/name/${homeTeam}`);
//     const awayResponse = await axios.get(`http://team-service:4006/teams/name/${awayTeam}`);

//     const homeTeamData = homeResponse.data;
//     const awayTeamData = awayResponse.data;
    
//     if (!homeTeamData || !awayTeamData) {
//       return res.status(404).json({ error: 'Une ou les deux équipes sont introuvables.' });
//     }

//     const homeCoefficient = homeTeamData.coefficient;
//     const awayCoefficient = awayTeamData.coefficient;

// const totalCoefficient = homeCoefficient + awayCoefficient;
// const probHome = homeCoefficient / totalCoefficient;
// const probAway = awayCoefficient / totalCoefficient;

// let probDraw = 1 - (probHome + probAway);

// if (probDraw <= 0) {
//   probDraw = 0.01; 
// }

// const homeOdd = (1 / probHome).toFixed(2);
// const awayOdd = (1 / probAway).toFixed(2);
// const drawOdd = (1 / probDraw).toFixed(2);

// console.log('Probabilités:', { probHome, probAway, probDraw });
// console.log('Cotes calculées:', { homeOdd, drawOdd, awayOdd });

//     const odd = new Odd({
//       homeTeam,
//       awayTeam,
//       homeOdd,
//       drawOdd,
//       awayOdd,
//       matchId,
//     });

//     await odd.save();
//     res.status(201).json({ message: 'Cotes calculées et ajoutées avec succès.', odd });
//   } catch (error) {
//     console.error('Erreur lors de l\'ajout des cotes :', error);
//     res.status(500).json({ error: 'Erreur lors de l\'ajout des cotes.' });
//   }
// });;


router.get('/:matchId', async (req, res) => {
    try {
      const { matchId } = req.params;
  
      const odd = await Odd.findOne({ matchId });
      if (!odd) {
        return res.status(404).json({ error: 'Cotes non trouvées pour ce match.' });
      }
  
      res.status(200).json(odd);
    } catch (err) {
      console.error('Erreur lors de la récupération des cotes :', err);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  });


  router.put('/:matchId', async (req, res) => {
    try {
      const { matchId } = req.params;
      const { odds } = req.body;
  
      const updatedOdd = await Odd.findOneAndUpdate(
        { matchId },
        { odds },
        { new: true }
      );
  
      if (!updatedOdd) {
        return res.status(404).json({ error: 'Cotes non trouvées pour ce match.' });
      }
  
      res.status(200).json(updatedOdd);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des cotes :', err);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  });


  module.exports = router;