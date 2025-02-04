import mongoose from 'mongoose';
// Suppress the deprecation warning
mongoose.set('strictQuery', true);

// Define the CredentialsSchema
const payOutHeadersSettingsSchema = new mongoose.Schema({
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
const payOutHeadersModel = mongoose.model('payoutheaders', payOutHeadersSettingsSchema);
export { payOutHeadersModel };

