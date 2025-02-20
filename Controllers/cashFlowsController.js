import moment from "moment";
import { ObjectId } from 'mongodb';
import { CashflowModel } from '../Schemas/slyretailCashflowSchemas.js';
import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';
import { CashflowCategoriesModel } from '../Schemas/slyretailCategoriesSchemas.js';
import { connectDB } from '../Schemas/slyretailDbConfig.js';

//=================================================================================================================================================
//THIS CALCULATES ALL THE CASH INFLOWS AND OUTFLOWS FOR A PARTICULAR PERIOD AND PRESENTS IT TO THE USER ON AN ASCENDING ORDER
let cashFlows = []
let amUpdated = false;
let modifiedCount;
let amDeleted = false;
let isSaving = false;
let insertedDocuments = [];
let updatedDocuments = [];
let insertedCategories = [];
let databaseName = ""
let signingCriteria = ""
export async function getCashFlowArray(req, startDate, endDate, pageSize, page, payInFilterCategory, payOutFilterCategory, advancedSearchInput, searchInput, payOutSearchInput, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            const myCurrenciesModel = CurrenciesModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });

            let totalExpensesPerRange = 0;
            let totalIncomePerRange = 0;
            let advSearchedInputTotal = 0;
            let payInSearchedInputTotal = 0;
            let payOutSearchedInputTotal = 0;
            let totalExpensesPerRangeAdv = 0;
            let totalIncomePerRangeAdv = 0;
            let theBeforeIncome = 0
            let theBeforeExpenses = 0
            let cashFlowArray = []
            let payOutcashFlowArray = []
            let allCashFlows = []
            let payOutsearchedInputArray = []
            let payInsearchedInputArray = []
            let advSearchedInputArray = []
            //CHECK THE BASE CURRENCY
            let myRate = ''
            let baseCurrency = await myCurrenciesModel.findOne({ BASE_CURRENCY: 'Y' });
            if (baseCurrency) {
                myRate = baseCurrency.RATE
            }
            for (let a = 0; a < cashFlows.length; a++) { //first loop for the purpose of PAYINs AND OUTs totals
                //DURING THIS LOOP, ONE CAN TAKE ADVANTAGE AND CALCULATE THE OPENING BAL FOR BOTH THE PAYINs AND OUTs
                const row = cashFlows[a];
                const date = row.CashFlowDate;
                //    console.log(row)
                const parts = date.split("/");
                const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                const formattedDates2 = new Date(formattedDate);
                //RE CALCULATE THE CASH EQUIVE BASE ON THE CURRENCY SELECTED

                const relativeRate = row.CashFlowRate / baseCurrency.RATE;
                row.CashFlowCashEquiv = Number(parseFloat(row.CashFlowAmount) / parseFloat(relativeRate)).toFixed(2);
                //calculate the opening balance
                //GET THE VALUE OF THE PREVIOUS MONTH BASED ON THE RANGE SELECTED
                const momntStartDate = moment(startDate)
                let theBeforeStartDate = momntStartDate.subtract(1, "days")

                theBeforeStartDate = new Date(theBeforeStartDate)
                if (row.CashFlowType === "Payout") {
                    if (theBeforeStartDate.getTime() >= formattedDates2.getTime()) {
                        theBeforeExpenses += parseFloat(row.CashFlowCashEquiv);
                    }
                }
                else if (row.CashFlowType === "Pay in") {
                    if (theBeforeStartDate.getTime() >= formattedDates2.getTime()) {
                        theBeforeIncome += parseFloat(row.CashFlowCashEquiv);
                    }
                }

                if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
                    if (row.CashFlowType === 'Payout') {
                        //CODE FOR CALCULATING THE TOTAL PAYOUTs
                        //if there is a category filter, update the totals per category
                        if (payOutFilterCategory === "NoPayOutCatFilter") {
                            totalExpensesPerRange += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the PAYOuts
                            payOutcashFlowArray.push(cashFlows[a])
                        }
                        else if (row.CashFlowCategory === payOutFilterCategory) {
                            totalExpensesPerRange += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the PAYOuts
                            payOutcashFlowArray.push(cashFlows[a])
                        }
                        //CHECK KANA PANE MATCH IN  EACH DOC PANE DESCRIPTION WITH WHAT HAS BEEN ENTERED BY THE USER TO SEARCH
                        //CHECK FOR THE TWO SCENARIOS IF BOTH THE CATEGORY FILTER AND SEARCH INPU HAS SOMETHING
                        //ALSO IF THE SARCH INPUT HAS SOMETHING BUT THE CATEGORY FILTE DOESNT
                        const match = (row.CashFlowDescription).toLowerCase().includes(payOutSearchInput)
                        if (match && (row.CashFlowCategory === payOutFilterCategory)) {
                            //collect the totals of the filterd stuff
                            payOutSearchedInputTotal += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the searched stuff
                            payOutsearchedInputArray.push(cashFlows[a])
                        }
                        else if (match && (payOutFilterCategory === "NoPayOutCatFilter")) {
                            //collect the totals of the filterd stuff
                            payOutSearchedInputTotal += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the searched stuff
                            payOutsearchedInputArray.push(cashFlows[a])
                        }
                        //get totals for advanced sheet
                        totalExpensesPerRangeAdv = parseFloat(totalExpensesPerRangeAdv) + parseFloat(row.CashFlowCashEquiv)


                    }
                    if (row.CashFlowType === 'Pay in') {
                        //CODE FOR CALCULATING THE TOTAL PAYINs on a condition
                        //if there is a category filter, update the totals per category
                        if (payInFilterCategory === "NoPayInCatFilter") {
                            totalIncomePerRange += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the PAYINs
                            cashFlowArray.push(cashFlows[a])
                        }
                        else if (row.CashFlowCategory === payInFilterCategory) {
                            totalIncomePerRange += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the PAYINs
                            cashFlowArray.push(cashFlows[a])
                        }
                        //CHECK KANA PANE MATCH IN  EACH DOC PANE DESCRIPTION WITH WHAT HAS BEEN ENTERED BY THE USER TO SEARCH
                        //CHECK FOR THE TWO SCENARIOS IF BOTH THE CATEGORY FILTER AND SEARCH INPU HAS SOMETHING
                        //ALSO IF THE SARCH INPUT HAS SOMETHING BUT THE CATEGORY FILTE DOESNT
                        const match = (row.CashFlowDescription).toLowerCase().includes(searchInput)
                        if (match && (row.CashFlowCategory === payInFilterCategory)) {
                            //collect the totals of the filterd stuff
                            payInSearchedInputTotal += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the searched stuff
                            payInsearchedInputArray.push(cashFlows[a])
                        }
                        else if (match && (payInFilterCategory === "NoPayInCatFilter")) {
                            //collect the totals of the filterd stuff
                            payInSearchedInputTotal += parseFloat(row.CashFlowCashEquiv);
                            //THEN CREATE THE ARRAY FOR all the searched stuff
                            payInsearchedInputArray.push(cashFlows[a])
                        }
                        //get totals for advanced sheet
                        totalIncomePerRangeAdv = parseFloat(totalIncomePerRangeAdv) + (row.CashFlowCashEquiv)
                        //get the payOuts
                    }

                    //FOR ADVANCE
                    const match = (row.CashFlowDescription).toLowerCase().includes(advancedSearchInput)
                    if (match) {
                        //collect the totals of the filterd stuff
                        advSearchedInputTotal = parseFloat(advSearchedInputTotal) + (row.CashFlowCashEquiv);
                        //get the array of both payins and payouts searched
                        advSearchedInputArray.push(cashFlows[a])
                    }
                    else {
                        // advSearchedInputTotal = parseFloat(advSearchedInputTotal) + (row.CashFlowCashEquiv);
                        //get the array of both payins and payouts
                        allCashFlows.push(cashFlows[a])
                    }

                }
            }

            // console.log(index2 +'index2')
            //THE OPENING BALANCE FOR THE SELECTED RANGE
            const openingBalance = parseFloat(theBeforeIncome) - parseFloat(theBeforeExpenses)
            //THEN CREATE THE ARRAY FOR PAYINS, FOR THE CURRENT RANGE 'this is the one to go to the client side js'
            const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
            const endIndex = startIndex + parseInt(pageSize);
            const itemsToProcess = cashFlowArray.slice(startIndex, endIndex);
            const totalPages = Math.ceil(cashFlowArray.length / pageSize);
            const itemsToProcess1 = payOutcashFlowArray.slice(startIndex, endIndex);
            const totalPages1 = Math.ceil(payOutcashFlowArray.length / pageSize);
            const itemsToProcess2 = allCashFlows.slice(startIndex, endIndex);
            const totalPages2 = Math.ceil(allCashFlows.length / pageSize);
            const payOutSearchedItemsToProcess = payOutsearchedInputArray.slice(startIndex, endIndex);
            const payOutSearchedTotalPages = Math.ceil(payOutsearchedInputArray.length / pageSize);
            const payInSearchedItemsToProcess = payInsearchedInputArray.slice(startIndex, endIndex);
            const payInSearchedTotalPages = Math.ceil(payInsearchedInputArray.length / pageSize);
            const advSearchedItemsToProcess = advSearchedInputArray.slice(startIndex, endIndex);
            const advSearchedTotalPages = Math.ceil(advSearchedInputArray.length / pageSize);


            const data = {
                startDate: startDate,
                endDate: endDate,
                openingBalance: openingBalance,
                payOutSearchedInputTotal: payOutSearchedInputTotal,
                payInSearchedInputTotal: payInSearchedInputTotal,
                totalIncomePerRange: totalIncomePerRange,
                totalExpensesPerRange: totalExpensesPerRange,
                totalPages: totalPages,
                itemsToProcess: itemsToProcess, //THIS MUST ONLY CONTAINS THE INFORMATION OF WHATEVER THAT IS THE CURRENT PAGE BY THE USER
                totalPages1: totalPages1,
                itemsToProcess1: itemsToProcess1,
                itemsToProcess2: itemsToProcess2,
                allCashFlows: allCashFlows,
                totalPages2: totalPages2,
                payInSearchedItemsToProcess: payInSearchedItemsToProcess,
                payInSearchedTotalPages: payInSearchedTotalPages,
                payOutSearchedItemsToProcess: payOutSearchedItemsToProcess,
                payOutSearchedTotalPages: payOutSearchedTotalPages,
                totalExpensesPerRangeAdv: totalExpensesPerRangeAdv,
                totalIncomePerRangeAdv: totalIncomePerRangeAdv,
                advSearchedItemsToProcess: advSearchedItemsToProcess,
                advSearchedTotalPages: advSearchedTotalPages,


            };
            return { data };
        }
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }

}


export async function updateCashFlowDate(req, rowId, newDate, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });


            console.log('i am the  update date  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowDate: newDate
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//=================================================================================================
// export async function updateCashFlowType(req, rowId, typeSelected, sessionId) {
//     try {
//         const db = await connectDB(req, databaseName, signingCriteria, sessionId);
//         if (db) {
//             // Create the model with the specific connection
//             const myCashflowModel = CashflowModel(db);
//             cashFlows = await myCashflowModel.find()
//             // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
//             //and the settings are to be kept under local storage
//             cashFlows.sort((a, b) => {
//                 const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
//                 const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
//                 return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
//             });
//             console.log('i am the  update cashflow type  procedure  ');
//             await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
//                 $set: {
//                     CashFlowType: typeSelected,
//                     CashFlowCategory: 'suspense'
//                 }
//             }).then(result => {
//                 console.log(`${result.modifiedCount} document(s) updated.`);
//                 modifiedCount = result.modifiedCount
//                 if (modifiedCount !== 0) {
//                     amUpdated = true;
//                 }
//                 else if (modifiedCount === 0) {
//                     amUpdated = false;
//                 }
//             })

//             return { amUpdated };
//         }
//     } catch (err) {
//         console.error('Error connecting to MongoDB:', err);
//     }
// }
export async function updateCashFlowType(req, rowId, typeSelected, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            const myCategoriesModel = CashflowCategoriesModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her 
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow type  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowType: typeSelected,
                    CashFlowCategory: 'suspense'
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {

                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            //update the categories based on the type selected
            if (typeSelected === 'Pay in') {
                typeSelected = 'PayIn'
            }
            else if (typeSelected === 'Payout') {
                typeSelected = 'PayOut'
            }
            let categoryExist = await myCategoriesModel.findOne({ category: 'suspense', Balance: typeSelected });
            console.log(typeSelected)
            if (!categoryExist) {
                try {
                    const categoryEntry = new myCategoriesModel({ category: 'suspense', CategoryLimit: 0, CategoryLimitRange: '', Balance: typeSelected });
                    await categoryEntry.save()
                }
                catch (error) {
                    console.error("Error saving category", error);
                }
            }
            return { amUpdated };
        }

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
// //=====================================================================================================
export async function updateCashFlowShift(req, rowId, shift, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow shift  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowShift: shift
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//====================================================================================================
export async function updateCashFlowTax(req, rowId, taxDataToUpdate, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log(taxDataToUpdate)
            console.log(taxDataToUpdate.length)
            for (let v = 0; v < taxDataToUpdate.length; v++) {
                const tax = taxDataToUpdate[v];
                if (tax.taxName === 'vat') {

                    if (tax.VatStatus === 'N') {
                        console.log('i am the  update cashflow vat procedure  to false ' + tax.VatStatus + rowId);
                        await myCashflowModel.updateOne({ _id: ObjectId(rowId) },  // Find the document by its _id
                            {
                                $set: {
                                    "Tax.vat.VatStatus": tax.VatStatus,  // Update only the VatStatus field inside the Vat object
                                    "Tax.vat.VatAmount": tax.VatAmount, // Update only the taxStatus field inside the Vat object
                                }
                            }
                        ).then(result => {
                            console.log(`${result.modifiedCount} document(s) updated.`);
                            modifiedCount = result.modifiedCount;

                            if (modifiedCount !== 0) {
                                amUpdated = true;
                            } else {
                                amUpdated = false;
                            }
                        }).catch(err => {
                            console.error("Error updating the document:", err);
                        });
                    } else if (tax.VatStatus === 'Y') {
                        console.log('i am the  update cashflow vat procedure  to true ' + tax.VatStatus + rowId);

                        await myCashflowModel.updateOne({ _id: ObjectId(rowId) },  // Find the document by its _id
                            {
                                $set: {
                                    "Tax.vat.QRCode": tax.QRCode,  // Update only the taxStatusus field inside the Vat object
                                    "Tax.vat.DeviceId": tax.DeviceId, // Update only the taxStatus field inside the Vat object
                                    "Tax.vat.ZimraFsNo": tax.ZimraFsNo, // Update only the taxStatus field inside the Vat object
                                    "Tax.vat.VatNumber": tax.VatNumber, // Update only the taxStatus field inside the Vat object
                                    "Tax.vat.TinNumber": tax.TinNumber, // Update only the taxStatus field inside the Vat object
                                    "Tax.vat.VatAmount": tax.VatAmount, // Update only the taxStatus field inside the Vat object
                                    "Tax.vat.VatStatus": tax.VatStatus  // Update only the VatStatus field inside the Vat object
                                }
                            }
                        ).then(result => {
                            console.log(`${result.modifiedCount} document(s) updated.`);
                            modifiedCount = result.modifiedCount;

                            if (modifiedCount !== 0) {
                                amUpdated = true;
                            } else {
                                amUpdated = false;
                            }
                        }).catch(err => {
                            console.error("Error updating the document:", err);
                        });
                    }
                }
                else if (tax.taxName === 'ztf') {
                    if (tax.ZtfStatus === 'N') {
                        console.log('i am the  update cashflow ztf procedure FALSE ' + tax.ZtfStatus + rowId);

                        await myCashflowModel.updateOne({ _id: ObjectId(rowId) },  // Find the document by its _id
                            {
                                $set: {
                                    "Tax.ztf.ZtfStatus": tax.ZtfStatus,  // Update only the VatStatus field inside the Vat object
                                    "Tax.ztf.LevyAmount": tax.LevyAmount, // Update only the taxStatusus field inside the Vat object

                                }
                            }
                        ).then(result => {
                            console.log(`${result.modifiedCount} document(s) updated.`);
                            modifiedCount = result.modifiedCount;

                            if (modifiedCount !== 0) {
                                amUpdated = true;
                            } else {
                                amUpdated = false;
                            }
                        }).catch(err => {
                            console.error("Error updating the document:", err);
                        });
                    }
                    else if (tax.ZtfStatus === 'Y') {
                        console.log('i am the  update cashflow ztf procedure YES ' + tax.ZtfStatus + tax.LevyAmount);
                        await myCashflowModel.updateOne({ _id: ObjectId(rowId) },  // Find the document by its _id
                            {
                                $set: {
                                    "Tax.ztf.First": tax.First,  // Update only the taxStatusus field inside the Vat object
                                    "Tax.ztf.Second": tax.Second, // Update only the taxStatusus field inside the Vat object
                                    "Tax.ztf.LevyAmount": tax.LevyAmount, // Update only the taxStatusus field inside the Vat object
                                    "Tax.ztf.ZtfStatus": tax.ZtfStatus  // Update only the VatStatus field inside the Vat object
                                }
                            }
                        ).then(result => {
                            modifiedCount = result.modifiedCount;

                            if (modifiedCount !== 0) {
                                amUpdated = true;
                            } else {
                                amUpdated = false;
                            }
                        }).catch(err => {
                            console.error("Error updating the document:", err);
                        });
                    }
                }

            }
            return { amUpdated }
        }

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//=====================================================================================================
export async function updateCashFlowInvoice(req, rowId, InvoiceRef, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow InvoiceRef  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowInvoiceRef: InvoiceRef
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })

            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//=====================================================================================================
export async function updateCashFlowDescription(req, rowId, description, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            cashFlows = await myCashflowModel.find()
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow description  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowDescription: description
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//=====================================================================================================
export async function updateCashFlowCategory(req, rowId, newCategory, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow category  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: { CashFlowCategory: newCategory }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//====================================================================================================================
export async function updateCashFlowCurrency(req, rowId, newCurrency, cashEquivValue, newCashFlowRate1, sessionId) {
    try {

        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow description  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowCurrency: newCurrency,
                    CashFlowRate: newCashFlowRate1, CashFlowCashEquiv: cashEquivValue
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })

            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//=====================================================================================================
export async function updateCashFlowAmount(req, rowId, newAmount, cashEquivValue, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow amount  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowAmount: newAmount,
                    CashFlowCashEquiv: cashEquivValue
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })
            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//====================================================================================================================
export async function updateCashFlowRate(req, rowId, newRate, newCashFlowCashEquiv, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  update cashflow rate  procedure  ');
            await myCashflowModel.updateOne({ _id: ObjectId(rowId) }, {
                $set: {
                    CashFlowRate: newRate,
                    CashFlowCashEquiv: newCashFlowCashEquiv
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    amUpdated = true;
                }
                else if (modifiedCount === 0) {
                    amUpdated = false;
                }
            })

            return { amUpdated };
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//====================================================================================================================
export async function deleteCashFLow(req, checkedRowsId, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her
            //and the settings are to be kept under local storage
            cashFlows.sort((a, b) => {
                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
            });
            console.log('i am the  delete cashflow row  procedure  ');
            let deleteIds = [];

            for (let i = 0; i < checkedRowsId.length; i++) {
                const cashFlowId = checkedRowsId[i];//get the array of ids to delete
                deleteIds.push(ObjectId(cashFlowId));//make each id an object of mongo db id
            }
            await myCashflowModel.deleteMany({ _id: { $in: deleteIds } })
                .then(result => {
                    console.log(`${result.deletedCount} document(s) were deleted`);
                    if (result.deletedCount !== 0) {
                        amDeleted = true;
                    }
                    else if (result.deletedCount === 0) {
                        amDeleted = false;
                    }
                })

            return { amDeleted };
        }
    } catch (error) {
        console.error(error);
        return { status: 401, amDeleted: false };
    }
}
//============================================================================================================

export async function insertCashFlowData(req, itemsToProcess, checkTemplateStatus, sessionId) {
    let filteredItemsToProcess = [];
    let insertedDocuments = [];
    let isSaving = false;
    function dateValidation(csvDate) {
        let formattedDate = "";
        if (csvDate.length > 10) {
            const formattedDate1 = (csvDate).split(' ')
            if (formattedDate1) {
                let currentDate = formattedDate1[0]
                //NOW SPLIT THE DATE TO BE IN THE FORM DD/MM/YYYY
                let parts1
                parts1 = (currentDate).split("/");
                if (parts1[0].length === 4) {
                    parts1[0] = parts1[0][2] + parts1[0][3]
                    csvDate = parts1[1] + "/" + parts1[0] + "/" + parts1[2];
                }
                else {
                    csvDate = parts1[1] + "/" + parts1[0] + "/" + parts1[2];
                }
            }

        }
        csvDate = csvDate.replace(/[.,-]/g, "/");
        const parts = csvDate.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            //  const year = parseInt(parts[2]);
            let year = 0;
            //check if the length of the part year is ===4
            //if ===2 add the 20 pekutanga
            if (parts[2].length === 4) {
                year = parseInt(parts[2]);
            } else if (parts[2].length === 2) {
                year = "20" + parseInt(parts[2]);
            }
            else if (parts[2].length === 1) {
                year = '200' + parseInt(parts[2])
            }
            const currentYear = new Date().getFullYear();
            if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2015 && year <= currentYear) {
                // Date is valid, construct the formatted date string in "dd/mm/yyyy" format
                //.padStart(2, "0") ensures that the resulting string has a minimum length of 2 characters by padding the left side with zeros ("0") if necessary.
                formattedDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString()}`;
            }
        }
        return formattedDate;
    }
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
        console.log(checkTemplateStatus + 'my  fisrt status')
            
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);
            const myCurrenciesModel = CurrenciesModel(db);
            const myCategoriesModel = CashflowCategoriesModel(db);
            //get the base currency
            let baseCurrency = await myCurrenciesModel.findOne({ BASE_CURRENCY: 'Y' });
            let payInRowDataArray = []
            let payOutRowDataArray = []
            let categoriesToDb = []
            let payInRowData = {}
            let payOutRowData = {}
            let theRate = 0
            let correctFormattedDate = ''
            //declare variables that will store the variables
            let date = '', shift = '', type = '', invoiceNo = '', description = '', currency = '', category = '', amount = 0, rate = 0, id = ''
            //cretae a function that will populate the arrays to send to db
            async function populateArrays(date, shift, invoiceNo, description, currency, category, amount, rate) {
                // const shiftNumber = "Shift" + data.Shiftnumber + " " + data.POS;
                //calculate the relative rate to be used using the rate of the base currency and the selected currency
                if (rate !== 0) {
                    theRate = rate; // USE HIS RATE, WHEN HIS MATHEMATICS IS NOT BALANCING HE WILL COME BACK AT THIS
                }
                else if (rate === 0) {
                    //WHEN THE USER HAS NOT SPECIFIED THE CURRENCY AND THE RATE USED
                    theRate = baseCurrency.RATE;
                }
                //get the correct formatted date
                correctFormattedDate = dateValidation(date)
                currency = baseCurrency.Currency_Name
                if (type === 'Pay in') {
                    const relativeRate = theRate / baseCurrency.RATE;
                    const cashEquivValue = Number(parseFloat(amount) / parseFloat(relativeRate)).toFixed(2);
                    payInRowData = {
                        CashFlowDate: correctFormattedDate, //RE VALIDATE JUST TO BE SURE
                        CashFlowType: type,
                        CashFlowShift: shift,
                        CashFlowInvoiceRef: invoiceNo,
                        CashFlowDescription: description || 'Unknown PayIn',
                        CashFlowCategory: category,
                        CashFlowCurrency: currency,
                        CashFlowAmount: amount,
                        CashFlowRate: theRate,
                        CashFlowCashEquiv: cashEquivValue,
                    }
                    // Conditionally add the Tax field if checkTemplateStatus is 'loyverseHeaders'
                    if (checkTemplateStatus === 'loyverseHeaders' || (checkTemplateStatus === 'slyRetailHeaders' && id === '')) {
                        payInRowData.Tax = {
                            vat: { QRCode: "", DeviceId: 0, ZimraFsNo: '', VatNumber: 0, TinNumber: 0, VatAmount: 0, VatStatus: "N" }, ztf: { First: '', Second: '', LevyAmount: 0, ZtfStatus: "N" }
                        }
                    }
                    // Check if the shift exists
                    const existingPayInShift = await myCashflowModel.findOne({ CashFlowShift: shift, CashFlowType: "Pay in" });
                    if (existingPayInShift === null) {
                        // If the shift doesn't exist, insert the new record
                        payInRowDataArray.push(payInRowData);

                    }
                    // Check if the shift exists
                    const existingCategory = await myCategoriesModel.findOne({ category: category, Balance: "PayIn" });
                    if (!existingCategory) {
                        let payInCat = {}; //THE NEW DOCUMEN
                        payInCat["category"] = category;
                        payInCat["CategoryLimit"] = 0;
                        payInCat["CategoryLimitRange"] = "";
                        payInCat["Balance"] = "PayIn";
                        // If the category doesn't exist, insert the new record
                        await saveCategoryToDb(payInCat)
                    }

                }
                else if (type === 'Payout') {
                    const relativeRate = theRate / baseCurrency.RATE;
                    const cashEquivValue = Number(parseFloat(amount) / parseFloat(relativeRate)).toFixed(2);
                    payOutRowData = {
                        CashFlowDate: correctFormattedDate, //RE VALIDATE JUST TO BE SURE
                        CashFlowType: type,
                        CashFlowShift: shift,
                        CashFlowInvoiceRef: invoiceNo,
                        CashFlowDescription: description || 'Unknown PayOut',
                        CashFlowCategory: category,
                        CashFlowCurrency: currency,
                        CashFlowAmount: amount,
                        CashFlowRate: theRate,
                        CashFlowCashEquiv: cashEquivValue
                    }
                    // Conditionally add the Tax field if checkTemplateStatus is 'loyverseHeaders'
                    if (checkTemplateStatus === 'loyverseHeaders' || (checkTemplateStatus === 'slyRetailHeaders' && id === '')) {
                        payOutRowData.Tax = {
                            vat: { QRCode: "", DeviceId: 0, ZimraFsNo: '', VatNumber: 0, TinNumber: 0, VatAmount: 0, VatStatus: "N" }, ztf: { First: '', Second: '', LevyAmount: 0, ZtfStatus: "N" }
                        }
                    }
                    // Check if the shift exists
                    const existingPayOutShift = await myCashflowModel.findOne({ CashFlowShift: shift, CashFlowType: "Payout" });
                    if (existingPayOutShift === null) {
                        // If the shift doesn't exist, insert the new record
                        payOutRowDataArray.push(payOutRowData)
                    }
                    // Check if the shift exists
                    const existingCategory = await myCategoriesModel.findOne({ category: category, Balance: "PayOut" });
                    if (!existingCategory) {
                        let payOutCat = {}; //THE NEW DOCUMEN
                        payOutCat["category"] = category;
                        payOutCat["CategoryLimit"] = 0;
                        payOutCat["CategoryLimitRange"] = "";
                        payOutCat["Balance"] = "PayOut";
                        // If the category doesn't exist, insert the new record
                        await saveCategoryToDb(payOutCat)

                    }
                }

            }
            for (let i = 0; i < itemsToProcess.length; i++) {
                const data = itemsToProcess[i];
                if (checkTemplateStatus === 'loyverseHeaders') {
                    date = data.Date; shift = "Shift" + data.Shiftnumber + " " + data.POS;
                    type = data.Type; invoiceNo = ''; currency = ''; category = 'suspense';
                    description = data.Comment;
                    amount = data.Amount; rate = 0
                    //call the function that populates the arrays
                    await populateArrays(date, shift, invoiceNo, description, currency, category, amount, rate)
                }
                if (checkTemplateStatus === 'slyRetailHeaders') {
                    if (data.Id === '') {
                        console.log('array length'+itemsToProcess.length)
                        // id = data.Id
                        date = data.Date; shift = data.ShiftNo; type = data.Type; invoiceNo = data.InvoiceRef;
                        description = data.Description; currency = data.Currency; category = data.Category;
                        amount = data.Amount; rate = data.Rate
                        await populateArrays(date, shift, invoiceNo, description, currency, category, amount, rate)

                    }
                    else if (data.Id !== '') {
                        try {
                            // Check if the shift exists
                            const existingCategory = await myCategoriesModel.findOne({ category: data.Category });
                            if (!existingCategory) {
                                let payOutCat = {}; //THE NEW DOCUMEN
                                payOutCat["category"] = data.Category;
                                payOutCat["CategoryLimit"] = 0;
                                payOutCat["CategoryLimitRange"] = "";
                                payOutCat["Balance"] = "PayOut";
                                // If the category doesn't exist, insert the new record
                                await saveCategoryToDb(payOutCat)
                            }
                            const relativeRate = data.Rate / baseCurrency.RATE;
                            const cashEquivValue = Number(parseFloat(data.Amount) / parseFloat(relativeRate)).toFixed(2);
                            // Update the existing document
                            const result = await myCashflowModel.updateOne(
                                { _id: ObjectId(data.Id) }, // Filter by _id
                                {
                                    $set: {
                                        CashFlowDate: data.Date,
                                        CashFlowShift: data.ShiftNo,
                                        CashFlowInvoiceRef: data.InvoiceRef,
                                        CashFlowDescription: data.Description,
                                        CashFlowCategory: data.Category,
                                        CashFlowCurrency: data.Currency,
                                        CashFlowAmount: data.Amount,
                                        CashFlowRate: data.Rate,
                                        CashFlowCashEquiv: cashEquivValue,
                                        CashFlowType: data.Type,
                                    },
                                }
                            );

                            // Check if the update was successful
                            if (result.modifiedCount > 0) {
                                isSaving = true;
                                insertedDocuments.push(result.modifiedCount); // Store the count of updated documents
                            } else {
                                isSaving = false;
                            }
                        } catch (error) {
                            console.error('Error updating document:', error);
                            isSaving = false;
                        }
                    }
                }
            }
            const operations = [];

            // Insert Pay In Data using bulkWrite
            payInRowDataArray.forEach(item => {
                operations.push({
                    insertOne: {
                        document: item
                    }
                });
            });

            // Insert Pay Out Data using bulkWrite
            payOutRowDataArray.forEach(item => {
                operations.push({
                    insertOne: {
                        document: item
                    }
                });
            });

            // Perform the bulk insert operation for both Pay In and Pay Out data
            if (operations.length > 0) {
                const result = await myCashflowModel.bulkWrite(operations);
                isSaving = true
                // If you need the actual inserted documents, you can retrieve them from the result by using their IDs
                // insertedDocuments = await myCashflowModel.find();
                // Extract the IDs of the inserted documents
                const insertedIds = Object.values(result.insertedIds);

                // Retrieve the inserted documents using their IDs
                insertedDocuments = await myCashflowModel.find({ _id: { $in: insertedIds } });

            } else {
                // return { isSaving: false, insertedDocuments: [] };
            }
            //then save any new categories
            async function saveCategoryToDb(categoryData) {
                try {
                    const categoryEntry = new myCategoriesModel(categoryData);
                    try {
                        const result = await categoryEntry.save();
                        if (result) {
                            isSaving = true;
                            insertedCategories.push(result); // Store the successfully inserted document
                        }
                    } catch (saveError) {
                        console.error('Error saving cash flow entry:', saveError);
                        isSaving = false;
                    }

                } catch (error) {
                    console.error('Error inserting documents:', error);
                    // return { isSaving: false };
                }
            }

            return { isSaving, insertedDocuments, insertedCategories }
        }
    } catch (error) {
        console.error('Error inserting documents:', error);
        return { isSaving: false, insertedDocuments: [] };
    }
}

//====================================================================================================================
export async function saveCashFlowData(req, itemsToProcess, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);

            for (let a = 0; a < itemsToProcess.length; a++) {
                const item = itemsToProcess[a];
                const cashflowentry = new myCashflowModel(item);
                try {
                    const result = await cashflowentry.save();
                    if (result) {
                        isSaving = true;
                        insertedCategories.push(result); // Store the successfully inserted document
                    }
                } catch (saveError) {
                    console.error('Error saving cash flow entry:', saveError);
                    isSaving = false;
                }
            }

            return { isSaving, insertedDocuments };
        }
    } catch (error) {
        console.error('Error inserting documents:', error);
        return { amUpdated: false, updatedDocuments: [] };
    }
}
//====================================================================================================================
export async function updateCashFlowData(req, itemsToProcess, sessionId) {
    try {
        const db = await connectDB(req, databaseName, signingCriteria, sessionId);
        if (db) {
            // Create the model with the specific connection
            const myCashflowModel = CashflowModel(db);

            for (let a = 0; a < itemsToProcess.length; a++) {
                const item = itemsToProcess[a];
                // Update the document in the database
                const result = await myCashflowModel.updateOne({ _id: ObjectId(item._id) }, {
                    $set: {
                        CashFlowDate: item.CashFlowDate, CashFlowShift: item.CashFlowShift, Vat: item.Vat,
                        CashFlowInvoiceRef: item.CashFlowInvoiceRef, CashFlowDescription: item.CashFlowDescription,
                        CashFlowCategory: item.CashFlowCategory, CashFlowCurrency: item.CashFlowCurrency, CashFlowAmount: item.CashFlowAmount,
                        CashFlowRate: item.CashFlowRate, CashFlowCashEquiv: item.CashFlowCashEquiv, CashFlowType: item.CashFlowType
                    }
                })
                if (result.modifiedCount > 0) {
                    amUpdated = true;
                    updatedDocuments.push(item); // Store the successfully updated document
                } else {
                    amUpdated = false;
                }
            }


            return { amUpdated, updatedDocuments };
        }
    } catch (error) {
        console.error('Error inserting documents:', error);
        return { amUpdated: false, updatedDocuments: [] };
    }
}
