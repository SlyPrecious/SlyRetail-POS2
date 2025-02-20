

import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// THIS DATABASE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let Databases = [];
// Object to store connections for each user/database
let connections = {};

const connectDB = async (req, databaseName, signingCriteria, sessionId) => {
    const normalizedDatabaseName = databaseName.toLowerCase();
    let connection;
    console.log(databaseName + 'databasename' + signingCriteria)

    try {
        const host = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";
        // Create a new MongoClient instance and pass in the connection URI and options
        const client = new MongoClient(host, {
            useNewUrlParser: true,  // Use the modern URL parser
            useUnifiedTopology: true  // Use the new unified topology engine
        });
        const adminDb = client.db().admin();
        const databasesList = await adminDb.listDatabases();
        Databases.push(...databasesList.databases.map(db => db.name));
        const lowerCaseDatabases = Databases.map(db => db.toLowerCase());
        if (signingCriteria === "Sign Up") {
            // CHECK IF THE DATABASE THAT THE USER IS CREATING IS ALREADY THERE.
            if (!lowerCaseDatabases.includes(normalizedDatabaseName)) { ///
                // Create a new Mongoose connection for the database
                connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }).asPromise();

                connections[normalizedDatabaseName] = connection;
                console.log(`Database '${databaseName}' created successfully.`);
                // Store the values in session
                req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
            }
        }

        if (signingCriteria === "Sign In") {
            // Reuse existing connection if it exists
            if (connections[normalizedDatabaseName]) {
                connection = connections[normalizedDatabaseName];
            } else {
                if (lowerCaseDatabases.includes(normalizedDatabaseName)) { ///
                    // Create a new Mongoose connection for the database
                    connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        serverSelectionTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                    }).asPromise();

                    connections[normalizedDatabaseName] = connection;
                    console.log(`Database '${databaseName}' created successfully.`);
                    // Store the values in session
                    req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
                }
            }
            // Store the values in session
            req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
        }

        //IF WE HAD SIGNED IN OR UP SUCCESSFULLY, ALL THE DATABASE QUIRIES WILL BE USING THE SESSION ID FOR CONNECTIONE
        if ((req.sessionID === sessionId) && (signingCriteria === "")) {
            if (connections[req.session.myDatabase]) {
                console.log("iam the Reusing the existing connection " + req.session.myDatabase)
                connection = connections[req.session.myDatabase];
            }

            else {
                connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${req.session.myDatabase}?retryWrites=true&w=majority`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }).asPromise();

                // isConnected = true;
                connections[normalizedDatabaseName] = connection;
                console.log(`Connected to database '${req.session.myDatabase}' successfully.`);
            }
        }

        // Graceful shutdown
        //Handle Multiple Signals:
        //Listen for both SIGINT and SIGTERM to ensure the application shuts down gracefully in different scenarios.
        // SIGINT signal, which is sent when you press Ctrl+C in the terminal or when the process is terminated by a process manager (e.g., systemd, PM2).
        ['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, async () => {
                //CLOSE THE EXACT CONNECTION INTENDED NOT ALL THE CLIENTS
                //WE WILL LOOP WITHIN CONNECTIONS, CLOSING ALL OPENED
                Object.values(connections).forEach(connection => {
                    connection.close();
                });
                process.exit(0);
            });
        });
        //RETURN THE QUALIFYING CONNECTION
        return connection

    } catch (error) {
        // isConnected = false;
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

//===========================================================================================
let loggedOut = false;

const logout = async (req, sessionId) => {
    // Check if the session ID matches
    if (req.sessionID === sessionId) {
        const myDatabase = req.session.myDatabase
        try {
            // Destroy the session if session IDs match
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        reject(err);
                    } else {
                        if (connections[myDatabase]) {
                            const connection = connections[myDatabase];
                            connection.close(); //THIS ONE CLOSES THE SPECIFIC
                            //ALSO REMOVE FROM THE CONNECTION ARRAY
                          delete connections[databaseName];   
                        }
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
