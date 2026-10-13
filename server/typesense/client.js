import Typesense from "typesense";
import {
  TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL,
  TYPESENSE_ADMIN_API_KEY, TYPESENSE_WRITE_KEY, TYPESENSE_SEARCH_KEY,
} from "../config/envConfig.js";

const nodes = [
  {
    host: TYPESENSE_HOST || "localhost",
    port: parseInt(TYPESENSE_PORT) || 8108,   // ← parseInt importante
    protocol: TYPESENSE_PROTOCOL || "http",
  },
];

// Keys con alcance limitado (npm run typesense-keys). Si no están configuradas se usa la
// key maestra, para que el cambio de keys no rompa nada mientras se migra.
const writeKey = TYPESENSE_WRITE_KEY || TYPESENSE_ADMIN_API_KEY;
const searchKey = TYPESENSE_SEARCH_KEY || writeKey;

// Escrituras (sync, import, scripts): pueden mandar lotes de 500 documentos, así que esperan más
const client = new Typesense.Client({
  nodes,
  apiKey: writeKey,
  connectionTimeoutSeconds: 8,
  numRetries: 1,
});

// Búsquedas: fallar rápido. 2 intentos de 1 s: si Typesense no responde en ~2 s, getProducts
// busca en Mongo. (Antes eran 5 s × 4 intentos: con el servidor colgado cada búsqueda tardaba 20 s.)
// Ojo: la librería trata numRetries: 0 como "no configurado" y usa 3, por eso el mínimo es 1.
export const searchClient = new Typesense.Client({
  nodes,
  apiKey: searchKey,
  connectionTimeoutSeconds: 1,
  numRetries: 1,
});

export default client;
