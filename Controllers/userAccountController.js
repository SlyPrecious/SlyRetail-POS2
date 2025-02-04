import { CurrenciesModel } from '../Schemas/slyretailCurrenciesSchemas.js';

export async function getUserDetails(params) {

    const currencies = await CurrenciesModel.find()
    return { currencies: currencies }

}