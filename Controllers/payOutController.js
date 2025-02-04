import { dbConnection } from "../Controllers/loginPageController.js";
import { ObjectId } from 'mongodb';
import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { CashflowModel } from '../Schemas/slyretailCashflowSchemas.js';
import { ExpenseCategoriesModel } from '../Schemas/slyretailExpenseCategoriesSchemas.js';
import { IncomeCategoriesModel } from '../Schemas/slyretailIncomeCategoriesSchemas.js';
import { WorldCurrencies } from "../public/js/worldCurrency.js";

let cashFlowData = [];
let UpdatedExpenses = 0;
let currencies = [];
let expenseCategories = [];
let incCategories = [];
let intervalArray = [];
let isBaseCurrency = "";
let isoCode = '';
let totalExpenses = 0;
let totalIncome = 0;
let symbols = {};//this variable object will contain all the currency symbolss in the expense table
let UpdatedIncome = 0;
export async function payOutData() {

    try {
        // //THIS CODE IS SENDING THE ARRAY OF CURRENCIES FROM THE DATABASE TO THE HTML/ CLIENT'S SIDE THE LIST OF CURRENCIES ON THE MY EXPENSES DROPDOWN MENU
        cashFlowData = await CashflowModel.find()  //Put the expenses into an array 'note that this is the whole document, but we want to tap into the name object only'
        currencies = await CurrenciesModel.find()
        expenseCategories = await ExpenseCategoriesModel.find();
        incCategories = await IncomeCategoriesModel.find();

        //find the base currency in the collection that is where there is a Y
        const baseCurrency = await CurrenciesModel.findOne({ BASE_CURRENCY: 'Y' });

        //CALCULATE THE TOTAL PAY IN AND OUT
        for (let i = 0; i < cashFlowData.length; i++) {
            const data = cashFlowData[i]
            if (data.CashFlowType === 'Payout') {
                const relativeRate = parseFloat(data.CashFlowRate / baseCurrency.RATE);
                const calculatedCashEquiv = Number(parseFloat(data.CashFlowAmount / relativeRate)).toFixed(2);
                // console.log(relativeRate)
                CashflowModel.updateOne({ _id: ObjectId(data._id) }, {
                    $set: {
                        CashFlowCashEquiv: calculatedCashEquiv
                    }
                })

                UpdatedExpenses += parseFloat(data.CashFlowCashEquiv);
            }
            else if (data.CashFlowType === 'Pay in') {

                const relativeRate = parseFloat(data.CashFlowRate / baseCurrency.RATE);
                const calculatedCashEquiv = Number(parseFloat(data.CashFlowAmount / relativeRate)).toFixed(2);
                // console.log(relativeRate)
                CashflowModel.updateOne({ _id: ObjectId(data._id) }, {
                    $set: {
                        CashFlowCashEquiv: calculatedCashEquiv
                    }
                })
                UpdatedIncome += parseFloat(data.CashFlowCashEquiv);
            }
        }
        totalExpenses = Number(parseFloat(UpdatedExpenses)).toFixed(2);
        totalIncome = Number(parseFloat(UpdatedIncome)).toFixed(2);

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
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
    return { isBaseCurrency: isBaseCurrency, expenseCategories: expenseCategories, currencies: currencies, isoCode: isoCode, totalIncome: totalIncome, totalExpenses: totalExpenses };
}

