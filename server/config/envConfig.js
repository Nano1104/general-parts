import { config } from "dotenv";

config({
    path: `.env.${process.env.NODE_ENV}`
})

const { NODE_ENV, DB_PORT, DB_HOST, DB_USER_NAME, DB_USER_PASSWORD, PORT, JWT_TOKEN_KEY } = process.env

export { NODE_ENV, DB_PORT, DB_HOST, DB_USER_NAME, DB_USER_PASSWORD, PORT, JWT_TOKEN_KEY }