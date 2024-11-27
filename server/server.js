import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { NODE_ENV, PORT, CLIENT_URL } from "./config/envConfig.js";
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

/* app.use(cors({
  origin: "http://localhost/5173",
  credentials: true
})) */

const prodOrigin = [CLIENT_URL]
const devOrigin = ["http://localhost/5173"]
const allowedOrigins = NODE_ENV === "production" ? prodOrigin : devOrigin

app.use(cors({
  origin: (origin, callback) => {
    if(!origin || allowedOrigins.includes(origin)) {
      console.log(origin, allowedOrigins)
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}))

/* app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
            ? 'https://general-parts.vercel.app' 
            : 'http://localhost:5173', 
    credentials: true
  })); */

//routes
app.use("/api/products", productRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.listen(PORT, () => {
    console.log("🚀 ~ allowedOrigins:", allowedOrigins)
    console.log(`App listening on port ${PORT} ${process.env.NODE_ENV}`);
    connectToDB()
})

