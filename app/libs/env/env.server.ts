import 'dotenv/config'
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        HOST: z.string().default("localhost:3000"),
        PORT: z.string().default("3000"),
        SESSION_SECRET: z.string(),
        CASDOOR_CLIENT_ID: z.string(),
        CASDOOR_CLIENT_SECRET: z.string(),
        CASDOOR_URL: z.string(),
    },
    runtimeEnv: process.env
})
