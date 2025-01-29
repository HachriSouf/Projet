const Bookmaker = require('../model/bookmaker'); // Import du modèle Bookmaker
const mongoose = require('mongoose');


    exports.createBookmaker = async (req, res) => {
    try {
        const { user_id, username, FirstName, LastName, Number } = req.body; 
        console.log('Les données reçues : ', req.body);

        if (!user_id || !username || !FirstName || !LastName || !Number) {
        return res.status(400).json({ message: 'All fields are required' });
        }

        const existingBookmaker = await Bookmaker.findOne({ $or: [{ username }, { user_id }] });
        if (existingBookmaker) {
        return res.status(409).json({ message: 'Bookmaker already exists with the same username or user_id' });
        }

        const newBookmaker = new Bookmaker({
        user_id,
        username,
        FirstName,
        LastName,
        Number,
        });

        const savedBookmaker = await newBookmaker.save();

        res.status(201).json({ bookmaker: savedBookmaker });
    } catch (error) {
        console.error('Error creating bookmaker:', error);
        res.status(500).json({ message: 'Failed to create bookmaker' });
    }
    };
    
    exports.updateBookmaker = async (req, res) => {
        try {
          const { id } = req.params; // Récupération de l'ID du bookmaker à modifier
          const { username, FirstName, LastName, Number, active } = req.body; // Données à mettre à jour
      
          // Vérification si le bookmaker existe
          const bookmaker = await Bookmaker.findById(id);
          if (!bookmaker) {
            return res.status(404).json({ message: 'Bookmaker not found' });
          }
      
          // Mise à jour des champs fournis
          if (username) bookmaker.username = username;
          if (FirstName) bookmaker.FirstName = FirstName;
          if (LastName) bookmaker.LastName = LastName;
          if (Number) bookmaker.Number = Number;
          if (active !== undefined) bookmaker.active = active;
      
          // Mise à jour de la date
          bookmaker.updatedAt = Date.now();
      
          // Sauvegarde des modifications
          const updatedBookmaker = await bookmaker.save();
      
          // Réponse avec le bookmaker mis à jour
          res.status(200).json({ message: 'Bookmaker updated successfully', bookmaker: updatedBookmaker });
        } catch (error) {
          console.error('Error updating bookmaker:', error);
          res.status(500).json({ message: 'Failed to update bookmaker' });
        }
      };


exports.getAllBookmakers = async (req, res) => {
  try {
    const bookmakers = await Bookmaker.find();
    res.status(200).json({ bookmakers });
  } catch (error) {
    console.error('Error fetching bookmakers:', error);
    res.status(500).json({ message: 'Failed to fetch bookmakers' });
  }
};

exports.getBookmakerById = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("user_id :",user_id);

    const bookmaker = await Bookmaker.findOne({ user_id }); 

    console.log(" bookmaker : ",bookmaker);

    if (!bookmaker) {
      return res.status(404).json({ message: 'Bookmaker not found' });
    }
    res.status(200).json({ bookmaker });
  } catch (error) {
    console.error('Error fetching bookmaker:', error);
    res.status(500).json({ message: 'Failed to fetch bookmaker' });
  }
};


exports.deleteBookmaker = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBookmaker = await Bookmaker.findByIdAndDelete(id);
    if (!deletedBookmaker) {
      return res.status(404).json({ message: 'Bookmaker not found' });
    }
    res.status(200).json({ message: 'Bookmaker deleted successfully' });
  } catch (error) {
    console.error('Error deleting bookmaker:', error);
    res.status(500).json({ message: 'Failed to delete bookmaker' });
  }
};
