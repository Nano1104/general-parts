// typesenseClient.js
import Typesense from "typesense";
import {  TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_ADMIN_API_KEY } from "../config/envConfig.js";
// ⚙️ Configuración del cliente Typesense
// Para Typesense Cloud: host = "xxx.a1.typesense.net", port = 443, protocol = "https"
// Para self-hosted (ej. Railway): host = tu dominio, port = 8108, protocol = "http"
const client = new Typesense.Client({
    nodes: [
        {
            host: TYPESENSE_HOST || "localhost",
            port: TYPESENSE_PORT || 8108,
            protocol: TYPESENSE_PROTOCOL || "http",
        },
    ],
    apiKey: TYPESENSE_ADMIN_API_KEY,
    connectionTimeoutSeconds: 5,
    retryIntervalSeconds: 0.1,
    healthcheckIntervalSeconds: 60,
});

export default client;