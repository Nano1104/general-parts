import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PORT } from "./config/envConfig.js";
import { connectToDB } from "./db/dbConnection.js";

//routes
import productRouter from "./routes/product.routes.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"

const app = express();

//middlewares
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
            ? 'https://general-parts.vercel.app' 
            : 'http://localhost:5173', 
    credentials: true
  }));

//routes
app.use("/api/products", productRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT} ${process.env.NODE_ENV}`);
    connectToDB()
})

