import { config } from "dotenv";

config();

const { DB_USER_NAME, DB_USER_PASSWORD, PORT } = process.env

export { DB_USER_NAME, DB_USER_PASSWORD, PORT }