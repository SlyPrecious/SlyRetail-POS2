import { dbConnection } from "../Controllers/loginPageController.js";
import { ObjectId } from 'mongodb';
import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { ExpenseCategoriesModel } from '../Schemas/slyretailExpenseCategoriesSchemas.js';
import { IncomeCategoriesModel } from '../Schemas/slyretailIncomeCategoriesSchemas.js';
import { WorldCurrencies } from "../public/js/worldCurrency.js";
import { connectDB, myDatabase,signCriteria } from '../Schemas/slyretailDbConfig.js';

let currencies = [];
let intervalArray = [];
let isBaseCurrency = "";
let isoCode = '';
let symbols = {};//this variable object will contain all the currency symbolss in the expense table
export async function advCashMngmnt() {

    try {
          const db = await connectDB(myDatabase,signCriteria);
         if (db) {
        // //THIS CODE IS SENDING THE ARRAY OF CURRENCIES FROM THE DATABASE TO THE HTML/ CLIENT'S SIDE THE LIST OF CURRENCIES ON THE MY EXPENSES DROPDOWN MENU
  const myCurrenciesModel = CurrenciesModel(db);
        currencies = await myCurrenciesModel.find()
        //find the base currency in the collection that is where there is a Y
        const baseCurrency = await myCurrenciesModel.findOne({ BASE_CURRENCY: 'Y' });
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
    return { isBaseCurrency: isBaseCurrency,  currencies: currencies, isoCode: isoCode };
}

