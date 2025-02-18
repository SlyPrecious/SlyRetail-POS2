import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { connectDB } from '../Schemas/slyretailDbConfig.js';
import { WorldCurrencies } from "../public/js/worldCurrency.js";

let currencies = [];
let isBaseCurrency = "";
let isoCode = '';
let databaseName = ""
let signingCriteria = ""
export async function advCashMngmnt(req, sessionId) {

    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const mycurrenciesModel = CurrenciesModel(db);
            // //THIS CODE IS SENDING THE ARRAY OF CURRENCIES FROM THE DATABASE TO THE HTML/ CLIENT'S SIDE THE LIST OF CURRENCIES ON THE MY EXPENSES DROPDOWN MENU
            currencies = await mycurrenciesModel.find()
            //find the base currency in the collection that is where there is a Y
            const baseCurrency = await mycurrenciesModel.findOne({ BASE_CURRENCY: 'Y' });
            //LOOP WITHIN THE WORLD CURRENCIES ARRAY SO THAT WE CAN ACCESS THE ISO CODE FOR THE BASE CURRENCY SELECTED
            for (let i = 0; i < WorldCurrencies.length; i++) {
                const WorldCurrency = WorldCurrencies[i];
                if ((WorldCurrency.Currency_Name).toLowerCase() === (baseCurrency.Currency_Name).toLowerCase()) {
                    isoCode = WorldCurrency.ISO_Code;
                }
            }
            // now take the  name of the base currency  and store it in a variable
            isBaseCurrency = baseCurrency.Currency_Name;
            //CREATE THE INTERVAL ARRAY
        }
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
    return { isBaseCurrency: isBaseCurrency, currencies: currencies, isoCode: isoCode };
}

