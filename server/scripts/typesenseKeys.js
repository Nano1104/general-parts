// typesenseKeys.js
// ─────────────────────────────────────────────
// Crea keys de Typesense con permisos limitados, para no usar la key maestra en el día a día:
//   - búsqueda (producción): solo puede buscar en "products"
//   - escritura (producción): solo puede leer/escribir documentos de "products"
//   - desarrollo: todo, pero solo sobre "products_dev" (no puede tocar producción)
// Después de crear cada key prueba que haga lo que debe y que NO pueda hacer lo que no debe.
//
//   npm run typesense-keys              ← crea las que falten
//   npm run typesense-keys -- --recreate ← borra y vuelve a crear las tres (invalida las anteriores)
//
// Necesita TYPESENSE_ADMIN_API_KEY (la maestra) en server/.env.production.
// Los valores de las keys se muestran UNA sola vez: copiarlos al terminar.
// ─────────────────────────────────────────────

import Typesense from "typesense";
import { TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_ADMIN_API_KEY } from "../config/envConfig.js";
import { PROD_COLLECTION_NAME, DEV_COLLECTION_NAME } from "../typesense/collection.js";

const RECREATE = process.argv.includes("--recreate");
const node = { host: TYPESENSE_HOST, port: parseInt(TYPESENSE_PORT) || 8108, protocol: TYPESENSE_PROTOCOL || "http" };
const clientWith = (apiKey) => new Typesense.Client({ nodes: [node], apiKey, connectionTimeoutSeconds: 8, numRetries: 0 });
const admin = clientWith(TYPESENSE_ADMIN_API_KEY);

const KEYS = [
    {
        env: "TYPESENSE_SEARCH_KEY", where: "Render (producción)",
        description: "swparts backend - search (products)",
        actions: ["documents:search"], collections: [PROD_COLLECTION_NAME],
    },
    {
        env: "TYPESENSE_WRITE_KEY", where: "Render (producción)",
        description: "swparts backend - write (products)",
        actions: ["documents:*", "collections:get", "collections:create"], collections: [PROD_COLLECTION_NAME],
    },
    {
        env: "TYPESENSE_WRITE_KEY y TYPESENSE_SEARCH_KEY", where: "server/.env de desarrollo",
        description: "swparts dev (products_dev)",
        // Explícito, NO "*": "*" incluye administrar keys (listar/crear) aunque la key esté
        // limitada a una colección, lo que permitiría fabricarse una key con acceso total
        actions: ["documents:*", "collections:*"], collections: [DEV_COLLECTION_NAME],
    },
];

// true si la operación funciona, false si Typesense la rechaza por permisos
const allowed = async (fn) => {
    try { await fn(); return true; } catch (err) {
        if (err.httpStatus === 401 || err.httpStatus === 403) return false;
        if (err.httpStatus === 404) return true; // pasó la autorización (el recurso no existe)
        throw err;
    }
};
const canSearch = (c, col) => allowed(() => c.collections(col).documents().search({ q: "*", query_by: "desc_stock", per_page: 1 }));
const canWrite = (c, col) => allowed(() => c.collections(col).documents().upsert({ id: "__key_check__", codpro: "__key_check__", desc_stock: "x", desc_marca: "x", desc_rubro: "x", desc_subrub: "x", precioimpre: 0, stock: 0 }).then(() => c.collections(col).documents("__key_check__").delete()));
const canDeleteCollection = (c, col) => allowed(() => c.collections(col + "__no_existe__").delete());
const canListKeys = (c) => allowed(() => c.keys().retrieve());
// Si la creación funciona (no debería), la key de prueba se borra enseguida con la maestra
const canCreateKeys = (c) => allowed(async () => {
    const k = await c.keys().create({ description: "__key_check__", actions: ["documents:search"], collections: [DEV_COLLECTION_NAME] });
    await admin.keys(k.id).delete();
});

async function verify(key, value) {
    const c = clientWith(value);
    const checks = key.env === "TYPESENSE_SEARCH_KEY"
        ? [["buscar en products", await canSearch(c, PROD_COLLECTION_NAME), true],
           ["escribir en products", await canWrite(c, PROD_COLLECTION_NAME), false]]
        : key.env === "TYPESENSE_WRITE_KEY"
        ? [["buscar en products", await canSearch(c, PROD_COLLECTION_NAME), true],
           ["escribir en products", await canWrite(c, PROD_COLLECTION_NAME), true],
           ["tocar products_dev", await canSearch(c, DEV_COLLECTION_NAME), false],
           ["borrar colecciones", await canDeleteCollection(c, PROD_COLLECTION_NAME), false]]
        : [["escribir en products_dev", await canWrite(c, DEV_COLLECTION_NAME), true],
           ["buscar en products (producción)", await canSearch(c, PROD_COLLECTION_NAME), false],
           ["escribir en products (producción)", await canWrite(c, PROD_COLLECTION_NAME), false]];
    // Ninguna key de la app debe poder administrar keys
    checks.push(["listar keys", await canListKeys(c), false], ["crear keys", await canCreateKeys(c), false]);
    let ok = true;
    for (const [label, got, expected] of checks) {
        ok &&= got === expected;
        console.log(`     ${got === expected ? "✔" : "✘"} ${expected ? "puede" : "NO puede"} ${label}${got === expected ? "" : "  ← ¡no coincide!"}`);
    }
    return ok;
}

async function run() {
    if (!TYPESENSE_ADMIN_API_KEY) throw new Error("Falta TYPESENSE_ADMIN_API_KEY (la key maestra) en el .env");
    console.log(`🔑 Typesense ${node.protocol}://<host>:${node.port}\n`);

    const existing = (await admin.keys().retrieve()).keys;
    let allOk = true;
    const created = [];

    for (const key of KEYS) {
        const found = existing.filter(k => k.description === key.description);
        const sameScope = (k) => [...k.actions].sort().join() === [...key.actions].sort().join()
            && [...k.collections].sort().join() === [...key.collections].sort().join();
        if (found.length && !RECREATE && !found.every(sameScope)) {
            console.log(`• "${key.description}" existe con permisos distintos a los esperados: se vuelve a crear (la anterior deja de funcionar).`);
        } else if (found.length && !RECREATE) {
            console.log(`• "${key.description}" ya existe (${found[0].value_prefix}…): no se puede volver a mostrar su valor.`);
            console.log(`   Si la perdiste: npm run typesense-keys -- --recreate\n`);
            continue;
        }
        for (const k of found) await admin.keys(k.id).delete();

        const { value } = await admin.keys().create({ description: key.description, actions: key.actions, collections: key.collections });
        console.log(`• "${key.description}" creada. Verificando permisos:`);
        allOk = (await verify(key, value)) && allOk;
        created.push({ ...key, value });
        console.log("");
    }

    if (created.length) {
        console.log("════════════════════════════════════════════════════════════════");
        console.log(" COPIÁ ESTOS VALORES AHORA (no se vuelven a mostrar)");
        console.log("════════════════════════════════════════════════════════════════");
        for (const k of created) console.log(`\n ${k.env}  →  ${k.where}\n   ${k.value}`);
        console.log("\n Después: en Render quitá TYPESENSE_ADMIN_API_KEY y TYPESENSE_SEARCH_API_KEY;");
        console.log(" en tu .env de desarrollo quitá TYPESENSE_ADMIN_API_KEY. La maestra queda solo en Hetzner.");
    }
    if (!allOk) {
        console.error("\n❌ Alguna key no tiene los permisos esperados (ver ✘). No la uses y avisá.");
        process.exitCode = 1;
    }
}

run().catch(err => {
    console.error("❌ Error:", err.message);
    process.exitCode = 1;
});
