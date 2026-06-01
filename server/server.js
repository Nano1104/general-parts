import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { NODE_ENV, PORT, CLIENT_URL } from "./config/envConfig.js";

//connections 
import { ensureCollection } from "./typesense/collection.js";
import { connectToDB } from "./db/dbConnection.js";
import agendaModule from "./agenda.js"

//routes
import productRouter from "./routes/product.routes.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
/* import typesenseRouter from "./routes/typesense.route.js" */

const app = express();

//middlewares
app.use(express.json())
app.use(cookieParser())

const prodOrigin = [
  "https://www.swautoparts.com",
  "https://swautoparts.com"
];
const devOrigin = ["http://localhost:5173"];

const allowedOrigins = NODE_ENV === "production" ? prodOrigin : devOrigin;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


//routes
app.head('/api/health', (req, res) => {
  res.status(200).end();
});
app.use("/api/products", productRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
/* app.use("/api/typesense", typesenseRouter) */


const startServer = async () => {
  const { agenda, startAgenda } = agendaModule;

  try {
    await connectToDB();
    await startAgenda();
    await agenda.cancel({ 'data.productId': { $exists: true } });

    // ✅ Typesense aislado: si falla, el servidor sigue funcionando
    try {
      await ensureCollection();
      console.log("✅ Typesense listo");
    } catch (tsErr) {
      console.error("⚠️  Typesense no disponible, búsquedas usarán MongoDB:", tsErr.message);
      // El servidor sigue levantando normalmente
    }

    app.listen(PORT, () => {
      console.log("🚀 ~ allowedOrigins:", allowedOrigins);
      console.log(`App listening on port ${PORT} ${NODE_ENV}`);
    });

  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
};

startServer();
