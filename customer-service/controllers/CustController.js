const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { username, FirstName, LastName, Number } = req.body;

    // Validation basique
    if (!username || !FirstName || !LastName || !Number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Création du client
    const newCustomer = new Customer({
      username,
      FirstName,
      LastName,
      Number,
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({ customer: savedCustomer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
      const { username } = req.body; // Récupère le username dans le corps de la requête

      // Vérifie si le client existe
      const customer = await Customer.findOne({ username });
      if (!customer) {
          return res.status(404).json({ message: "Customer not found" }); // Si le client n'est pas trouvé
      }

      // Supprimer le client de la base de données
      await Customer.deleteOne({ username });

      // Retourne une réponse de succès
      return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
      // Capture et logge l'erreur
      console.error('Error during customer deletion:', err);

      // En cas d'erreur serveur
      res.status(500).json({ message: "Server error" });
  }
};
