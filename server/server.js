import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { NODE_ENV, PORT, CLIENT_URL } from "./config/envConfig.js";

//connections 
import mongoose from "mongoose";
import { ensureCollection } from "./typesense/collection.js";
import { searchClient } from "./typesense/client.js";
import { connectToDB } from "./db/dbConnection.js";
import { startMaintenanceJobs } from "./jobs/maintenance.js";

//routes
import productRouter from "./routes/product.routes.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
/* import typesenseRouter from "./routes/typesense.route.js" */

const app = express();

//middlewares
// Cabeceras de seguridad básicas (equivalente mínimo a helmet para una API JSON)
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });
  if (NODE_ENV === "production") res.set("Strict-Transport-Security", "max-age=15552000");
  next();
});

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
// GET informa el estado de las dependencias (el keep-alive de GitHub hace GET cada 5 min).
// Con Typesense caído responde 200 igual: el sitio funciona con la búsqueda de respaldo.
app.get('/api/health', async (req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  let typesense = false;
  try {
    await searchClient.health.retrieve();
    typesense = true;
  } catch (_) { /* typesense: false */ }
  res.status(mongo ? 200 : 503).json({ mongo, typesense });
});
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
  try {
    await connectToDB();

    app.listen(PORT, () => {
      console.log("🚀 ~ allowedOrigins:", allowedOrigins);
      console.log(`App listening on port ${PORT} ${NODE_ENV}`);
    });

    // Typesense en segundo plano: si está caído o colgado el servidor igual atiende
    // (antes esperaba hasta 20 s antes de escuchar) y las búsquedas usan el respaldo en Mongo
    ensureCollection()
      .then(() => console.log("✅ Typesense listo"))
      .catch(tsErr => console.error("⚠️  Typesense no disponible, búsquedas usarán MongoDB:", tsErr.message));

    startMaintenanceJobs();

  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
};

startServer();
