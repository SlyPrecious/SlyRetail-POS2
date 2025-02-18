

import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// THIS DATABASE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let isConnected = false; // Track the connection status
let Databases = [];
// Object to store connections for each user/database
let connections = {};
let myDatabase = ''
let signCriteria = ''
const connectDB = async (req, databaseName, signingCriteria, sessionId) => {
    const normalizedDatabaseName = databaseName.toLowerCase();
    let connection;
    console.log(databaseName + 'databasename' + signingCriteria)
    // MongoDB Atlas connection URI
    const uri = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";

    try {
        myDatabase = databaseName
        signCriteria = signingCriteria

        if (signingCriteria === "Sign Up") {
            if (connections[normalizedDatabaseName]) {
                connection = connections[normalizedDatabaseName];
                return connection
            }
            const host = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";
            // Create a new MongoClient instance and pass in the connection URI and options
            const client = new MongoClient(host, {
                useNewUrlParser: true,  // Use the modern URL parser
                useUnifiedTopology: true  // Use the new unified topology engine
            });
            // CHECK IF THE DATABASE THAT THE USER IS CREATING IS ALREADY THERE.
            const adminDb = client.db().admin();
            const databasesList = await adminDb.listDatabases();
            Databases.push(...databasesList.databases.map(db => db.name));
            const lowerCaseDatabases = Databases.map(db => db.toLowerCase());
            if (!lowerCaseDatabases.includes(normalizedDatabaseName)) {
                // Create a new Mongoose connection for the database
                connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }).asPromise();

                isConnected = true;
                connections[normalizedDatabaseName] = connection;
                console.log(`Database '${databaseName}' created successfully.`);
                // Store the values in session
                req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
                console.log(req.session);
            }
        }

        if (signingCriteria === "Sign In") {
            // Reuse existing connection if it exists
            if (connections[normalizedDatabaseName]) {
                connection = connections[normalizedDatabaseName];
            } else {
                connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }).asPromise();

                isConnected = true;
                connections[normalizedDatabaseName] = connection;
                console.log(`Connected to database '${databaseName}' successfully.`);
            }
            // Store the values in session
            req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
        }

        //IF WE HAD SIGNED IN OR UP SUCCESSFULLY, ALL THE DATABASE QUIRIES WILL BE USING THE SESSION ID FOR CONNECTIONE
        if (req.sessionID === sessionId) {
            console.log("iam the new1111 " + req.session.myDatabase)
            connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${req.session.myDatabase}?retryWrites=true&w=majority`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }).asPromise();

            isConnected = true;
            // connections[normalizedDatabaseName] = connection;
            console.log(`Connected to database '${req.session.myDatabase}' successfully.`);
        }

        // Return the connection object
        // return { connection: connection, myDatabase: databaseName, signCriteria: signingCriteria };
        return connection

    } catch (error) {
        isConnected = false;
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

//===========================================================================================
let loggedOut = false;

const logout = async (req, sessionId) => {
    // Check if the session ID matches
    if (req.sessionID === sessionId) {
        try {
            // Destroy the session if session IDs match
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        reject(err);
                    } else {
                        console.log('Session destroyed successfully.');
                        resolve();
                    }
                });
            });

            // Log out successful
            loggedOut = true;
            return { loggedOut: true };
        } catch (err) {
            console.error('Error during logout process:', err);
            loggedOut = false;
            return { loggedOut: false };
        }
    } else {
        // If session IDs do not match, handle accordingly
        console.log('Session ID does not match.');
        loggedOut = false;
        return { loggedOut: false };
    }
};


export { connectDB, logout };
