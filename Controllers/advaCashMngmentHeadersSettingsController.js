import { advaHeadersModel } from '../Schemas/slyretailAdvCashMngmntHeadersSettingsSchemas.js';
import { connectDB, myDatabase,signCriteria } from '../Schemas/slyretailDbConfig.js';
let advancedHeaderStatus = []
let isSaving = false;
let modifiedCount = ""
export async function getadvancedHeaderStatusArray(req) {
    try {
      const { models } = req.session; //get the models in the session storage
                 // Access the models from the session
        if (models) {
        const {advHeadersModel} = models;
      const advancedHeaderStatus = await advHeadersModel.find();
        return { advancedHeaderStatus };
        }
    } catch (err) {
        console.error('Error fetching status:', err);
    }
}
export async function saveHeaderStatusAdv(req,headerNamefcb, headerisDisplayed) {
    // process the database connection request
    try {
        //THERE ARE OTHER HEADERS LIKE VAT THAT SHOULD BE OPENED AFTER SUBSCRIPTIONS, ALL THOSE LOGIC WILL BE MANAGED HERE
         try {
      const { models } = req.session; //get the models in the session storage
                 // Access the models from the session
        if (models) {
        const {advHeadersModel} = models;
            await advHeadersModel.updateOne({ HeaderName: headerNamefcb }, {
            $set: {
                isDisplayed: headerisDisplayed
            }
        }).then(result => {
            console.log(`${result.modifiedCount} document(s) updated.`);
            modifiedCount = result.modifiedCount
            if ( modifiedCount !== 0) {
                isSaving = true;
            }
           else if ( modifiedCount === 0) {
                isSaving = false;
            }
        })
        return { isSaving };
        }
            
    }
    catch (error) {
        console.error(error)
    }
}
