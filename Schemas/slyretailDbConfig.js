import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
//THIS DATABSE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let isConnected = false; // Track the connection status
let Databases = [];
// Object to store connections for each user/database
let connections = {};
   let myDatabase = ''
let signCriteria = ''
const connectDB = async (databaseName, signingCriteria) => {
    const normalizedDatabaseName = databaseName.toLowerCase();
 myDatabase=databaseName
 signCriteria=signingCriteria
    // MongoDB Atlas connection URI
    const uri = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";

    try {
        if (signingCriteria === "Sign Up") {
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
        const lowerCaseDatabases = Databases.map(db => db.toLowerCase());
        if (!lowerCaseDatabases.includes(normalizedDatabaseName)) {
                 // Create a new Mongoose connection for the database
            const newConnection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }).asPromise();

            isConnected = true;
            connections[normalizedDatabaseName] = newConnection;
            console.log(`Database '${databaseName}' created successfully.`);
        }
        }

        if (signingCriteria === "Sign In") {
            // Reuse existing connection if it exists
            if (connections[normalizedDatabaseName]) {
                console.log(`Reusing existing connection for ${databaseName}`);
                return connections[normalizedDatabaseName];
            }

            // Create a new Mongoose connection for the database
            const newConnection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }).asPromise();

            isConnected = true;
            connections[normalizedDatabaseName] = newConnection;
            console.log(`Connected to database '${databaseName}' successfully.`);
      
        }
       const myConnection =connections[normalizedDatabaseName]
        return myConnection;
    } catch (error) {
        isConnected = false;
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
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
export { connectDB,myDatabase,signCriteria, logout };
