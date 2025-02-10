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
// Function to get or create a model based on a specific database connection
const versionControlModel = (db) => {
    // Create the model with the specific connection
    return db.model('VersionControl', VersionControlSchema);
};
export { versionControlModel };

