import { Database, MySQLConnector, Relationships } from 'denodb';
import Kategori from './models/Kategori.ts';
import Subkategori from './models/Subkategori.ts';
import Tarif from './models/Tarif.ts';
import Karyawan from './models/Karyawan.ts';
import Pelanggan from './models/Pelanggan.ts';
import PenggunaanAir from './models/PenggunaanAir.ts';
import Tagihan from './models/Tagihan.ts';
import { MySQLClient } from "denodb/deps.ts";

const connectionOptions = {
    database: Deno.env.get('DB_DATABASE')!,
    host: Deno.env.get('DB_HOST')!,
    username: Deno.env.get('DB_USERNAME')!,
    password: Deno.env.get('DB_PASSWORD')!,
    port: parseInt(Deno.env.get('DB_PORT')!),
}

console.log(connectionOptions)

const connector = new MySQLConnector(connectionOptions);

const db = new Database({connector});

Relationships.belongsTo(Subkategori, Kategori, { foreignKey: 'idKategori' });
Relationships.belongsTo(Tarif, Kategori, { foreignKey: 'idKategori' });
Relationships.belongsTo(Pelanggan, Subkategori, { foreignKey: 'idSubkategori' });

Relationships.belongsTo(PenggunaanAir, Pelanggan, { foreignKey: 'idPelanggan' });
Relationships.belongsTo(Tagihan, Pelanggan, { foreignKey: 'idPelanggan' });

Relationships.belongsTo(PenggunaanAir, Karyawan, { foreignKey: 'idKaryawan' });
Relationships.belongsTo(Tagihan, Karyawan, { foreignKey: 'idKaryawan' });

Relationships.belongsTo(Tagihan, PenggunaanAir, { foreignKey: 'idPenggunaan' });

await db.link([Kategori, Subkategori, Tarif, Karyawan, Pelanggan, PenggunaanAir, Tagihan]);

const query = async(queryString: string, params?: unknown[] | undefined)=>{
    return await (<MySQLClient>db.getClient())['query'](queryString, params);
}

export { db, query, Kategori, Subkategori, Tarif, Karyawan, Pelanggan, PenggunaanAir, Tagihan };