import mongoose from 'mongoose';

// Define a function that returns the CredentialsSchema with specific values
const CredentialsSchema = new mongoose.Schema({
    User_Account: {
        type: String,
        required: true
    },
    DbPassword: {
        type: String,
        required: true
    },
    Email: {
        type: String,
    }
    // Add more fields as needed
});

// Create a model based on the schema
const CredentialsModel = mongoose.model('User', CredentialsSchema);

export { CredentialsModel };

