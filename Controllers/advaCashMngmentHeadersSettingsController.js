import { advaHeadersModel } from '../Schemas/slyretailAdvCashMngmntHeadersSettingsSchemas.js';
let advancedHeaderStatus = []
let isSaving = false;
let modifiedCount = ""
export async function getadvancedHeaderStatusArray(req) {
    try {
      const { models } = req.session; //get the models in the session storage
                 // Access the models from the session
       if (!models) {
      throw new Error('Session models not found');
    }
        const {advHeadersModel} = models;
      const advancedHeaderStatus = await advHeadersModel.find();
        return { advancedHeaderStatus };
      
    } catch (err) {
        console.error('Error fetching status:', err);
    }
}
export async function saveHeaderStatusAdv(req,headerNamefcb, headerisDisplayed) {
        //THERE ARE OTHER HEADERS LIKE VAT THAT SHOULD BE OPENED AFTER SUBSCRIPTIONS, ALL THOSE LOGIC WILL BE MANAGED HERE
         try {
      const { models } = req.session; //get the models in the session storage
                 // Access the models from the session
      if (!models) {
      throw new Error('Session models not found');
    }
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
    catch (error) {
        console.error(error)
    }
}
