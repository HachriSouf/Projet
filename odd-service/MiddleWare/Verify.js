const axios = require("axios");


const authService = axios.create({
    baseURL: "http://trd_project-auth-service-1:3000",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });
  
module.exports = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
  
      // Vérification du token via auth-service
      const authResponse = await authService.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const user = authResponse.data.user;
  
      // Vérifiez si l'utilisateur est un bookmaker
      if (user.role !== 1) {
        return res.status(403).json({ error: 'Access denied. Bookmakers only.' });
      }
  
      // Ajouter les infos utilisateur à req pour les utiliser dans les méthodes
      req.user = user;
      next();
    } catch (err) {
      console.error('Error verifying user role:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };