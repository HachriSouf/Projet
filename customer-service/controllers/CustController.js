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
