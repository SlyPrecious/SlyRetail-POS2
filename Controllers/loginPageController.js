import { MongoClient, ObjectId } from 'mongodb';
import { CredentialsModel } from '../Schemas/slyretailLoginSchemas.js';
import { connectDB } from '../Schemas/slyretailDbConfig.js';
import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { accountingPeriodModel } from '../Schemas/slyretailAccountingPeriodSettingsSchemas.js';
import { advaHeadersModel } from '../Schemas/slyretailAdvCashMngmntHeadersSettingsSchemas.js';
import { payInHeadersModel } from '../Schemas/slyretailPayInHeadersSettingsSchemas.js';
import { payOutHeadersModel } from '../Schemas/slyretailPayOutHeadersSettingsSchemas.js';
import { CashflowModel } from '../Schemas/slyretailCashflowSchemas.js';
import { versionControlModel } from '../Schemas/slyretailVersionControlSchemas.js';
import { exists } from 'fs';
let cashFlows = []

let loggedInStatus = "";
let dbName = "";
let currencies = [];
let dbConnection = null; // Global database connection

// SignUp/SignIn function
async function signUpSignIn(databaseName, email, databasePassword, signingCriteria) {
    let currentVersion = "1.3"
    try {
        if (signingCriteria === "Sign Up") {
            loggedInStatus = await createDatabase(email, databaseName, databasePassword, signingCriteria);
            dbName = databaseName
            currencies = await CurrenciesModel.find()
            //this is to keep the current structure of databases, the web interface does not have a version but the database will need to be controlled
            const newVersionEntry = new versionControlModel({ version: currentVersion });
            await newVersionEntry.save()
                .then(() => console.log('New version entry saved successfully!'))
                .catch(error => {
                    console.error('Error saving version entry:', error);
                    if (error.errors) {
                        console.log('Validation errors:', error.errors);
                    }
                });
            console.log(loggedInStatus +'my stat')
        }

        if (signingCriteria === "Sign In") {
            try {
                const db = await connectDB(databaseName, signingCriteria);
                if (db !== false) {
                    try {
                        const credentials = await CredentialsModel.findOne({ DbPassword: databasePassword });
                        if (credentials) { //THEN CHECK ALSO IF THE PASSWORD IS THERE AND MATCHING
                            loggedInStatus = "True";
                            dbName = databaseName
                            currencies = await CurrenciesModel.find()
                        } else {
                            loggedInStatus = "False";
                        }
                    } catch (error) {
                        console.error("Error occurred while querying CredentialsModel:", error);
                        return
                    }
                    //==============================================================
                    //first check if the versioncontrols collection exist,if not create it
                    try {
                        const collections = await db.db.listCollections().toArray();
                        const collectionName = 'versioncontrols'
                        const collectionExists = collections.some(col => col.name === collectionName);

                        if (!collectionExists) {
                            //this is to keep the current structure of databases, the web interface does not have a version but the database will need to be controlled
                            const newVersionEntry = new versionControlModel({ version: currentVersion });
                            await newVersionEntry.save()
                                .then(() => console.log('New version entry saved successfully!'))
                                .catch(error => {
                                    console.error('Error saving version entry:', error);
                                    if (error.errors) {
                                        console.log('Validation errors:', error.errors);
                                    }
                                });
                        }
                    } catch (error) {
                        console.error("Error occurred while saving version:", error);
                        return
                    }
                    //===================================================
                    //FOR UPGRADES
                    try {
                        // const db = await connectDB(databaseName, signingCriteria); // Reuse the connection globally
                        const cashflowData = db.collection('cashflows')
                        const CashflowData = await cashflowData.find().toArray()
                        //get the currencies
                        // currencies = await CurrenciesModel.find()

                        // Filter documents where the 'Vat' field is null or missing
                        const existingVersion = await versionControlModel.find();
                        if (existingVersion.version === '1' && existingVersion.version !== currentVersion) {
                            //this is to keep the current structure of databases, the web interface does not have a version but the database will need to be controlled
                            cashFlows = await CashflowModel.find()
                            for (let a = 0; a < cashFlows.length; a++) { //first loop for the purpose of PAYINs AND OUTs totals
                                //DURING THIS LOOP, ONE CAN TAKE ADVANTAGE AND CALCULATE THE OPENING BAL FOR BOTH THE PAYINs AND OUTs
                                const row = cashFlows[a];
                                //modify the vat
                                row.Vat = {
                                    QRCode: '',
                                    DeviceId: 0,
                                    ZimraFsNo: '',
                                    VatNumber: 0,
                                    TinNumber: 0,
                                    VatAmount: 0,
                                    VatStatus: 'N'
                                }
                                await row.save();
                            }
                            //set the latest version currentVersion
                            await versionCntrl.updateOne(
                                { _id: ObjectId(existingVersion._id) },
                                { $set: { version: currentVersion } } // Correct
                            )
                        }
                        //next upgrade from 1 to 1.2
                        if (existingVersion.version === "1.2" && existingVersion.version !== currentVersion) {
                            try {
                                // Loop through each cash flow document
                                const cashFlows = await CashflowModel.find();
                                for (let a = 0; a < cashFlows.length; a++) {
                                    const row = cashFlows[a];
                                    // Initialize Tax.vat if it doesn't exist
                                    const documentVat = row.Tax.vat
                                    const documentZtf = row.Tax.ztf
                                    // Update Tax.vat and Tax.ztf for each row where Vat exists
                                    if (documentVat.ZimraFsNo === '0') {
                                        documentVat.ZimraFsNo = ''
                                    }
                                    row.Tax.vat = {
                                        QRCode: documentVat.QRCode || '',       // Use actual values from documentVat
                                        DeviceId: documentVat.DeviceId || 0,
                                        ZimraFsNo: documentVat.ZimraFsNo || '',
                                        VatNumber: documentVat.VatNumber || 0,             // Setting the VatNumber as 0
                                        TinNumber: documentVat.TinNumber || 0,             // Setting the TinNumber as 0
                                        VatAmount: documentVat.VatAmount || 0,    // Corrected VatAmount reference
                                        VatStatus: documentVat.VatStatus || 'N' // Use VatStatus from Vat
                                    };
                                    row.Tax.ztf = {
                                        First: documentZtf.First || '',       // Use actual values from Vat
                                        Second: documentZtf.Second || '',
                                        LevyAmount: documentZtf.LevyAmount || 0,
                                        ZtfStatus: documentZtf.ZtfStatus || 'N',
                                    }

                                    const cashflowEntry = new CashflowModel(row);
                                    await cashflowEntry.save();
                                }
                            }
                            catch (error) {
                                console.error("Error during the operation:", error);
                            }
                            //set the latest version currentVersion
                            await versionCntrl.updateOne(
                                { _id: ObjectId(existingVersion._id) },
                                { $set: { version: currentVersion } } // Correct
                            )
                        }
                        //next upgrade (from 1.2 to 1.3) to tax
                        if (existingVersion.version === "1.3" && existingVersion.version !== currentVersion) { //and it must not be equal to the currentVersion
                            try {
                                // Set Tax.ztf (you can modify this as needed)
                                let ztf = {}
                                // Log the filtered data to verify if Vat exists and is not empty
                                const vatExistsAndNotEmpty = CashflowData.filter(row =>
                                    row.Vat && typeof row.Vat === 'object' && Object.keys(row.Vat).length > 0
                                );
                                // Loop through each cash flow document
                                const cashFlows = await CashflowModel.find();
                                for (let a = 0; a < cashFlows.length; a++) {
                                    const row = cashFlows[a];

                                    // Initialize Tax if it doesn't exist
                                    if (!row.Tax) {
                                        row.Tax = {};  // Ensure Tax is an object
                                    }

                                    // Initialize Tax.vat if it doesn't exist
                                    row.Tax.vat = row.Tax.vat || {};  // Ensure Tax.vat is an object if it doesn't exist
                                    row.Tax.ztf = row.Tax.ztf || {};  // Ensure Tax.ztf is an object if it doesn't exist
                                    // Update Tax.vat and Tax.ztf for each row where Vat exists
                                    vatExistsAndNotEmpty.forEach(documentVat => {
                                        const documentZtf = row.Tax.ztf
                                        if (documentVat.ZimraFsNo === '0') {
                                            documentVat.ZimraFsNo = ''
                                        } row.Tax.vat = {
                                            QRCode: documentVat.QRCode || '',       // Use actual values from documentVat
                                            DeviceId: documentVat.DeviceId || 0,
                                            ZimraFsNo: documentVat.ZimraFsNo || '',
                                            VatNumber: documentVat.VatNumber || 0,             // Setting the VatNumber as 0
                                            TinNumber: documentVat.TinNumber || 0,             // Setting the TinNumber as 0
                                            VatAmount: documentVat.VatAmount || 0,    // Corrected VatAmount reference
                                            VatStatus: documentVat.VatStatus || 'N' // Use VatStatus from Vat
                                        }
                                        row.Tax.ztf = {
                                            First: documentZtf.First || '',       // Use actual values from Vat
                                            Second: documentZtf.Second || '',
                                            LevyAmount: documentZtf.LevyAmount || 0,
                                            ZtfStatus: documentZtf.ZtfStatus || 'N',
                                        }

                                    });
                                    const cashflowEntry = new CashflowModel(row);
                                    await cashflowEntry.save();
                                    // remove the Vat field using $unset directly on the database 
                                    cashflowData.updateOne(
                                        { _id: row._id }, // Find the document by its _id
                                        {
                                            $unset: { "Vat": "" }      // Remove the Vat field
                                        }
                                    );
                                }
                            }
                            catch (error) {
                                console.error("Error during the operation:", error);
                            }

                            //CHANGE HEADERNAME vAT TO tAX 
                            try {
                                await payOutHeadersModel.updateOne({ HeaderName: 'Vat' }, {
                                    $set: {
                                        HeaderName: 'Tax'
                                    }
                                }).then(result => {
                                    console.log(`${result.modifiedCount} document(s) updated.`);

                                })
                            } catch (err) {
                                console.error('Error connecting to MongoDB:', err);
                            }
                            try {
                                await payInHeadersModel.updateOne({ HeaderName: 'Vat' }, {
                                    $set: {
                                        HeaderName: 'Tax'
                                    }
                                }).then(result => {
                                    console.log(`${result.modifiedCount} document(s) updated.`);

                                })
                            } catch (err) {
                                console.error('Error connecting to MongoDB:', err);
                            }
                            try {
                                await advaHeadersModel.updateOne({ HeaderName: 'Vat' }, {
                                    $set: {
                                        HeaderName: 'Tax'
                                    }
                                }).then(result => {
                                    console.log(`${result.modifiedCount} document(s) updated.`);

                                })
                                // Check if the document already exists with HeaderName: 'Type'
                                const existingHeader = await advaHeadersModel.findOne({ HeaderName: 'Type' });

                                if (!existingHeader) {
                                    // If the document doesn't exist, create a new one
                                    const newHeader = new advaHeadersModel({ HeaderName: 'Type', isDisplayed: true });
                                    const result = await newHeader.save();
                                }

                            } catch (err) {
                                console.error('Error connecting to MongoDB:', err);
                            }
                            //set the latest version currentVersion
                            versionControlModel.updateOne({ _id: ObjectId(existingVersion._id) },
                                { set: { version: currentVersion } });
                            // }

                        }
                    } catch (error) {
                        console.error("Error occurred while saving version:", error);
                        return
                    }
                }
                else {
                    loggedInStatus = "False";
                }
            } catch (error) {
                console.error("Error occurred while connecting to database:", error);
                return
            }
        }
        // console.log(loggedInStatus + 'Controller loggin status')
        // return {loggedInStatus}
        return { loggedInStatus: loggedInStatus };
        // return { loggedInStatus: loggedInStatus, currencies: currencies };
    } catch (error) {
        console.error("Error occurred signin sugnup:", error);
    }
}
//======================================================================================================================
// Function to create a database
let loggedInStatus2 = ""
async function createDatabase(email, databaseName, databasePassword, signingCriteria) {
    try {
        const db = await connectDB(databaseName, signingCriteria);
        if (db !== false) {

            //EVERYTHING TO DO WITH DATABASE CREATION MUST HAPPEN HERE, eg creating all the neccessary collections
            const collectionNames = [
                'CostCentreCategories', "Customers", 'Employees', "Invoices", "Products", 'Sales', 'Stores', "Suppliers", 'Vouchers'
            ];

            for (let i = 0; i < collectionNames.length; i++) {
                try {
                    const result = await db.createCollection(collectionNames[i]);
                } catch (error) {
                    console.error("Error creating collections", error);
                }
            }

            try {
                const currencyEntry = new CurrenciesModel({ Currency_Name: 'USD', paymentType: 'CASH', RATE: Number(1).toFixed(2), BASE_CURRENCY: 'Y' });
                const result = await currencyEntry.save();
            } catch (error) {
                console.error("Error inserting currencies", error);
                return
            }
            try {
                //a collection called accounting period
                const currentYear = new Date().getFullYear();
                const accountingEntry = new accountingPeriodModel({ startDate: (`${currentYear}-01-01`) });
                const result = await accountingEntry.save();
            } catch (error) {
                console.error("Error inserting accounting period", error);
                return
            }
            const data = [{ HeaderName: 'Date', isDisplayed: true }, { HeaderName: 'ShiftNo', isDisplayed: true },
            { HeaderName: 'InvoiceRef', isDisplayed: true }, { HeaderName: 'Tax', isDisplayed: true }, { HeaderName: 'Description', isDisplayed: true },
            { HeaderName: 'Category', isDisplayed: true }, { HeaderName: 'Currency', isDisplayed: true }, { HeaderName: 'Amount', isDisplayed: true },
            { HeaderName: 'Rate', isDisplayed: true }, { HeaderName: 'CashEquiv', isDisplayed: true }, { HeaderName: 'RunningBalance', isDisplayed: true }]
            try {
                try {
                    // Using insertMany to insert multiple documents at once
                    await advaHeadersModel.insertMany(data);
                    const result = new advaHeadersModel({ HeaderName: 'Tax', isDisplayed: true });
                    await result.save();
                } catch (error) {
                    console.error('Error saving adv headers:', error);
                }

                try {
                    // Using insertMany to insert multiple documents at once
                    await payInHeadersModel.insertMany(data);
                } catch (error) {
                    console.error('Error saving payin headers:', error);
                }
                try {
                    // Using insertMany to insert multiple documents at once
                    await payOutHeadersModel.insertMany(data);
                } catch (error) {
                    console.error('Error saving payout headers:', error);
                }
            } catch (error) {
                console.error('Error inserting headers:', error);
            }

            // Save credentials
            const createAndSaveCredentials = async (User_Account, DbPassword, Email) => {
                try {
                    // await connectDB(databaseName);
                    const newCredentials = new CredentialsModel({ User_Account, DbPassword, Email });
                    await newCredentials.save();
                    return "True";
                } catch (error) {
                    console.error('Error saving credentials:', error);
                    return "False";
                }
            };

            loggedInStatus2 = await createAndSaveCredentials(databaseName, databasePassword, email);
        } else {
            loggedInStatus2 = "False";
        }
        console.log(loggedInStatus2 + 'logg2')
        return { loggedInStatus2 : loggedInStatus2 }
    } catch (error) {
        console.error('Error creating database:', error);
        return "False";
    }

}

export { dbName, signUpSignIn, dbConnection }; 
