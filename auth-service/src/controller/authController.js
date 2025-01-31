const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");


exports.register = async (req, res) => {
    const { username, password, email, role } = req.body; // Ajout de `role` dans la récupération des données
  
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Générer un token opaque pour l'enregistrement
      const generateOpaqueToken = (length = 32) =>
        crypto.randomBytes(length).toString('hex');
  
      // Définir `registrationToken` en fonction de la présence de `role`
      const registrationToken = role ? null : generateOpaqueToken();
  
      // Créer une nouvelle instance utilisateur
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        registrationToken,
        role, // Ajouter le rôle si présent
      });
  
      // Générer un refresh token
      const refreshToken = jwt.sign(
        { userId: newUser._id, role: role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      newUser.refreshToken = refreshToken;
  
      // Sauvegarder l'utilisateur
      await newUser.save();
  
      // Répondre avec succès
      res.status(201).json({
        message: 'User created successfully',
        refreshToken,
        registrationToken,
        userId: newUser._id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
       
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate access token (short-lived)
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate refresh token (longer-lived)
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        user.lastSignedAt = new Date();
        await user.save();

        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.verify = async (req, res) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user based on the decoded userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User authenticated', user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid token' });
    }
};

exports.getAllUsersGamble = async (req, res) => {
    try {
        const users = await User.find({ role: 0 }).select('-password -refreshToken'); 
        if (!users.length) {
            return res.status(404).json({ message: 'No users with role 0 found.' });
        }
        res.status(200).json({ users });
    } catch (err) {
        console.error('Error retrieving users with role 0:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = await req.body;
        console.log(refreshToken);
        const user = await User.findOne({ refreshToken });

        if (!user) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to log out' });
    }
};

exports.me = async (req, res) => {
    try {
        
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

     
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

       
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid token or server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { username } = req.body;  // Récupère l'username dans le corps de la requête

        // Vérifie si l'utilisateur existe
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });  // Si l'utilisateur n'est pas trouvé
        }

        // Supprimer l'utilisateur de la base de données
        await User.deleteOne({ username });

        // Retourne une réponse de succès
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        // Capture et logge l'erreur
        console.error('Error during user deletion:', err);
        
        // En cas d'erreur serveur
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUserEmailById = async (req, res) => {
    const { id } = req.params; // Get the id from the route parameter

    try {
        // Find the user by their ID
        const user = await User.findById(id);

        // If the user does not exist
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the user's email
        res.status(200).json({ email: user.email });
    } catch (err) {
        console.error('Error retrieving user email:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.doubleOptIn = async (req, res) => {
    const { t: registrationToken } = req.query;

    console.log("Query parameters:", req.query);

    console.log("Extracted registrationToken:", registrationToken);

    if (!registrationToken) {
        return res.status(400).json({ message: 'Registration token is required' });
    }

    try {
        const existingUser = await User.findOne({ registrationToken });

        if (!existingUser) {
            return res.status(404).json({ message: 'Invalid or expired token' });
        }

        existingUser.registratedAt = new Date(); 
        existingUser.registrationToken = null; 
        await existingUser.save(); 

        const { password, ...userWithoutPassword } = existingUser.toObject(); 

        res.status(200).json({ 
            message: 'Account successfully confirmed', 
            user: userWithoutPassword, 
        }); 
    } catch (error) { 
        console.error('Error during double opt-in:', error); 
        res.status(500).json({ message: 'Server error' }); 
    } 
}; 