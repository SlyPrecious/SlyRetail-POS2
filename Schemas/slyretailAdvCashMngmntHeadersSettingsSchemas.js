import mongoose from 'mongoose';
// Suppress the deprecation warning
mongoose.set('strictQuery', true);

// Define the CredentialsSchema
const AdvCashMngmntHeadersSettingsSchema = new mongoose.Schema({
    HeaderName: {
        type: String,
        required: true
    },
    isDisplayed: {
        type: Boolean,
        required: true
    },
    // Add more fields as needed
});

const advaHeadersModel = (db) => {
    // Create the model with the specific connection
    return db.model('headers', AdvCashMngmntHeadersSettingsSchema);
};
export { advaHeadersModel };

