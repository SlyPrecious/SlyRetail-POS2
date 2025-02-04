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

// Create a model based on the schema
const advaHeadersModel = mongoose.model('headers', AdvCashMngmntHeadersSettingsSchema);
export { advaHeadersModel };

