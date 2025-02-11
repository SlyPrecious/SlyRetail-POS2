import { CashflowModel } from '../Schemas/slyretailCashflowSchemas.js';
import { connectDB, myDatabase,signCriteria } from '../Schemas/slyretailDbConfig.js';
let cashFlows = [] //SO THAT IT WILL BE ENABLED TO BE SORTED
let cashFlowArray = []
let allCashFlows = []

export async function exportingArray(startDate, endDate, pageSize, page, payInFilterCategory, payOutFilterCategory, exportingCriteria, advExportingCriteria) {
    try {
           const db = await connectDB(myDatabase,signCriteria);
         if (db) {
        const myCashflowModel = CashflowModel(db);
          cashFlows  = await myCashflowModel.find()
        // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her and the settings to be kept under local storage
        cashFlows.sort((a, b) => {
            const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
            const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        for (let a = 0; a < cashFlows.length; a++) { //first loop for the purpose of PAYINs AND OUTs totals
            //DURING THIS LOOP, ONE CAN TAKE ADVANTAGE AND CALCULATE THE OPENING BAL FOR BOTH THE PAYINs AND OUTs
            const row = cashFlows[a];
            const date = row.CashFlowDate;
            const parts = date.split("/");
            const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
            const formattedDates2 = new Date(formattedDate);
            if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
                if (row.CashFlowType === 'Payout') {
                    //CODE FOR CALCULATING THE TOTAL PAYOUTs
                    //if there is a category filter, update the totals per category
                    if (payOutFilterCategory === "NoPayOutCatFilter") {
                        //THEN CREATE THE ARRAY FOR all the PAYouts
                        cashFlowArray.push(cashFlows[a]) //'IF THIS CODE IS THE SAME THEN WHAT IS THE REASON FOR THE IF CONDITION
                    } else if (row.CashFlowCategory === payOutFilterCategory) {
                        //THEN CREATE THE ARRAY FOR all the PAYouts
                        cashFlowArray.push(cashFlows[a])//'IF THIS CODE IS THE SAME THEN WHAT IS THE REASON FOR THE IF CONDITION
                    }
                }

                if (row.CashFlowType === 'Pay in') {
                    //CODE FOR CALCULATING THE TOTAL PAYINs on a condition
                    //if there is a category filter, update the totals per category
                    if (payInFilterCategory === "NoPayInCatFilter") {
                        //THEN CREATE THE ARRAY FOR all the PAYINs
                        cashFlowArray.push(cashFlows[a])//'IF THIS CODE IS THE SAME THEN WHAT IS THE REASON FOR THE IF CONDITION
                    } else if (row.CashFlowCategory === payInFilterCategory) {
                        //THEN CREATE THE ARRAY FOR all the PAYINs
                        cashFlowArray.push(cashFlows[a])//'IF THIS CODE IS THE SAME THEN WHAT IS THE REASON FOR THE IF CONDITION
                    }
                }
                //get the full array of payins and payouts
                allCashFlows.push(cashFlows[a])
            }
        }
        //THEN CREATE THE ARRAY FOR PAYINS, FOR THE CURRENT RANGE 'this is the one to go to the client side js'
        let itemsToProcess = []
        if (exportingCriteria === "ExportSelected") {
        }//when the user wants to export the current page (STILL REQUIRE AND UPGRADE)
        else if (exportingCriteria === 'FullExport') {
            itemsToProcess = cashFlowArray
        }
        else if (exportingCriteria === 'ExportCurrentPage') {
            const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
            const endIndex = startIndex + parseInt(pageSize);
            itemsToProcess = cashFlowArray.slice(startIndex, endIndex);
        }
        else if (advExportingCriteria === 'FullExport') {
            itemsToProcess = allCashFlows
        }
        const data = {
            startDate: startDate,
            endDate: endDate,
            itemsToProcess: itemsToProcess //THIS MUST ONLY CONTAINS THE INFORMATION OF WHATEVER THAT IS THE CURRENT PAGE BY THE USER
        };
        return { data, cashFlows };
         }
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
//==============================================================================================================================
export async function arrayForImport() {
    try {
         const db = await connectDB(myDatabase,signCriteria);
         if (db) {
        const myCashflowModel = CashflowModel(db);
          cashFlows  = await myCashflowModel.find()
        // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her and the settings to be kept under local storage
        cashFlows.sort((a, b) => {
            const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
            const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });
        return {cashFlows };
         }
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
