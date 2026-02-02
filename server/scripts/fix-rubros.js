import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from '../config/envConfig.js';

const DRY_RUN = process.argv.includes('--dry-run');

// ✨ Usar la misma lógica de conexión que tienes en tu app
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

async function fixRubroSubrub() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        console.log('🌍 Entorno:', NODE_ENV);

        await mongoose.connect(MONGO_URI, connectionOptions);
        console.log('✅ Conectado exitosamente\n');

        if (DRY_RUN) {
            console.log('🔍 MODO DRY-RUN: No se modificará nada, solo se mostrará qué cambiaría\n');
        } else {
            console.log('⚠️  MODO PRODUCCIÓN: Se modificarán los productos\n');
        }

        console.log('📊 Analizando productos...\n');

        // Obtener todos los productos
        const products = await Product.find({}).skip(2000).limit(DRY_RUN ? 5 : 0);
        const totalProducts = await Product.countDocuments();

        console.log(`Total de productos a procesar: ${DRY_RUN ? '5 (muestra)' : totalProducts}\n`);

        let fixed = 0;
        const changes = [];

        for (const product of products) {
            const before = {
                codpro: product.codpro,
                desc_rubro: product.desc_rubro,
                desc_subrub: product.desc_subrub,
                rubro: product.rubro,
                subrub: product.subrub
            };

            // Intercambiar rubro ↔ subrub
            if (!DRY_RUN) {
                const tempRubro = product.rubro;
                product.rubro = product.subrub;
                product.subrub = tempRubro;

                // ✨ CAMBIO: Deshabilitar validación
                await product.save({ validateBeforeSave: false });
            }


            const after = {
                codpro: product.codpro,
                desc_rubro: product.desc_rubro,
                desc_subrub: product.desc_subrub,
                rubro: DRY_RUN ? product.subrub : product.rubro,
                subrub: DRY_RUN ? product.rubro : product.subrub
            };

            changes.push({ before, after });
            fixed++;

            if (!DRY_RUN && fixed % 100 === 0) {
                console.log(`⏳ Procesados: ${fixed}/${totalProducts}`);
            }
        }

        // Mostrar ejemplos de cambios
        console.log('\n📋 Ejemplos de cambios:\n');
        changes.slice(0, 3).forEach((change, idx) => {
            console.log(`Producto ${idx + 1} (${change.before.codpro}):`);
            console.log('  ANTES:');
            console.log(`    desc_rubro: "${change.before.desc_rubro}"`);
            console.log(`    desc_subrub: "${change.before.desc_subrub}"`);
            console.log(`    rubro: ${change.before.rubro}`);
            console.log(`    subrub: ${change.before.subrub}`);
            console.log('  DESPUÉS:');
            console.log(`    desc_rubro: "${change.after.desc_rubro}"`);
            console.log(`    desc_subrub: "${change.after.desc_subrub}"`);
            console.log(`    rubro: ${change.after.rubro} ⬅️`);
            console.log(`    subrub: ${change.after.subrub} ⬅️\n`);
        });

        if (DRY_RUN) {
            console.log('✅ DRY-RUN completado. Nada fue modificado.');
            console.log('💡 Para aplicar los cambios, ejecuta: npm run fix-rubro-subrub\n');
        } else {
            console.log(`✅ Migración completada: ${fixed} productos corregidos\n`);

            // Verificación final
            const sample = await Product.findOne({ desc_rubro: "MOTOR" });
            if (sample) {
                console.log('🔍 Verificación final - Producto de ejemplo:');
                console.log({
                    codpro: sample.codpro,
                    desc_rubro: sample.desc_rubro,
                    desc_subrub: sample.desc_subrub,
                    rubro: sample.rubro,
                    subrub: sample.subrub
                });
            }
        }

        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Error durante la migración:', err);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixRubroSubrub();