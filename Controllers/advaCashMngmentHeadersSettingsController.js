import { advaHeadersModel } from '../Schemas/slyretailAdvCashMngmntHeadersSettingsSchemas.js';
import { connectDB } from '../Schemas/slyretailDbConfig.js';
let advancedHeaderStatus = []
let isSaving = false;
let modifiedCount = ""
let databaseName = ""
let signingCriteria = ""

export async function getadvancedHeaderStatusArray(req, sessionId) {
    const db = await connectDB(req, databaseName, signingCriteria, sessionId);
    if (db) {
        // Create the model with the specific connection
        const myaccountingPeriodModelModel = advaHeadersModel(db);
        try {
            advancedHeaderStatus = await myaccountingPeriodModelModel.find()
            return { advancedHeaderStatus };
        } catch (err) {
            console.error('Error fetching status:', err);
        }
    }

}
export async function saveHeaderStatusAdv(req, headerNamefcb, headerisDisplayed, sessionId) {
    // process the database connection request
    const db = await connectDB(req, databaseName, signingCriteria, sessionId);
    if (db) {
        // Create the model with the specific connection
        const myaccountingPeriodModelModel = advaHeadersModel(db);
        try {
            //THERE ARE OTHER HEADERS LIKE VAT THAT SHOULD BE OPENED AFTER SUBSCRIPTIONS, ALL THOSE LOGIC WILL BE MANAGED HERE
            await myaccountingPeriodModelModel.updateOne({ HeaderName: headerNamefcb }, {
                $set: {
                    isDisplayed: headerisDisplayed
                }
            }).then(result => {
                console.log(`${result.modifiedCount} document(s) updated.`);
                modifiedCount = result.modifiedCount
                if (modifiedCount !== 0) {
                    isSaving = true;
                }
                else if (modifiedCount === 0) {
                    isSaving = false;
                }
            })
            return { isSaving };
        }
        catch (error) {
            console.error(error)
        }
    }
}
