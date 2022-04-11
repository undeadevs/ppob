import { AbstractMigration, Info, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import Dex from "https://deno.land/x/dex@1.0.2/mod.ts";

export default class extends AbstractMigration<ClientMySQL> {
    /** Runs on migrate */
    async up({dialect}: Info): Promise<void> {
        // deno-lint-ignore no-explicit-any
        const query = Dex({client: dialect}).schema.createTable('tarif', (table: any)=>{
            table.increments('id_tarif').primary();
            table.integer('id_kategori').unsigned().index().references('kategori.id_kategori').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('range_awal');
            table.integer('range_akhir');
            table.integer('nilai');
        }).toString() as string;
        const queries = query.split(';');
        for await (const q of queries) {
            this.client.query(q);
        }
    }

    /** Runs on rollback */
    async down({dialect}: Info): Promise<void> {
        const query = Dex({client: dialect}).schema.dropTable('tarif').toString() as string;
        await this.client.query(query);
    }
}
