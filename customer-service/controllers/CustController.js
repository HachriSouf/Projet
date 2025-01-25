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

exports.findAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find(); // Récupère tous les clients
    res.status(200).json({ customers }); // Retourne les clients trouvés
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

exports.findCustomerByUsername = async (req, res) => {
  try {
    const { username } = req.params; // Récupère le username depuis les paramètres de la requête

    const customer = await Customer.findOne({ username }); // Recherche le client par username
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' }); // Si le client n'est pas trouvé
    }

    res.status(200).json({ customer }); // Retourne les détails du client
  } catch (error) {
    console.error('Error fetching customer by username:', error);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};

exports.updateCustomerByUsername = async (req, res) => {
  try {
    const { username } = req.params; // Récupère le username depuis les paramètres de la requête
    const updateData = req.body; // Données à mettre à jour

    const updatedCustomer = await Customer.findOneAndUpdate(
      { username }, // Filtre basé sur le username
      updateData, // Données mises à jour
      { new: true, runValidators: true } // Retourne le document mis à jour
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' }); // Si le client n'est pas trouvé
    }

    res.status(200).json({ customer: updatedCustomer }); // Retourne le client mis à jour
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};
exports.softDeleteCustomer = async (req, res) => {
  try {
    const { username } = req.params; 

    const customer = await Customer.findOne({ username }); 
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' }); 
    }

    customer.deletedAt = new Date(); 
    await customer.save();

    res.status(200).json({ message: 'Customer soft deleted successfully' }); 
  } catch (error) {
    console.error('Error during soft delete:', error);
    res.status(500).json({ message: 'Failed to soft delete customer' });
  }
};


exports.deleteCustomer = async (req, res) => {
  try {
      const { username } = req.body; 

      
      const customer = await Customer.findOne({ username });
      if (!customer) {
          return res.status(404).json({ message: "Customer not found" }); 
      }

      await Customer.deleteOne({ username });

      return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
      // Capture et logge l'erreur
      console.error('Error during customer deletion:', err);

      // En cas d'erreur serveur
      res.status(500).json({ message: "Server error" });
  }
};
