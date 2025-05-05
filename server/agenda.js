import Agenda from 'agenda'
import mongoose from "mongoose"
import { NODE_ENV, DB_USER_NAME, DB_PORT, DB_HOST, DB_USER_PASSWORD } from './config/envConfig.js';

const MONGODB_URL = NODE_ENV === "production"
                ? `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster-repuestos.kloz1gg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Repuestos`
                : `mongodb://${DB_HOST}:${DB_PORT}/${DB_USER_NAME}`

const agenda = new Agenda({
    db: { address: MONGODB_URL, collection: 'productHighlightJobs' },
    processEvery: '10 minutes', // Menos presión sobre MongoDB gratuito
    maxConcurrency: 3, // Más seguro en Render gratuito
    defaultLockLifetime: 10 * 60 * 1000 // OK
});         

// Definir el trabajo para desactivar el destacado
agenda.define('unhighlight-product', async (job) => {
    const { productId } = job.attrs.data;
    
    await mongoose.model('Product').updateOne(
      { codpro: productId },
      { 
        $set: { destacado: false },
        $unset: { fechaFinDestacado: 1, highlightJobId: 1 }
      }
    );
    console.log(`Producto ${productId} desactivado automáticamente`);
});

// Iniciar Agenda cuando la DB esté conectada
async function startAgenda() {
    await agenda.start();   
    console.log('Agenda iniciada');
}

export default { agenda, startAgenda }