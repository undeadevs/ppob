import { ClientMySQL, NessieConfig, } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import { config as envConfig } from "https://deno.land/x/dotenv/mod.ts";

envConfig({export: true});

const client = new ClientMySQL({
    hostname: Deno.env.get('DB_HOST'),
    port: parseInt(Deno.env.get('DB_PORT')!),
    username: Deno.env.get('DB_USERNAME'),
    password: Deno.env.get('DB_PASSWORD'),
    db: Deno.env.get('DB_DATABASE'),
});

const config: NessieConfig = {
    client,
    migrationFolders: ["./db/migrations"],
    seedFolders: ["./db/seeds"],
};

export default config;
