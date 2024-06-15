import express from "express";
import cors from "cors";
import { PORT } from "./config/envConfig.js";
import { connectToDB } from "./db/dbConnection.js";

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//routes



app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    connectToDB()
})

