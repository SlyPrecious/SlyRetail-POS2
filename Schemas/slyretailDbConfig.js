import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
//THIS DATABSE CONFI SHOULD VERIFY TOO IF THE CLIENT IS ON SIGNUP OR SIGN IN, AND ACT ACCORDINGLY
let isConnected = false; // Track the connection status
let Databases = [];

const connectDB = async (databaseName, signingCriteria) => {
    if (signingCriteria === "Sign Up") {//ALL CONNECTIONS WHEN SIGNING UP
        //const host = 'localhost';
        // const client = new MongoClient(`${host}:${port}`);
        const host = "mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/?retryWrites=true&w=majority"
        //        const port = 27017;
        // MongoDB Atlas connection URI (string)

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
            // loggedInStatus = "False";
            //do nothing if it exist
            //  loggedInStatus = 'Database already exist'
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
            } catch (error) {
                isConnected = false; // Set connection status to true
                console.error('Error connecting to MongoDB:', error);
                throw new Error('Failed to connect to MongoDB');
            }
        }

    }


    if (signingCriteria === "Sign In") {// ALL CONNECTIONS WHEN SIGNING IN
        try {
            // await mongoose.connect('mongodb://localhost/' + databaseName, {
            //THIS IS THE FREE CLUSTER ON MONGO DB CURRENTLY USED FOR DEVELOPMENT
            await mongoose.connect("mongodb+srv://slyretailpos:1234marsr@cluster0.kv9k65a.mongodb.net/" + databaseName + "?retryWrites=true&w=majority", {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000
            });

            isConnected = true; // Set connection status to true
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

// export default connectDB;
export { connectDB };
