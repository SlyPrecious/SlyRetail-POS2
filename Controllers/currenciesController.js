import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { ObjectId } from 'mongodb';
import { connectDB } from '../Schemas/slyretailDbConfig.js';

let isUpdated = false
let amDeleted = false
let isSaved = false;
let databaseName = ""
let signingCriteria = ""

export async function updateCurrencies(req, currencyId, paymentType, paymentName, paymentRate, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('i am the  procedure of updating  currencies document in payment type ');
            // insert the new payment
            await myCurrenciesModel.updateOne({ _id: ObjectId(currencyId) }, {
                $set: {
                    Currency_Name: paymentName,
                    RATE: Number(paymentRate),
                    paymentType: paymentType
                }
            })
                .then(result => {
                    console.log(`${result.matchedCount} document(s) matched the filter criteria.`);
                    console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
                    if (result.modifiedCount !== '') {
                        isUpdated = true;
                    }
                })
                .catch(error => console.error(error));
        }
    }
    catch (err) {
        console.error('Error UPDATING CURRENCIES:', err);
    }
    return { isUpdated };
}
//===========================================================================================
export async function updateCurrencyName(req, currencyId, paymentType, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('i am the  procedure of updating  currencies name in payment type ');
            // insert the new payment
            await myCurrenciesModel.updateOne({ _id: ObjectId(currencyId) }, {
                $set: {
                    paymentType: paymentType
                }
            })
                .then(result => {
                    console.log(`${result.matchedCount} document(s) matched the filter criteria.`);
                    console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
                    if (result.modifiedCount !== '') {
                        isUpdated = true;
                    }
                })
                .catch(error => console.error(error));
        }
    }
    catch (err) {
        console.error('Error UPDATING CURRENCIES:', err);
    }
    return { isUpdated };
}
//=========================================================================================================================
export async function insertNewCurrency(req, paymentType, paymentName, paymentRate, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('procedure for inserting new currency')
            // insert the new payment
            let data = {
                Currency_Name: paymentName, BASE_CURRENCY: " N", //TO FIX THIS WE NEED AN N/OFF BUTTON FOR BASE CURRENCY OPTION
                RATE: Number(paymentRate), paymentType: paymentType
            }
            const currencyEntry = new myCurrenciesModel(data);
            try {
                const result = await currencyEntry.save();
                if (result) {
                    isSaved = true;
                }
            } catch (saveError) {
                console.error('Error saving cash flow entry:', saveError);
                isSaved = false;
            }
        }
    } catch (err) {
        console.error('Error UPDATING CURRENCIES:', err);
    }
    return { isSaved };

}

//==========================================================================================================================
export async function updateBaseCurrency(req, paymentId, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('i am the update base currency procedure');
            const currencies = await myCurrenciesModel.find(); //Put the multiple currencies into an array 'note that this is the whole document, but we want to tap into the name object only'
            // Loop through the currencies and check for the ID of the checked one
            for (let i = 0; i < currencies.length; i++) {
                const currency = currencies[i];
                const isBaseCurrency = currency._id.toString() === paymentId;
                //FIRST CONVERT ALL CURRENCIES TO N
                await myCurrenciesModel.updateOne({ _id: ObjectId(currency._id) }, { $set: { BASE_CURRENCY: 'N' } })
                    .then(result => {
                        console.log(`Updated ${result.modifiedCount} documents to N.`);
                    })
                    .catch(err => {
                        console.error(err);
                    });
                // If it's the checked currency, update the baseCurrency field to "Y"
                if (isBaseCurrency) {
                    await myCurrenciesModel.updateOne({ _id: ObjectId(paymentId) }, { $set: { BASE_CURRENCY: 'Y' } })
                        .then(result => {
                            console.log(`Updated ${result.modifiedCount} documents to Y`);
                            if (result.modifiedCount !== 0) {
                                isUpdated = true;

                            }
                            if (result.modifiedCount === 0) {
                                isUpdated = false;

                            }
                        })
                        .catch(err => {
                            console.error(err);
                            isUpdated = false;

                        });
                }
            }
        }
    }
    catch (err) {
        console.error('Error UPDATING CURRENCIES:', err);
    }
    return { isUpdated };
}
//==========================================================================================================
export async function updateCurrencyRate(req, currencyId, CurrencyRate, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('i am the  procedure of updating  currencies rate in payment type ');
            // insert the new payment
            await myCurrenciesModel.updateOne({ _id: ObjectId(currencyId) }, { $set: { RATE: Number(CurrencyRate) } })
                .then(result => {
                    console.log(`${result.matchedCount} document(s) matched the filter criteria.`);
                    console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
                    if (result.modifiedCount !== '') {
                        isUpdated = true;
                    }
                })
                .catch(error => console.error(error));
        }
    }
    catch (err) {
        console.error('Error UPDATING CURRENCIES rate:', err);
    }
    return { isUpdated };
}
//==========================================================================================================
export async function deleteCurrency(req, idToDelete, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCurrenciesModel = CurrenciesModel(db);
            console.log('i am the  procedure of deleting currency  ');
            for (let a = 0; a < idToDelete.length; a++) {
                const element = idToDelete[a];
                // insert the new payment
                await myCurrenciesModel.deleteOne({ _id: ObjectId(element) })
                    .then(result => {
                        console.log(`${result.deletedCount} document(s) matched the filter criteria.`);
                        if (result.deletedCount !== 0) {
                            amDeleted = true;
                        }
                        else {
                            amDeleted = false
                        }
                    })
                    .catch(error => console.error(error));
            }
        }
    }
    catch (err) {
        console.error('Error deleting CURRENCIES:', err);
    }
    return { amDeleted };
}
//============================================================================================================
