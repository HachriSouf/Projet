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
exports.findCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params; // Récupération du user_id depuis les paramètres de la requête

    const customer = await Customer.findOne({ user_id }); // Recherche du client correspondant au user_id
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" }); // Retourne une erreur si le client n'est pas trouvé
    }

    res.status(200).json({ customer }); // Retourne les détails du client
  } catch (error) {
    console.error("Error fetching customer by user_id:", error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
};

// Fonction pour mettre à jour les informations d'un client par user_id
exports.updateCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params; // Récupération du user_id depuis les paramètres de la requête
    const updateData = req.body; // Données à mettre à jour

    // Recherche et mise à jour du client correspondant
    const updatedCustomer = await Customer.findOneAndUpdate(
      { user_id }, // Critère de recherche basé sur user_id
      updateData, // Données à mettre à jour
      { new: true, runValidators: true } // Options pour retourner le document mis à jour et valider les données
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ customer: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Failed to update customer" });
  }
};

// Fonction pour effectuer une suppression "douce" d'un client par user_id
exports.softDeleteCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params; // Récupération du user_id depuis les paramètres

    const customer = await Customer.findOne({ user_id }); // Recherche du client par user_id
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Marque le client comme supprimé en ajoutant une date de suppression
    customer.deletedAt = new Date();
    await customer.save();

    res.status(200).json({ message: "Customer soft deleted successfully" });
  } catch (error) {
    console.error("Error during soft delete:", error);
    res.status(500).json({ message: "Failed to soft delete customer" });
  }
};

// Fonction pour supprimer définitivement un client par user_id
exports.deleteCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.body; // Récupération du user_id depuis le corps de la requête

    const customer = await Customer.findOne({ user_id }); // Recherche du client correspondant
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Suppression définitive du client de la base de données
    await Customer.deleteOne({ user_id });

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Error during customer deletion:", err);
    res.status(500).json({ message: "Server error" });
  }
};
