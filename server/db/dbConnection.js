import mongoose from "mongoose";

import { DB_USER_NAME, DB_USER_PASSWORD } from "../config/envConfig.js";

export const connectToDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`)
        console.log(`======== Connected to MongoDB ===========`)
    } catch (err) {
        console.log(`======== Failed connection to MongoDB ===========`, err)
    }   
}