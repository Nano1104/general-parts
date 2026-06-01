import Typesense from "typesense";
import { TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_ADMIN_API_KEY } from "../config/envConfig.js";

console.log("🚀 ~ TYPESENSE_HOST:", TYPESENSE_HOST)
console.log("🚀 ~ TYPESENSE_PORT:", TYPESENSE_PORT)
console.log("🚀 ~ TYPESENSE_PROTOCOL:", TYPESENSE_PROTOCOL)
console.log("🚀 ~ TYPESENSE_ADMIN_API_KEY:", TYPESENSE_ADMIN_API_KEY)

const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST || "localhost",
      port: parseInt(TYPESENSE_PORT) || 8108,   // ← parseInt importante (ver abajo)
      protocol: TYPESENSE_PROTOCOL || "http",
    },
  ],
  apiKey: TYPESENSE_ADMIN_API_KEY,
  connectionTimeoutSeconds: 5,
  numRetries: 3,
});

export default client;