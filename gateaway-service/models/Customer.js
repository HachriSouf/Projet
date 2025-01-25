const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Number: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  registrationToken: {type: String, default:null}
});

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;





// const mongoose = require('mongoose');


// const customerSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   FirstName: { type: String, required: true },
//   LastName: { type: String, required: true },
//   Number: { type: Number, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });


// const Customer = mongoose.model('Customer', customerSchema);
// module.exports = Customer;
