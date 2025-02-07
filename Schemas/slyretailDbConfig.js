import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
//THIS DATABSE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let isConnected = false; // Track the connection status
let Databases = [];
// Object to store connections for each user/database
let connections = {};
const connectDB = async (databaseName, signingCriteria) => {
    const normalizedDatabaseName = databaseName.toLowerCase();
    // Check if we already have a connection for this database
    if (connections[normalizedDatabaseName]) {
        console.log(`Reusing existing connection for database: ${normalizedDatabaseName}`);
        return connections[normalizedDatabaseName]; // Return existing connection
    }
    if (signingCriteria === "Sign Up") {//ALL CONNECTIONS WHEN SIGNING UP
        // MongoDB Atlas connection URI (string)
        const host = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority"
        // Create a new MongoClient instance and pass in the connection URI and options
        const client = new MongoClient(host, {
            useNewUrlParser: true,  // Use the modern URL parser
            useUnifiedTopology: true  // Use the new unified topology engine
        });
        //CHECK IF THE DATABASE THAT THE USER IS CREATING IS ALREADY THERE.
        const adminDb = client.db().admin();
        const databasesList = await adminDb.listDatabases();
        Databases.push(...databasesList.databases.map(db => db.name));

        const lowerCaseDatabaseName = databaseName.toLowerCase();
        const lowerCaseDatabases = Databases.map(db => db.toLowerCase());

        if (lowerCaseDatabases.includes(lowerCaseDatabaseName)) {
        }
        //IF IT IS NOT THERE, CREATE IT AND RETURN THAT CONNECTION
        else {
            try {
                await client.db(databaseName);
                console.log(`Database '${databaseName}' created successfully.`);
                await mongoose.connect("mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/" + databaseName + "?retryWrites=true&w=majority", {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000
                });
                isConnected = true; // Set connection status to true
                connections[normalizedDatabaseName] = mongoose.connection; // Store the new connection
            } catch (error) {
                isConnected = false; // Set connection status to true
                console.error('Error connecting to MongoDB:', error);
                throw new Error('Failed to connect to MongoDB');
            }
        }

    }
    if (signingCriteria === "Sign In") {// ALL CONNECTIONS WHEN SIGNING IN
        try {
            //THIS IS THE FREE CLUSTER ON MONGO DB CURRENTLY USED FOR DEVELOPMENT
            // await mongoose.connect('mongodb://localhost/' + databaseName, {

            // If connection already exists, just return the existing connection
            if (connections[normalizedDatabaseName]) {
                console.log(`Reusing existing connection for ${normalizedDatabaseName}`);
                isConnected = true; // Set connection status to true
                return connections[normalizedDatabaseName]; // Return existing connection
            }
            else {
                // If no existing connection, create a new connection
                await mongoose.connect(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
                    {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        serverSelectionTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                    }
                );
                isConnected = true; // Set connection status to true
                connections[normalizedDatabaseName] = mongoose.connection; // Store the new connection
            }

            // console.log('MongoDB connected successfully');
            // return mongoose.connection; // Return the active connection
        } catch (error) {
            isConnected = false; // Set connection status to true
            console.error('Error connecting to MongoDB:', error);
            throw new Error('Failed to connect to MongoDB');
        }

    }
    if (isConnected === true) {
        //ALSO AN INDICATION THAT THE DATABASE IS THERE
        return mongoose.connection; // Return existing connection
    } else {
        return isConnected; // Return an information saying something about the connection
    }
};


//=============================================================================================
// // Call this function when logging out to reset the connection status.
// Let's assume you have multiple connections stored in an object or Map
let loggedOut = false;

const logout = async (databaseName) => {
    // Retrieve the connection associated with the user's database
    try {
        const normalizedDatabaseName = databaseName.toLowerCase();
        const connection = connections[normalizedDatabaseName];
        if (connection && connection.readyState === 1) { // Check if the specific connection is open
            try {
                // Close the specific MongoDB connection
                await connection.close();
                console.log(`${databaseName} logged out, MongoDB connection closed`);
                delete connections[normalizedDatabaseName]; // Remove from the connections map if not needed
                loggedOut = true; // Set loggedOut to true after successfully closing the connection
            } catch (err) {
                loggedOut = false;
                console.error(`Error closing MongoDB connection for ${databaseName}:`, err);
            }
        } else {
            // No active connection found
            console.log(`No active MongoDB connection to close for ${databaseName}`);
            loggedOut = false; // Set loggedOut to false if there is no connection to close
        }
        return { loggedOut }; // Always return loggedOut
    } catch (error) {
        console.error(`Error closing MongoDB connection for ${databaseName}:`, error);
    }
};
export { connectDB, logout };
