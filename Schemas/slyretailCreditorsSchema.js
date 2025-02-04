const { Transaction } = require('mongodb');
const mongoose = require('mongoose');

// Define the suppliers schema
const SuppliersSchema = new mongoose.Schema({
    SupplierName: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    },
    Ref: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    Cell: {
        type: Number,
        required: true
    },
    Email: {
        type: String,
        required: true
    }
    // Add more fields as needed
});

// ===========================================================================================
module.exports = {
    SuppliersSchema
};
console.log('SuppliersSchema:', SuppliersSchema);


