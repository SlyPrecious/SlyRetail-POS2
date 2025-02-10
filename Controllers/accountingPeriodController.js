import { accountingPeriodModel } from '../Schemas/slyretailAccountingPeriodSettingsSchemas.js';
import { ObjectId } from 'mongodb';
import { connectDB, databaseName,signingCriteria} from '../Schemas/slyretailDbConfig.js';

let isModified = false

export async function getAccountingPeriodDetails() {
  // Step 1: Create a connection
  const db = await connectDB(databaseName,signingCriteria);
  if (db) {
    try {
      // const accountingPeriodModel = db.model('Accountingperiod', AccountingPeriodSettingsSchema);
      // Create the model with the specific connection
      const accountingModel = accountingPeriodModel(db);
      const details = await accountingModel.find();

      return { details };
    } catch (err) {
      console.error('Error fetching accounting details:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
export async function updateAccountingPeriod(id, startDate) {
  // Parse the startDate to a Date object
  try {
    // Step 1: Create a connection
    const db = await connectDB(databaseName,signingCriteria);
    if (db) {
      const start = new Date(startDate);
      // Calculate end date as December 31 of the same year
      // const endDate = new Date(start.getFullYear(), 11, 31); // Month is 0-indexed
      const accountingModel = accountingPeriodModel(db);
      const result = await accountingModel.updateOne(
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
    }
  }
  catch (err) {
    console.error('Error updating accounting details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
