import { AbstractMigration, Info, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import Dex from "https://deno.land/x/dex@1.0.2/mod.ts";

export default class extends AbstractMigration<ClientMySQL> {
    /** Runs on migrate */
    async up({dialect}: Info): Promise<void> {
        const query = Dex({client: dialect}).schema.createTable('penggunaan_air', (table: any)=>{
            table.increments('id_penggunaan').primary();
            table.date('tanggal_penggunaan');
            table.integer('id_pelanggan').unsigned().index().references('pelanggan.id_pelanggan').onUpdate('CASCADE').onDelete('RESTRICT');
            table.integer('meteran_awal');
            table.integer('meteran_akhir');
        }).toString() as string;
        const queries = query.split(';');
        for await (const q of queries) {
            this.client.query(q);
        }
    }

    /** Runs on rollback */
    async down({dialect}: Info): Promise<void> {
        const query = Dex({client: dialect}).schema.dropTable('penggunaan_air').toString() as string;
        await this.client.query(query);
    }
}
