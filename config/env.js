/* eslint-disable no-undef */
import { config } from "dotenv";
//comment it out during production deployment

config({path: `.env.${process.env.NODE_ENV || "development"}.local`});
config()

export const {PORT,NODE_ENV,DB_URI,JWT_SECRET,JWT_EXPIRES_IN,ARCJET_KEY,
    ARCJET_ENV,QSTASH_URL,QSTASH_TOKEN,SERVER_URL,EMAIL_PASSWORD}= process.env;