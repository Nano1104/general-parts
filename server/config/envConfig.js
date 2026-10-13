import { config } from "dotenv";

const path = process.env.NODE_ENV == "production" ? ".env.production" : ".env";

config({
    path: `${path}`
})

const { NODE_ENV,
    DB_PORT,
    DB_HOST,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    PORT,
    CLIENT_URL,
    JWT_TOKEN_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_URL,


    TYPESENSE_HOST,
    TYPESENSE_PORT,
    TYPESENSE_PROTOCOL,
    TYPESENSE_ADMIN_API_KEY,
    TYPESENSE_WRITE_KEY,   // key limitada a la colección (npm run typesense-keys)
    TYPESENSE_SEARCH_KEY,  // key solo de búsqueda (npm run typesense-keys)
} = process.env

export {
    NODE_ENV,
    DB_PORT,
    DB_HOST,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    PORT,
    CLIENT_URL,
    JWT_TOKEN_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_URL,

    TYPESENSE_HOST,
    TYPESENSE_PORT,
    TYPESENSE_PROTOCOL,
    TYPESENSE_ADMIN_API_KEY,
    TYPESENSE_WRITE_KEY,   // key limitada a la colección (npm run typesense-keys)
    TYPESENSE_SEARCH_KEY,  // key solo de búsqueda (npm run typesense-keys)
}