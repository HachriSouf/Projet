const express = require('express');
const axios = require('axios');
const Match = require('../models/Match');
const router = express.Router();

// URL du team-service depuis .env
const teamServiceUrl = process.env.TEAM_SERVICE_URL;

router.post('/', async (req, res) => {
  try {
    const { homeTeam, awayTeam } = req.body;

    // Vérification des champs requis
    if (!homeTeam || !awayTeam) {
      return res.status(400).json({ error: 'Les champs homeTeam et awayTeam sont requis.' });
    }

    // Obtenir la date actuelle
    const date = new Date();

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
    const probDraw = Math.min(homeCoefficient, awayCoefficient) / (totalCoefficient * 2);

    // Calcul des cotes
    const homeOdd = (1 / probHome).toFixed(2);
    const awayOdd = (1 / probAway).toFixed(2);
    const drawOdd = (1 / probDraw).toFixed(2);

    // Création et sauvegarde du match
    const match = new Match({
      homeTeam,
      awayTeam,
      date, // Utilisation de la date actuelle
      status: 'scheduled',
      score: {
        home: 0,
        away: 0,
      },
    });

    await match.save();

    res.status(201).json({
      message: 'Match créé avec succès avec la date d\'aujourd\'hui.',
      match,
      odds: {
        homeOdd,
        awayOdd,
        drawOdd,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création du match :', error);
    res.status(500).json({ error: 'Erreur lors de la création du match.' });
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

router.post('/start/:id', async (req, res) => {
  try {
    const matchId = req.params.id;

    // Rechercher le match par ID
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).send({ error: 'Match introuvable.' });
    }

    // Vérifier si le match est déjà démarré ou terminé
    if (match.status !== 'scheduled') {
      return res.status(400).send({ error: 'Le match a déjà démarré ou est terminé.' });
    }

    // Mettre à jour le statut à "in_progress"
    match.status = 'in_progress';
    await match.save();

    res.status(200).send({
      message: 'Match démarré avec succès. Les scores seront mis à jour après 10 secondes.',
      match: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        status: match.status,
      },
    });

    // Simuler les scores et attendre 10 secondes avant de terminer le match
    setTimeout(async () => {
      const homeScore = Math.floor(Math.random() * 6); // Score entre 0 et 5
      const awayScore = Math.floor(Math.random() * 6);

      // Mettre à jour le match avec les scores finaux
      match.score.home = homeScore;
      match.score.away = awayScore;
      match.status = 'completed';
      await match.save();

      console.log(`Match terminé ! Résultat : ${match.homeTeam} ${homeScore} - ${awayScore} ${match.awayTeam}`);
    }, 10000); // Attendre 10 secondes (10 000 ms)

  } catch (err) {
    console.error('Erreur lors du démarrage du match :', err);
    res.status(500).send({ error: 'Erreur lors du démarrage du match.' });
  }
});





// Route pour récupérer un match par ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match introuvable.' });
    }
    res.status(200).json(match);
  } catch (err) {
    console.error('Erreur lors de la récupération du match :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du match.' });
  }
});

router.get('/odds/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    // Appel HTTP vers l'API du odd-service
    const response = await axios.get(`http://odd-service:4008/odds/${matchId}`);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des cotes :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des cotes.' });
  }
});





module.exports = router;
