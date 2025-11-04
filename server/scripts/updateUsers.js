// scripts/updateUsers.js
import mongoose from "mongoose";
import User from "../models/user.model.js"; // ajustá la ruta según donde esté tu modelo

import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from "../config/envConfig.js";

const connectionOptions = {
    url: NODE_ENV === "production"
            ? `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`
            : `mongodb://${DB_HOST}:${DB_PORT}/${DB_USER_NAME}`,
    options: {
        serverSelectionTimeoutMS: 5000,    // Timeout de 5 segundos para seleccionar servidor
        socketTimeoutMS: 45000,           // Cierra sockets inactivos después de 45s
        maxPoolSize: 10,                  // Máximo de conexiones simultáneas
        minPoolSize: 2,                   // Mantén 2 conexiones activas incluso inactivas
        heartbeatFrequencyMS: 10000,       // Envía "latidos" cada 10s para mantener la conexión
        retryWrites: true,                // Reintenta escrituras fallidas (ya lo tienes en la URL)
        w: 'majority'                     // Asegura escritura en la mayoría de nodos (replica set)
    }
};

const run = async () => {
    try {
        await mongoose.connect(connectionOptions.url, connectionOptions.options);
        console.log("✅ Conectado a MongoDB");

        const result = await User.updateMany(
            {},
            {
                $set: {
                    discount_1: 0,
                    discount_2: 0,
                    discount_3: 0
                }
            }
        );

        console.log(`Usuarios actualizados: ${result.modifiedCount}`);
    } catch (error) {
        console.error("❌ Error al actualizar usuarios:", error);
    } finally {
        mongoose.connection.close();
    }
};

run();