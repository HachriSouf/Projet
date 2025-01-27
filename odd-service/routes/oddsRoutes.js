const express = require('express');
const Odd = require('../models/Odd');
const router = express.Router();
const axios = require('axios');


router.post('/', async (req, res) => {
  try {
    const { homeTeam, awayTeam, matchId } = req.body;

    if (!homeTeam || !awayTeam || !matchId) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Appel à team-service pour récupérer les coefficients des équipes
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
    const probDraw = 0.1; // Fixé à 10%

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
});;
// Récupérer les cotes d'un match
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

  // Mettre à jour les cotes d'un match
// router.put('/:matchId', async (req, res) => {
//     try {
//       const { matchId } = req.params;
//       const { odds } = req.body;
  
//       const updatedOdd = await Odd.findOneAndUpdate(
//         { matchId },
//         { odds },
//         { new: true }
//       );
  
//       if (!updatedOdd) {
//         return res.status(404).json({ error: 'Cotes non trouvées pour ce match.' });
//       }
  
//       res.status(200).json(updatedOdd);
//     } catch (err) {
//       console.error('Erreur lors de la mise à jour des cotes :', err);
//       res.status(500).json({ error: 'Erreur interne du serveur.' });
//     }
//   });

router.put('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { homeOdd, drawOdd, awayOdd } = req.body;

    // Vérifie si les nouveaux odds sont fournis
    if (!homeOdd || !drawOdd || !awayOdd) {
      return res.status(400).json({ error: 'Les nouveaux odds sont requis.' });
    }

    // Mets à jour les odds directement dans la base de données
    const updatedOdd = await Odd.findOneAndUpdate(
      { matchId },
      { homeOdd, drawOdd, awayOdd },
      { new: true } // Retourne le document mis à jour
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