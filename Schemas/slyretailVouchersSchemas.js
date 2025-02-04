const { Transaction, Double } = require('mongodb');
const mongoose = require('mongoose');

// Define the CredentialsSchema
const VouchersSchema = new mongoose.Schema({
    // Add more fields as needed
});

module.exports = {
    VouchersSchema
};
console.log('VouchersSchema:', VouchersSchema);


