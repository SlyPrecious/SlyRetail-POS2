const { Transaction } = require('mongodb');
const mongoose = require('mongoose');


// Define the invoice schema
const InvoicesSchema = new mongoose.Schema({
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
    Checked: {
        type: String,
        required: true
    },
    Product: [
        {
            ItemName: {
                type: String,
                required: true
            },
            Quantity: {
                type: Number,
                required: true
            },
            CostPrice: {
                type: Number,
                required: true
            },
            SellingPrice: {
                type: Number,
                required: true
            },
            VAT: {
                type: String,
                required: true
            }
        }
    ]
    // Add more fields as needed
});
// ========================================================================================

module.exports = {

    InvoicesSchema

};
console.log('InvoicesSchema:', InvoicesSchema);


