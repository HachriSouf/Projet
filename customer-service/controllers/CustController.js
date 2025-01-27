const Customer = require('../models/Customer'); // Importation du modèle Customer

// Fonction pour créer un client
exports.createCustomer = async (req, res) => {
  try {
    const { user_id, username, FirstName, LastName, Number } = req.body; // Récupération des données du corps de la requête
    console.log("les données : ", req.body);
    // Validation basique pour s'assurer que tous les champs nécessaires sont fournis
    if (!username || !FirstName || !LastName || !Number) {
      return res.status(400).json({ message: 'All fields are required' }); // Retourne une erreur si des champs manquent
    }

    // Création d'une nouvelle instance de Customer avec les données fournies
    const newCustomer = new Customer({
      user_id,
      username,
      FirstName,
      LastName,
      Number,
    });

    // Sauvegarde du nouveau client dans la base de données
    const savedCustomer = await newCustomer.save();

    // Réponse avec le client créé
    res.status(201).json({ customer: savedCustomer });
  } catch (error) {
    // Gestion des erreurs lors de la création
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

// Fonction pour récupérer tous les clients
exports.findAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find(); // Récupère tous les clients depuis la base de données
    res.status(200).json({ customers }); // Retourne tous les clients trouvés
  } catch (error) {
    // Gestion des erreurs lors de la récupération
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// Fonction pour récupérer un client par son username
exports.findCustomerByUsername = async (req, res) => {
  try {
    const { username } = req.params; // Récupération de l'username depuis les paramètres de la requête

    const customer = await Customer.findOne({ username }); // Recherche du client correspondant à l'username
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' }); // Retourne une erreur si le client n'est pas trouvé
    }

    res.status(200).json({ customer }); // Retourne les détails du client
  } catch (error) {
    // Gestion des erreurs lors de la recherche
    console.error('Error fetching customer by username:', error);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};

// Fonction pour mettre à jour les informations d'un client
exports.updateCustomerByUsername = async (req, res) => {
  try {
    const { username } = req.params; // Récupération de l'username depuis les paramètres de la requête
    const updateData = req.body; // Données à mettre à jour

    // Recherche et mise à jour du client correspondant
    const updatedCustomer = await Customer.findOneAndUpdate(
      { username }, // Critère de recherche basé sur l'username
      updateData, // Données à mettre à jour
      { new: true, runValidators: true } // Options pour retourner le document mis à jour et valider les données
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' }); // Retourne une erreur si le client n'est pas trouvé
    }

    res.status(200).json({ customer: updatedCustomer }); // Retourne le client mis à jour
  } catch (error) {
    // Gestion des erreurs lors de la mise à jour
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

// Fonction pour effectuer une suppression "douce" d'un client
exports.softDeleteCustomer = async (req, res) => {
  try {
    const { username } = req.params; // Récupération de l'username depuis les paramètres

    const customer = await Customer.findOne({ username }); // Recherche du client par username
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' }); // Retourne une erreur si le client n'est pas trouvé
    }

    // Marque le client comme supprimé en ajoutant une date de suppression
    customer.deletedAt = new Date();
    await customer.save();

    res.status(200).json({ message: 'Customer soft deleted successfully' }); // Confirmation de la suppression "douce"
  } catch (error) {
    // Gestion des erreurs lors de la suppression
    console.error('Error during soft delete:', error);
    res.status(500).json({ message: 'Failed to soft delete customer' });
  }
};

// Fonction pour supprimer définitivement un client
exports.deleteCustomer = async (req, res) => {
  try {
    const { username } = req.body; // Récupération de l'username depuis le corps de la requête

    const customer = await Customer.findOne({ username }); // Recherche du client correspondant
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" }); // Retourne une erreur si le client n'est pas trouvé
    }

    // Suppression définitive du client de la base de données
    await Customer.deleteOne({ username });

    res.status(200).json({ message: "Customer deleted successfully" }); // Confirmation de la suppression définitive
  } catch (err) {
    // Gestion des erreurs lors de la suppression
    console.error('Error during customer deletion:', err);
    res.status(500).json({ message: "Server error" });
  }
};
