const axios = require("axios");
const jwt = require("jsonwebtoken");

const AUTH_SERVICE_URL = "http://auth-service:3000"; 

const authMiddleware = async (req, res, next) => {
  try {

    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

   
    const authService = axios.create({
        baseURL: "http://trd_project-auth-service-1:3000",
        timeout: 5000,
        headers: {  Authorization: `Bearer ${token}` },
      });
      
    const authResponse = await authService.post("/auth/verify", {});


    if (authResponse.status !== 200) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Si tout va bien, passer au middleware ou à la route suivante
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authMiddleware;




