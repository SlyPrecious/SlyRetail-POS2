

import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
// THIS DATABASE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let isConnected = false; // Track the connection status
let Databases = [];
// Object to store connections for each user/database
let connections = {};

const connectDB = async (req, databaseName, signingCriteria) => {
    const normalizedDatabaseName = databaseName.toLowerCase();
    let myDatabase, signCriteria, connection;

    // MongoDB Atlas connection URI
    const uri = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";

    try {
        if (signingCriteria === "Sign Up") {
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
        }

        // Store the values in session
        req.session.myDatabase = databaseName; // we only need this is session storage and return the unique id of the storage and sedn it to the client side browser thru the use of cookies
//        req.session.signCriteria = signingCriteria; //no need
 //       req.session.connection = connection; //not safe
// console.log(req)
        // Return the connection object
        return { connection: connection, myDatabase: databaseName, signCriteria: signingCriteria };
    } catch (error) {
        isConnected = false;
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
};

//=============================================================================================
// Call this function when logging out to reset the connection status.
// Let's assume you have multiple connections stored in an object or Map
// let loggedOut = false;

// const logout = async (databaseName) => {
//     // Retrieve the connection associated with the user's database
//     try {
//         const normalizedDatabaseName = databaseName.toLowerCase();
//         const connection = connections[normalizedDatabaseName];
//         if (connection && connection.readyState === 1) { // Check if the specific connection is open
//             try {
//                 // Close the specific MongoDB connection
//                 await connection.close();
//                 console.log(`${databaseName} logged out, MongoDB connection closed`);
//                 delete connections[normalizedDatabaseName]; // Remove from the connections map if not needed
//                 loggedOut = true; // Set loggedOut to true after successfully closing the connection
//             } catch (err) {
//                 loggedOut = false;
//                 console.error(`Error closing MongoDB connection for ${databaseName}:`, err);
//             }
//         } else {
//             // No active connection found
//             console.log(`No active MongoDB connection to close for ${d

// import { MongoClient, ObjectId } from 'mongodb';
// import mongoose from 'mongoose';
// //THIS DATABSE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
// let isConnected = false; // Track the connection status
// let Databases = [];
// // Object to store connections for each user/database
// let connections = {};
// const connectDB = async (req,databaseName, signingCriteria) => {
//     const normalizedDatabaseName = databaseName.toLowerCase();
//     let myDatabase, signCriteria, connection;

//     // MongoDB Atlas connection URI
//     const uri = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority";

//     try {
//         if (signingCriteria === "Sign Up") {
//              const host = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority"
//         // Create a new MongoClient instance and pass in the connection URI and options
//         const client = new MongoClient(host, {
//             useNewUrlParser: true,  // Use the modern URL parser
//             useUnifiedTopology: true  // Use the new unified topology engine
//         });
//         //CHECK IF THE DATABASE THAT THE USER IS CREATING IS ALREADY THERE.
//         const adminDb = client.db().admin();
//         const databasesList = await adminDb.listDatabases();
//         Databases.push(...databasesList.databases.map(db => db.name));
//         const lowerCaseDatabases = Databases.map(db => db.toLowerCase());
//         if (!lowerCaseDatabases.includes(normalizedDatabaseName)) {
//                  // Create a new Mongoose connection for the database
//             connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//                 serverSelectionTimeoutMS: 10000,
//                 socketTimeoutMS: 45000,
//             }).asPromise();

//             isConnected = true;
//             connections[normalizedDatabaseName] = connection;
//             console.log(`Database '${databaseName}' created successfully.`);
//         }
//         }

//         if (signingCriteria === "Sign In") {
//             // Reuse existing connection if it exists
//             if (connections[normalizedDatabaseName]) {
//                   connection = connections[normalizedDatabaseName];
//             } else {
//                connection = await mongoose.createConnection(`mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/${normalizedDatabaseName}?retryWrites=true&w=majority`, {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//                 serverSelectionTimeoutMS: 10000,
//                 socketTimeoutMS: 45000,
//             }).asPromise();

//             isConnected = true;
//             connections[normalizedDatabaseName] = connection;
//             console.log(`Connected to database '${databaseName}' successfully.`);
      
//         }
//          // Store the values in session
//         req.session.myDatabase = databaseName;
//         req.session.signCriteria = signingCriteria;
//         req.session.connection = connection;

//         // Return the connection object
//         return { connection, myDatabase: databaseName, signCriteria };
//     } catch (error) {
//         isConnected = false;
//         console.error('Error connecting to MongoDB:', error);
//         throw new Error('Failed to connect to MongoDB');
//     }
// };
// //=============================================================================================
// // // Call this function when logging out to reset the connection status.
// // Let's assume you have multiple connections stored in an object or Map
// // let loggedOut = false;

// // const logout = async (databaseName) => {
// //     // Retrieve the connection associated with the user's database
// //     try {
// //         const normalizedDatabaseName = databaseName.toLowerCase();
// //         const connection = connections[normalizedDatabaseName];
// //         if (connection && connection.readyState === 1) { // Check if the specific connection is open
// //             try {
// //                 // Close the specific MongoDB connection
// //                 await connection.close();
// //                 console.log(`${databaseName} logged out, MongoDB connection closed`);
// //                 delete connections[normalizedDatabaseName]; // Remove from the connections map if not needed
// //                 loggedOut = true; // Set loggedOut to true after successfully closing the connection
// //             } catch (err) {
// //                 loggedOut = false;
// //                 console.error(`Error closing MongoDB connection for ${databaseName}:`, err);
// //             }
// //         } else {
// //             // No active connection found
// //             console.log(`No active MongoDB connection to close for ${databaseName}`);
// //             loggedOut = false; // Set loggedOut to false if there is no connection to close
// //         }
// //         return { loggedOut }; // Always return loggedOut
// //     } catch (error) {
// //         console.error(`Error closing MongoDB connection for ${databaseName}:`, error);
// //     }
// // };
export { connectDB };
