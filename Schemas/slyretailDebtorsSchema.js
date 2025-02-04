const { Transaction } = require('mongodb');
const mongoose = require('mongoose');

// Define the customer schema
const CustomersSchema = new mongoose.Schema({
    Customer: {
        type: String,
        required: true
    },
    CustomerAccount: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    Cell: {
        type: Number,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    DebtorsStatus: {
        type: String,
        required: true
    },
    Transactions: [
        {
            date: {
                type: String,
                required: true
            },
            Invoice: {
                type: String,
                required: true
            },
            Receipt: {
                type: String,
                required: false
            }
        }

    ]

    // Add more fields as needed
});
// ==============================================================================================

module.exports = {
    CustomersSchema

};
console.log('CustomersSchema:', CustomersSchema);
