import mongoose from 'mongoose';

let isConnected = false; // Track the connection status

const connectDB = async (databaseName) => {
    if (isConnected) {
        console.log('Reusing existing MongoDB connection');
        return mongoose.connection; // Return existing connection
    }

    try {
        await mongoose.connect('mongodb://localhost/' + databaseName, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        isConnected = true; // Set connection status to true
        console.log('MongoDB connected successfully');
        return mongoose.connection; // Return the active connection
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
};
// Call this function when logging out to reset the connection status.
const logout = () => {
    isConnected = false; // Reset the connection flag to allow a fresh connection next time
    mongoose.connection.close(); // Close the MongoDB connection
    console.log('Logged out, connection closed');
};

// export default connectDB;
export  {connectDB,logout} ;
