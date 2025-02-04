
import mongoose from 'mongoose';

// Define the CredentialsSchema
const IncomeCategoriesSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    CategoryLimit: {
        type: Number
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
const IncomeCategoriesModel = mongoose.model('IncomeCategories', IncomeCategoriesSchema);

export { IncomeCategoriesModel };

