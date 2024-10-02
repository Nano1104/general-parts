import mongoose from "mongoose";

import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from "../config/envConfig.js";

const connectionOptions = {
    url: NODE_ENV === "production"
            ? `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`
            : `mongodb://${DB_HOST}:${DB_PORT}/${DB_USER_NAME}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}

export const connectToDB = async () => {
    try {
        await mongoose.connect(connectionOptions.url, connectionOptions.optionsOptions)
        console.log(`======== Connected to MongoDB ===========`)
    } catch (err) {
        console.log(`======== Failed connection to MongoDB ===========`, err)
    }   
}