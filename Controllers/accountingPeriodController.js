import { accountingPeriodModel } from '../Schemas/slyretailAccountingPeriodSettingsSchemas.js';
import { ObjectId } from 'mongodb';
// import { connectDB, myDatabase,signCriteria} from '../Schemas/slyretailDbConfig.js';

let isModified = false

export async function getAccountingPeriodDetails(req) {
  const { models } = req.session; //get the models in the session storage
 
    try {
    if (!models) {
      throw new Error('Session models not found');
    }
        // Access the models from the session
        const { accountingPeriodModel} = models;
      // const accountingPeriodModel = db.model('Accountingperiod', AccountingPeriodSettingsSchema);
      // Create the model with the specific connection
      const details = await accountingPeriodModel.find();

      return { details };     
    } catch (err) {
      console.error('Error fetching accounting details:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
}
export async function updateAccountingPeriod(req,id, startDate) {
  // Parse the startDate to a Date object
  try {
    // Step 1: Create a connection
  const { models } = req.session; //get the models in the session storage
 if (!models) {
      throw new Error('Session models not found');
    }
        // Access the models from the session
        const {accountingPeriodModel} = models;
      const start = new Date(startDate);
      // Calculate end date as December 31 of the same year
      // const endDate = new Date(start.getFullYear(), 11, 31); // Month is 0-indexed
   
      const result = await accountingPeriodModel.updateOne(
        // const result = await accountingPeriodModel.updateOne(
        { _id: ObjectId(id) },
        { $set: { startDate: start } }
      );

      console.log("Accounting period settings updated successfully:", result.modifiedCount);

      if (result.modifiedCount > 0) {
        isModified = true;
      } else {
        isModified = false;
      }
      return isModified;
    
  }catch (err) {
    console.error('Error updating accounting details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
