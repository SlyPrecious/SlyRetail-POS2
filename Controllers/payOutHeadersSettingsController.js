import { payOutHeadersModel } from '../Schemas/slyretailPayOutHeadersSettingsSchemas.js';
let payOutHeaderStatus = []
let isSaving = false;
let modifiedCount = ""
export async function getpayOutHeaderStatusArray() {
    try {
        payOutHeaderStatus = await payOutHeadersModel.find()
        return { payOutHeaderStatus };
    } catch (err) {
        console.error('Error fetching status:', err);
    }
}
export async function saveHeaderStatusPayOut(headerNamefcb, headerisDisplayed) {
    // process the database connection request
    try {
        //THERE ARE OTHER HEADERS LIKE VAT THAT SHOULD BE OPENED AFTER SUBSCRIPTIONS, ALL THOSE LOGIC WILL BE MANAGED HERE
        await payOutHeadersModel.updateOne({ HeaderName: headerNamefcb }, {
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
