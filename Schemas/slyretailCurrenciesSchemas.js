import mongoose from 'mongoose';
// Suppress the deprecation warning
mongoose.set('strictQuery', true);
// Define the Currencies Document Schema, Structure or Model
const CurrenciesSchema = new mongoose.Schema({
    Currency_Name: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    RATE: {
        type: String,
        required: true
    },
    BASE_CURRENCY: {
        type: String,
        required: true
    }
    // Add more fields as needed (hence we can be able to scale up our project with easy)

});
// Create a model based on the schema

const CurrenciesModel = (db) => {
    // Create the model with the specific connection
    return db.model('Currencies', CurrenciesSchema);
};
export { CurrenciesModel };


