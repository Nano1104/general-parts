import mongoose from "mongoose";

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

export const connectToDB = async () => {
    try {
        await mongoose.connect(connectionOptions.url, connectionOptions.options);
        console.log(`======== Connected to MongoDB ===========`);
        // Opcional: Verificar conexión con un ping
        await mongoose.connection.db.admin().ping();
        console.log(`======== MongoDB Ping Success ===========`);
    } catch (err) {
        console.error(`======== Failed connection to MongoDB ===========`, err);
        process.exit(1); // Termina la aplicación si no hay conexión
    }   
};

