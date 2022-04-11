// deno-lint-ignore-file no-explicit-any
import { AbstractMigration, Info, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import Dex from "https://deno.land/x/dex@1.0.2/mod.ts";

export default class extends AbstractMigration<ClientMySQL> {
    /** Runs on migrate */
    async up({ dialect }: Info): Promise<void> {
        const queries = [];
        queries.push(
            ...(Dex({ client: dialect }).schema.alterTable('penggunaan_air', (table: any) => {
                table.integer('id_karyawan').unsigned().index().references('karyawan.id_karyawan').onUpdate('CASCADE').onDelete('SET NULL');
            }).toString() as string).split(';')
        )
        queries.push(
            ...(Dex({ client: dialect }).schema.alterTable('tagihan', (table: any) => {
                table.integer('id_karyawan').unsigned().index().references('karyawan.id_karyawan').onUpdate('CASCADE').onDelete('SET NULL');
            }).toString() as string).split(';')
        )
        for await (const q of queries) {
            this.client.query(q);
        }
    }

    /** Runs on rollback */
    async down({ dialect }: Info): Promise<void> {
        const queries = [];
        queries.push(
            ...(Dex({ client: dialect }).schema.alterTable('penggunaan_air', (table: any) => {
                table.dropForeign('id_karyawan', 'penggunaan_air_id_karyawan_foreign');
                table.dropColumn('id_karyawan');
            }).toString() as string).split(';')
        )
        queries.push(
            ...(Dex({ client: dialect }).schema.alterTable('tagihan', (table: any) => {
                table.dropForeign('id_karyawan', 'tagihan_id_karyawan_foreign')
                table.dropColumn('id_karyawan');
            }).toString() as string).split(';')
        )
        console.log(queries)
        for await (const q of queries) {
            this.client.query(q);
        }
    }
}
