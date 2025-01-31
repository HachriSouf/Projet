const axios = require("axios");

const authService = axios.create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" }
});

const  adminMiddleware = async (req, res, next) => {
  try {

    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const authResponse = await authService.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });


    const role = authResponse.data.user.role;
    console.log("les données :",authResponse.data.user);
    console.log("status :", role);


    if (authResponse.status !== 200) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    if (role !== 2) {
      return res.status(403).json({ message: "Vous devez être admin pour pouvoir utiliser cette fonctionnalité" });
    }

   
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }

};

const authMiddleware = async (req, res, next) => {
  try {

    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }   
      
    const authResponse = await authService.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });



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

module.exports = { adminMiddleware };




