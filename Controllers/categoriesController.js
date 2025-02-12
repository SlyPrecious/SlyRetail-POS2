import { ObjectId } from 'mongodb';
import { CashflowCategoriesModel } from '../Schemas/slyretailCategoriesSchemas.js';
import { CashflowModel } from '../Schemas/slyretailCashflowSchemas.js';

let isSaving = false
let insertedCategories = []
let cashFlows = []
let isocode = ''
let oldBaseCurrRate = ''
let isUpdated = ''
let amDeleted = ''
export async function getCategoryTotals(req, startDate, endDate, payOutSearchInput, searchInput, pageSize, page, theCategoryName) {
  try {
    const { models } = req.session; // Get the models in the session storage
    if (!models) {
      throw new Error('Session models not found');
    }

    // Access the models from the session
    const { categoriesModel, cashflowModel } = models;
    const cashFlowCat = await categoriesModel.find();
    const cashFlowArray = await cashflowModel.find();

    let payOutCatArray = [];
    let payOutSearchedCatArray = [];
    let allPayOutCatTotals = 0;
    let payOutSearchedInputTotals = 0;
    let isMatched = false;
    let payInCatArray = [];
    let payInSearchedCatArray = [];
    let allPayInCatTotals = 0;
    let totalPayOutsPerCat = 0;
    let totalPayInsPerCat = 0;
    let payInSearchedInputTotals = 0;
    let payInToProcess = [];
    let payOutToProcess = [];

    for (let a = 0; a < cashFlowCat.length; a++) {
      const cat = cashFlowCat[a];
      if (cat.Balance === 'PayOut') {
        let payOutCat = {};
        let totalPayOutsCatRange = 0;
        let payOutSearchedInputTotal = 0;

        for (let b = 0; b < cashFlowArray.length; b++) {
          const row = cashFlowArray[b];
          const date = row.CashFlowDate;
          const parts = date.split("/");
          const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
          const formattedDates2 = new Date(formattedDate);

          if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
            if (row.CashFlowType === 'Payout') {
              if (cashFlowCat[a].category === row.CashFlowCategory) {
                totalPayOutsCatRange = parseFloat(totalPayOutsCatRange) + parseFloat(row.CashFlowCashEquiv);
              }

              const match = (row.CashFlowDescription).toLowerCase().includes(payOutSearchInput);
              if ((cashFlowCat[a].category === row.CashFlowCategory) && match) {
                isMatched = true;
                payOutSearchedInputTotal = parseFloat(payOutSearchedInputTotal) + parseFloat(row.CashFlowCashEquiv);
              }
            }
          }
        }

        if (isMatched) {
          payOutCat[cat.category] = parseFloat(payOutSearchedInputTotal);
          payOutSearchedCatArray.push(payOutCat);
          payOutSearchedInputTotals = parseFloat(payOutSearchedInputTotals) + parseFloat(payOutSearchedInputTotal);
        } else {
          payOutCat[cat.category] = parseFloat(totalPayOutsCatRange);
          payOutCatArray.push(payOutCat);
          allPayOutCatTotals = parseFloat(allPayOutCatTotals) + parseFloat(totalPayOutsCatRange);
        }
      } else if (cat.Balance === 'PayIn') {
        let payInCat = {};
        let totalPayInsCatRange = 0;
        let payInSearchedInputTotal = 0;

        for (let b = 0; b < cashFlowArray.length; b++) {
          const row = cashFlowArray[b];
          const date = row.CashFlowDate;
          const parts = date.split("/");
          const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
          const formattedDates2 = new Date(formattedDate);

          if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
            if (row.CashFlowType === 'Pay in') {
              if (cat.category === row.CashFlowCategory) {
                totalPayInsCatRange = parseFloat(totalPayInsCatRange) + parseFloat(row.CashFlowCashEquiv);
              }

              const match = (row.CashFlowDescription).toLowerCase().includes(searchInput);
              if ((cat.category === row.CashFlowCategory) && match) {
                isMatched = true;
                payInSearchedInputTotal = parseFloat(payInSearchedInputTotal) + parseFloat(row.CashFlowCashEquiv);
              }
            }
          }
        }

        if (isMatched) {
          payInCat[cat.category] = parseFloat(payInSearchedInputTotal);
          payInSearchedCatArray.push(payInCat);
          payInSearchedInputTotals = parseFloat(payInSearchedInputTotals) + parseFloat(payInSearchedInputTotal);
        } else {
          payInCat[cat.category] = parseFloat(totalPayInsCatRange);
          payInCatArray.push(payInCat);
          allPayInCatTotals = parseFloat(allPayInCatTotals) + parseFloat(totalPayInsCatRange);
        }
      }
    }

    for (let b = 0; b < cashFlowArray.length; b++) {
      const row = cashFlowArray[b];
      const date = row.CashFlowDate;
      const parts = date.split("/");
      const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
      const formattedDates2 = new Date(formattedDate);

      if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
        if (row.CashFlowType === 'Payout') {
          if (theCategoryName === row.CashFlowCategory) {
            totalPayOutsPerCat = parseFloat(totalPayOutsPerCat) + parseFloat(row.CashFlowCashEquiv);
          }
          payOutToProcess.push(row);
        }
        if (row.CashFlowType === 'Pay in') {
          if (theCategoryName === row.CashFlowCategory) {
            totalPayInsPerCat = parseFloat(totalPayInsPerCat) + parseFloat(row.CashFlowCashEquiv);
          }
          payInToProcess.push(row);
        }
      }
    }

    // Sort the items
    payOutToProcess.sort((item1, item2) => {
      if (item1.CashFlowCategory === theCategoryName) return -1;
      if (item2.CashFlowCategory === theCategoryName) return 1;
      if (item1.CashFlowCategory === "suspense") return -1;
      if (item2.CashFlowCategory === "suspense") return 1;
      return item1.CashFlowCategory.localeCompare(item2.CashFlowCategory);
    });

    payInToProcess.sort((item1, item2) => {
      if (item1.CashFlowCategory === theCategoryName) return -1;
      if (item2.CashFlowCategory === theCategoryName) return 1;
      if (item1.CashFlowCategory === "suspense") return -1;
      if (item2.CashFlowCategory === "suspense") return 1;
      return item1.CashFlowCategory.localeCompare(item2.CashFlowCategory);
    });

    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);
    const payInsToProcess = payInToProcess.slice(startIndex, endIndex);
    const payInTotalPages = Math.ceil(payInToProcess.length / pageSize);
    const payOutsToProcess = payOutToProcess.slice(startIndex, endIndex);
    const payOutTotalPages = Math.ceil(payOutToProcess.length / pageSize);

    const data = {
      allPayOutCatTotals: allPayOutCatTotals,
      payOutSearchedInputTotals: payOutSearchedInputTotals,
      payOutCatArray: payOutCatArray,
      payOutSearchedCatArray: payOutSearchedCatArray,
      allPayInCatTotals: allPayInCatTotals,
      payInSearchedInputTotals: payInSearchedInputTotals,
      payInSearchedCatArray: payInSearchedCatArray,
      payInCatArray: payInCatArray,
      payInsToProcess: payInsToProcess,
      payInTotalPages: payInTotalPages,
      payOutsToProcess: payOutsToProcess,
      payOutTotalPages: payOutTotalPages,
      totalPayInsPerCat: totalPayInsPerCat,
      totalPayOutsPerCat: totalPayOutsPerCat,
    };

    return { data };
  } catch (err) {
    console.error('Error fetching incomeCategories:', err);
    throw new Error('Failed to fetch income categories');
  }
}

// Other functions (getCategories, updateAssignedCategories, insertCategory, updateCategoryRow, deleteCategory) remain unchanged...
//========================================================================================================
export async function getCategories(req) {
  try {
         const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {categoriesModel} = models;
    const allCashFlowCategories = await categoriesModel.find()
    return {allCashFlowCategories };
        }      
  }
  catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

//=====================================================================================================
export async function updateAssignedCategories(req,assignedItemsArray, theCategoryName) {
  try {
       const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {categoriesModel,cashflowModel} = models;
    const cashFlowCat = await categoriesModel.find();
    const cashFlowArray = await cashflowModel.find();
    
    for (let i = 0; i < assignedItemsArray.length; i++) {
      const cashFlowDataId = assignedItemsArray[i];
      try {
        await cashflowModel.updateOne({ _id: ObjectId(cashFlowDataId) }, {
          $set: {
            CashFlowCategory: theCategoryName
          }
        })
          .then(result => {
            console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
            isUpdated = true;
          })
          .catch(error => console.error(error));
      } catch (saveError) {
        console.error('Error saving cash flow entry:', saveError);
        isUpdated = false;
      }
    }
    return { isUpdated };
  }
  }catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

//=====================================================================================================
export async function insertCategory(req,categoryToDb) {

  try {
         const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {categoriesModel,cashflowModel} = models;
    const cashFlowCat = await categoriesModel.find();
    const cashFlowArray = await cashflowModel.find();
    for (let a = 0; a < categoryToDb.length; a++) {
      const item = categoryToDb[a];

      const categoryEntry = new categoriesModel(item);
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

    }
    // console.log(isSaving + 'co sly')
    return { isSaving, insertedCategories };
  }

  } catch (error) {
    console.error('Error inserting documents:', error);
    return { isSaving: false };
  }


}
//=====================================================================================================
export async function updateCategoryRow(req,categoryId, oldCatName, categoryName, categoryLimit, limitRange, balanceValue) {
  try {
           const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {categoriesModel,cashflowModel} = models;
    const cashFlowCat = await categoriesModel.find();
    const cashFlowArray = await cashflowModel.find();
    ///loop in the cashflow array updating the category with the new category edited
    for (let i = 0; i < cashFlowArray.length; i++) {
      const cashFlowData = cashFlowArray[i];
      if (cashFlowData.CashFlowCategory === oldCatName.replace(/ /g, "_").toLowerCase()) {
        try {
          // cashFlowData.CashFlowCategory = categoryName
          await cashflowModel.updateOne({ _id: ObjectId(cashFlowData._id) }, {
            $set: {
              CashFlowCategory: categoryName
            }
          })
            .then(result => {
              console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
              isUpdated = true;
            })
            .catch(error => console.error(error));
        } catch (saveError) {
          console.error('Error saving cash flow entry:', saveError);
          isUpdated = false;
        }

      }

    }
    // console.log(cashFlowArray)
    //CHECK IF THE IS TO BE DELETED IS EITHER IN EXPENSE CATEGORY OR THE INCOME CATEGORY
    const cateId = await categoriesModel.findOne({ _id: ObjectId(categoryId) });
    if (cateId) {
      // update the  category
      try {
        await categoriesModel.updateOne({ _id: ObjectId(categoryId) }, {
          $set: {
            category: categoryName,
            CategoryLimit: Number(categoryLimit),
            CategoryLimitRange: limitRange,
            Balance: balanceValue,
          }

        })
          .then(result => {
            console.log(`${result.matchedCount} document(s) matched the filter criteria.`);
            console.log(`${result.modifiedCount} document(s) were updated with the new field value.`);
            if (result.modifiedCount !== 0) {
              isUpdated = true;
            }
            else if (result.modifiedCount === 0) {
              isUpdated = false;
            }
          })
          .catch(error => console.error(error));
      } catch (saveError) {
        console.error('Error saving cash flow entry:', saveError);
        isUpdated = false;
      }
    }
    return { isUpdated };
  }

  } catch (error) {
    console.error(error);
    return { status: 401, amDeleted: false };
  }
}
//=========================================================================================================================
export async function deleteCategory(req,checkedRowsId) {
  let incDeleteId = []
  let expDeleteId = []
  let cashFlowId = []
  try {
     const { models } = req.session; //get the models in the session storage
if (models) {
    // Access the models from the session
const {categoriesModel,cashflowModel} = models;
    const cashFlowCat = await categoriesModel.find();
    cashFlows = await cashflowModel.find()
    
    // Always Sort the array by 'income date' in ascending order, when the user want to change this it is up to her 
    //and the settings are to be kept under local storage
    cashFlows.sort((a, b) => {
      const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
      const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });
    for (let i = 0; i < checkedRowsId.length; i++) {
      const catId = checkedRowsId[i];
      const catDataId = Object.keys(catId)[0]
      const catDataName = catId[catDataId]
      for (let i = 0; i < cashFlows.length; i++) {
        if (cashFlows[i].CashFlowCategory === catDataName) {
          //change the category name to suspense
          cashFlows[i].CashFlowCategory = 'suspense'
          cashFlowId.push(ObjectId(cashFlows[i]._id))
        }
      }
      const checkId = await categoriesModel.findOne({ _id: catDataId });
      if (checkId) {
        expDeleteId.push(ObjectId(catDataId))
      }

    }
    if (cashFlowId.length > 0) {
      await cashflowModel.updateMany({ _id: { $in: cashFlowId } }, {
        $set: {
          CashFlowCategory: 'suspense'
        }
      })

    }
    if (expDeleteId.length > 0) {
      await categoriesModel.deleteMany({ _id: { $in: expDeleteId } })
        .then(result => {
          console.log(`${result.deletedCount} document(s) were deleted`);
          if (result.deletedCount !== 0) {
            amDeleted = true;

          }
        })
      //also create one in the respective category collections  payouts
      //check if suspense already exist
      const suspenseExist = await categoriesModel.findOne({ category: 'suspense' });
      if (!suspenseExist) {
        await CashflowCategoriesModel.insertOne({
          category: 'suspense',
          CategoryLimit: 0,
          CategoryLimitRange: '',
          Balance: 'PayOut',

        })
          .then(result => {
            console.log(`${result.insertedCount} document(s) inserted.`);
          })
      }

    }

    return { amDeleted };
  } 

  } catch (error) {
    console.error(error);
    return { status: 401, amDeleted: false };
  }
}
//====================================================================================================================
