import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { ObjectId } from 'mongodb';

let isUpdated = false
let amDeleted = false
let isSaved = false;
let insertedId = ''

export async function updateCurrencies(req,currencyId, paymentType, paymentName, paymentRate) {
    try {
const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel} = models;
    const cashFlowCat = await currenciesModel.find();
        console.log('i am the  procedure of updating  currencies document in payment type ');
        // insert the new payment
        await currenciesModel.updateOne({ _id: ObjectId(currencyId) }, {
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
export async function updateCurrencyName(req,currencyId, paymentType) {
    try {
         const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel} = models;
    // const cashFlowCat = await currenciesModel.find();
        console.log('i am the  procedure of updating  currencies name in payment type ');
        // insert the new payment
        await currenciesModel.updateOne({ _id: ObjectId(currencyId) }, {
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
     return { isUpdated }; 
}
    }
    catch (err) {
        console.error('Error UPDATING CURRENCIES:', err);
    }

}
//=========================================================================================================================
export async function insertNewCurrency(req,paymentType, paymentName, paymentRate) {
    try {
        console.log('procedure for inserting new currency' + paymentType, paymentName, paymentRate)
      const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel} = models;
        let data = {
            Currency_Name: paymentName, BASE_CURRENCY: " N", //TO FIX THIS WE NEED AN N/OFF BUTTON FOR BASE CURRENCY OPTION
            RATE: Number(paymentRate), paymentType: paymentType
        }
        const currencyEntry = new currenciesModel(data);
        try {
            const result = await currencyEntry.save();
            if (result) {
                console.log(`${result.insertedId} document(s) matched the filter criteria.`);
                isSaved = true;
                insertedId = result.insertedId
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
export async function updateBaseCurrency(req,paymentId) {
    try {
        console.log('i am the update base currency procedure');
       const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel} = models;
        const currencies = await currenciesModel.find(); //Put the multiple currencies into an array 'note that this is the whole document, but we want to tap into the name object only'
        // Loop through the currencies and check for the ID of the checked one
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const isBaseCurrency = currency._id.toString() === paymentId;
            //FIRST CONVERT ALL CURRENCIES TO N
            await currenciesModel.updateOne({ _id: ObjectId(currency._id) }, { $set: { BASE_CURRENCY: 'N' } })
                .then(result => {
                    console.log(`Updated ${result.modifiedCount} documents to N.`);
                })
                .catch(err => {
                    console.error(err);
                });
            // If it's the checked currency, update the baseCurrency field to "Y"
            if (isBaseCurrency) {
                await currenciesModel.updateOne({ _id: ObjectId(paymentId) }, { $set: { BASE_CURRENCY: 'Y' } })
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
export async function updateCurrencyRate(req,currencyId, CurrencyRate) {
    try {
        console.log('i am the  procedure of updating  currencies rate in payment type ');
      const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel} = models;
        await currenciesModel.updateOne({ _id: ObjectId(currencyId) }, { $set: { RATE: Number(CurrencyRate) } })
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
export async function deleteCurrency(req,idToDelete) {
    try {
        console.log('i am the  procedure of deleting currency  ');
    const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {currenciesModel,cashflowModal} = models;
        for (let a = 0; a < idToDelete.length; a++) {
            const element = idToDelete[a];
            // insert the new payment
            await currenciesModel.deleteOne({ _id: ObjectId(element) })
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
