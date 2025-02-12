import { dbConnection } from "../Controllers/loginPageController.js";
import { ObjectId } from 'mongodb';
import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { ExpenseCategoriesModel } from '../Schemas/slyretailExpenseCategoriesSchemas.js';
import { IncomeCategoriesModel } from '../Schemas/slyretailIncomeCategoriesSchemas.js';
import { WorldCurrencies } from "../public/js/worldCurrency.js";

let currencies = [];
let intervalArray = [];
let isBaseCurrency = "";
let isoCode = '';
let symbols = {};//this variable object will contain all the currency symbolss in the expense table
export async function advCashMngmnt(req) {

    try {
         const { models } = req.session; //get the models in the session storage
       if (!models) {
      throw new Error('Session models not found');
    }
             // Access the models from the session
const { credentialsModel,advHeadersModel, cashflowModel,versionControlModel, currenciesModel,accountingPeriodModel} = models;
        // //THIS CODE IS SENDING THE ARRAY OF CURRENCIES FROM THE DATABASE TO THE HTML/ CLIENT'S SIDE THE LIST OF CURRENCIES ON THE MY EXPENSES DROPDOWN MENU
        currencies = await currenciesModel.find()
        //find the base currency in the collection that is where there is a Y
        const baseCurrency = await currenciesModel.findOne({ BASE_CURRENCY: 'Y' });
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
    return { isBaseCurrency: isBaseCurrency,  currencies: currencies, isoCode: isoCode };
         
    }catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

