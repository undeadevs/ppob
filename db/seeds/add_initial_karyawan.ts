import { AbstractSeed, Info, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import Dex from 'https://deno.land/x/dex@1.0.2/mod.ts';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

export default class extends AbstractSeed<ClientMySQL> {
    /** Runs on seed */
    async run({dialect}: Info): Promise<void> {
        const password = await bcrypt.hash('25092000');
        const query = Dex({client: dialect}).queryBuilder().insert({username: 'initAdmin', password, role: 'Administrator'}).into('karyawan').toString() as string;
        try{
            await this.client.query(query);
        }catch(_err){
            return;
        }
    }
}
