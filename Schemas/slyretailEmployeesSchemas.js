const { Transaction, Double } = require('mongodb');
const mongoose = require('mongoose');

// Define the CredentialsSchema
const EmployeesSchema = new mongoose.Schema({
    // Add more fields as needed
});

module.exports = {
    EmployeesSchema
};
console.log('EmployeesSchema:', EmployeesSchema);


