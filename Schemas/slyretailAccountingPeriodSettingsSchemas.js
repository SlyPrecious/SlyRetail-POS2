import mongoose from 'mongoose';
// Suppress the deprecation warning
mongoose.set('strictQuery', true);

// Define the CredentialsSchema
const AccountingPeriodSettingsSchema = new mongoose.Schema({
    startDate: {
        type: String,
        required: true
    },
   
    // Add more fields as needed
});

// Function to get or create a model based on a specific database connection
const accountingPeriodModel = (db) => {
    // Create the model with the specific connection
    return db.model('Accountingperiod', AccountingPeriodSettingsSchema);
};
export { accountingPeriodModel };


