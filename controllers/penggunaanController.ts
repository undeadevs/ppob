import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { MySQLClient } from "denodb/deps.ts";
import { EJSContext } from "../lib/abc_ejs/mod.ts";
import { db, PenggunaanAir, Pelanggan, Karyawan } from './../db.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    await ctx.render('penggunaan/index', { title: 'Daftar Penggunaan' });
}

export const get_penggunaan: HandlerFunc = async (ctx: Context) => {
    const { search } = ctx.queryParams;
    const currentPage = parseInt(ctx.queryParams.page) || 1;
    const limit = 10;
    const offset = limit*(currentPage-1);
    if (typeof search === 'string' && search !== '') {
        const penggunaanFields = ['pelanggan.id_pelanggan', 'nama_pelanggan', 'meteran_awal', 'meteran_akhir', 'username'];
        const conditions: string[] = [];
        const searchWords = search.split(/\b/g).filter(str => str !== ' ');
        penggunaanFields.forEach(pfield => {
            searchWords.forEach(sword => {
                conditions.push(`${pfield} LIKE '%${sword}%'`);
            })
        })
        await db.getConnector()._makeConnection();
        const count = (await (<MySQLClient>db.getClient())['query'](`SELECT COUNT(*) AS 'count' FROM penggunaan_air LEFT JOIN pelanggan ON pelanggan.id_pelanggan=penggunaan_air.id_pelanggan LEFT JOIN karyawan ON karyawan.id_karyawan=penggunaan_air.id_karyawan WHERE ${conditions.join(' OR ')}`))[0]['count'];
        const pageCount = Math.ceil(count / limit);
        const hasPrev = currentPage > 1;
        const hasNext = pageCount - currentPage > 0;
        const data = await (<MySQLClient>db.getClient())['query'](`SELECT id_penggunaan AS idPenggunaan, pelanggan.id_pelanggan AS idPelanggan, nama_pelanggan AS namaPelanggan, tanggal_penggunaan AS tanggalPengecekkan, meteran_awal AS meteranAwal, meteran_akhir AS meteranAkhir, username AS usernameKaryawan FROM penggunaan_air LEFT JOIN pelanggan ON pelanggan.id_pelanggan=penggunaan_air.id_pelanggan LEFT JOIN karyawan ON karyawan.id_karyawan=penggunaan_air.id_karyawan HAVING ${conditions.join(' OR ')} ORDER BY tanggal_penggunaan DESC LIMIT ${limit} OFFSET ${offset}`);
        await db.close();
        return { count, pageCount, currentPage, hasPrev, hasNext, data };
    }
    const count = await PenggunaanAir.leftJoin(Pelanggan, Pelanggan.field('id_pelanggan'), PenggunaanAir.field('id_pelanggan')).leftJoin(Karyawan, Karyawan.field('id_karyawan'), PenggunaanAir.field('id_karyawan')).count();
    const pageCount = Math.ceil(count / limit);
    const hasPrev = currentPage > 1;
    const hasNext = pageCount - currentPage > 0;
    const data = await PenggunaanAir.select(PenggunaanAir.field('id_penggunaan'),Pelanggan.field('id_pelanggan'), Pelanggan.field('nama_pelanggan'), PenggunaanAir.field('tanggal_penggunaan', 'tanggalPengecekkan'), PenggunaanAir.field('meteran_awal'), PenggunaanAir.field('meteran_akhir'), Karyawan.field('username', 'usernameKaryawan')).leftJoin(Pelanggan, Pelanggan.field('id_pelanggan'), PenggunaanAir.field('id_pelanggan')).leftJoin(Karyawan, Karyawan.field('id_karyawan'), PenggunaanAir.field('id_karyawan')).orderBy(PenggunaanAir.field('tanggal_penggunaan'), 'desc').limit(limit).offset(offset).get();
    return { count, pageCount, currentPage, hasPrev, hasNext, data };
}

export const perbaiki_get: HandlerFunc = async (ctx: Context) => {
    await ctx.render('penggunaan/perbaiki', { title: 'Perbaiki Meteran' });
}

export const perbaiki_put: HandlerFunc = async (ctx: Context) => {
    const { idPelanggan, meteranAkhir } = ((await ctx.body) as Record<string, unknown>);
    if (typeof idPelanggan === 'string' && typeof meteranAkhir === 'string' && idPelanggan !== '' && meteranAkhir !== '') {
        const pelanggan = await Pelanggan.find(idPelanggan);
        if (pelanggan) {
            const currentPenggunaan = await PenggunaanAir.select('id_penggunaan','meteran_akhir').where('id_pelanggan', idPelanggan).orderBy('tanggal_penggunaan', 'desc').first();
            const meteranAwal = currentPenggunaan ? (currentPenggunaan.meteranAwal || 0) : 0;
            if (meteranAkhir < meteranAwal) return { error: 'Meteran Akhir tidak valid' };
            await PenggunaanAir.where({idPenggunaan: <number>currentPenggunaan.idPenggunaan}).orderBy('tanggal_penggunaan', 'desc').limit(1).update({meteranAkhir: meteranAkhir});
            return { success: `Perbaiki Meteran dengan ID Pelanggan: ${idPelanggan} Berhasil!` }
        }
        return { error: 'ID Pelanggan tidak valid' }
    }
    return { error: 'ID Pelanggan dan Meteran Akhir harus diisi.' };
}