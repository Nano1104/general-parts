import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from '../config/envConfig.js';

const MONGO_URI = NODE_ENV === "production"
    ? `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`
    : `mongodb://${DB_HOST}:${DB_PORT}/${DB_USER_NAME}`;

const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority'
};

async function fixRubroSubrubBulk() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI, connectionOptions);
        console.log('✅ Conectado exitosamente\n');

        // ✨ Operación bulk que intercambia rubro ↔ subrub en todos los productos
        console.log('⚙️  Ejecutando operación bulk...');

        const result = await Product.collection.updateMany(
            {},  // Todos los productos
            [
                {
                    $set: {
                        // Intercambiar valores usando variables temporales
                        temp_rubro: "$rubro",
                        temp_subrub: "$subrub"
                    }
                },
                {
                    $set: {
                        rubro: "$temp_subrub",
                        subrub: "$temp_rubro"
                    }
                },
                {
                    $unset: ["temp_rubro", "temp_subrub"]  // Limpiar campos temporales
                }
            ]
        );

        console.log(`✅ Migración completada: ${result.modifiedCount} productos actualizados\n`);

        // Verificación
        const sample = await Product.findOne({ desc_rubro: "MOTOR" });
        if (sample) {
            console.log('🔍 Verificación - Producto de ejemplo:');
            console.log({
                codpro: sample.codpro,
                desc_rubro: sample.desc_rubro,
                desc_subrub: sample.desc_subrub,
                rubro: sample.rubro,
                subrub: sample.subrub
            });
        }

        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Error:', err);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixRubroSubrubBulk();