import express from "express";
import cors from "cors";
import { PORT } from "./config/envConfig.js";
import { connectToDB } from "./db/dbConnection.js";

//routes
import productRouter from "./routes/product.routes.js"
import authRouter from "./routes/auth.routes.js"

const app = express();

//middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

//routes
app.use("/api/products", productRouter)
app.use("/api/auth", authRouter)

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    connectToDB()
})

