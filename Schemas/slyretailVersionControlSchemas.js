import mongoose from 'mongoose';
// Suppress the deprecation warning
mongoose.set('strictQuery', true);

// Define the CredentialsSchema
const VersionControlSchema = new mongoose.Schema({
    version: {
        type: String,
        // required: true
    },
   
    // Add more fields as needed
});

// Create a model based on the schema
const versionControlModel = mongoose.model('VersionControl', VersionControlSchema);
export { versionControlModel };

