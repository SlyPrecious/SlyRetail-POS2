import { payInHeadersModel } from '../Schemas/slyretailPayInHeadersSettingsSchemas.js';
let payInHeaderStatus = []
let isSaving = false;
let modifiedCount = ""
export async function getpayInHeaderStatusArray() {
    try {
        const payInHeaderStatus = await payInHeadersModel.find(); // Fetch data
        // console.log('Fetched payInHeaderStatus:', payInHeaderStatus); // Check what you're fetching
        return { payInHeaderStatus }; // Return as an object
    } catch (err) {
        console.error('Error fetching status:', err);
        throw new Error('Failed to fetch pay in header status'); // Ensure this is handled in the caller
    }
}

export async function saveHeaderStatusPayIn(headerNamefcb, headerisDisplayed) {
    // process the database connection request
    try {
        //THERE ARE OTHER HEADERS LIKE VAT THAT SHOULD BE OPENED AFTER SUBSCRIPTIONS, ALL THOSE LOGIC WILL BE MANAGED HERE
        await payInHeadersModel.updateOne({ HeaderName: headerNamefcb }, {
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
