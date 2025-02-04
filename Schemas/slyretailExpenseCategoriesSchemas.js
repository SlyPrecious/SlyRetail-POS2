import mongoose from 'mongoose';

// Define the CredentialsSchema
const ExpenseCategoriesSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    CategoryLimit: {
        type: Number
    },
    CategoryRevCapex: {
        type: String,
    },
    CategoryLimitRange: {
        type: String,
    },
    Balance: {
        type: String,
    },
    // Add more fields as needed
});

// Create a model based on the schema
const ExpenseCategoriesModel = mongoose.model('ExpenseCategories', ExpenseCategoriesSchema);

export { ExpenseCategoriesModel };
