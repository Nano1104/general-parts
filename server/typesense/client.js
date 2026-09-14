import Typesense from "typesense";
import { TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_ADMIN_API_KEY } from "../config/envConfig.js";

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