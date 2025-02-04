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

// Create a model based on the schema
const accountingPeriodModel = mongoose.model('Accountingperiod', AccountingPeriodSettingsSchema);
export { accountingPeriodModel };

