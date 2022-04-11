import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { MySQLClient } from "denodb/deps.ts";
import { db } from './../db.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    await ctx.render('pembayaran/index', { title: 'Histori Pembayaran' });
}

export const get_pembayaran: HandlerFunc = async (ctx: Context) => {
    const { search } = ctx.queryParams;
    const currentPage = parseInt(ctx.queryParams.page) || 1;
    const limit = 10;
    const offset = limit*(currentPage-1);
    const pembayaranQuery = /*sql*/`
SELECT
__FIELDS__
FROM tagihan
LEFT JOIN karyawan ON karyawan.id_karyawan=tagihan.id_karyawan
LEFT JOIN penggunaan_air ON penggunaan_air.id_penggunaan=tagihan.id_penggunaan
LEFT JOIN pelanggan ON pelanggan.id_pelanggan=penggunaan_air.id_pelanggan
LEFT JOIN subkategori ON subkategori.id_subkategori=pelanggan.id_subkategori
LEFT JOIN kategori ON kategori.id_kategori=subkategori.id_kategori
LEFT JOIN tarif ON tarif.id_kategori=kategori.id_kategori AND
tarif.range_awal<=(penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal) AND
IF(tarif.range_akhir=0, (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal), tarif.range_akhir)>=(penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)
WHERE tagihan.status='Lunas'
    `;
    const pembayaranFields = `
    pelanggan.id_pelanggan as idPelanggan,
    pelanggan.nama_pelanggan as namaPelanggan,
    tagihan.tanggal_pembayaran as tanggalPembayaran,
    (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)*tarif.nilai as jumlahTagihan,
    IF(tagihan.tanggal_pembayaran>DATE_ADD(penggunaan_air.tanggal_penggunaan, INTERVAL 20 DAY), (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)*tarif.nilai/10, 0) as denda,
    karyawan.username as usernameKaryawan
    `
    const conditions: string[] = [];
    if (typeof search === 'string' && search !== '') {
        const penggunaanFields = ['pelanggan.id_pelanggan', 'pelanggan.nama_pelanggan', 'karyawan.username'];
        const searchWords = search.split(/\b/g).filter(str => str !== ' ');
        penggunaanFields.forEach(pfield => {
            searchWords.forEach(sword => {
                conditions.push(`${pfield} LIKE '%${sword}%'`);
            })
        })
    }
    await db.getConnector()._makeConnection();
    const count = (await (<MySQLClient>db.getClient())['query'](`${pembayaranQuery.replace(/__FIELDS__/g, 'COUNT(1) as count')} ${conditions.length>0?`AND (${conditions.join(' OR ')})`:''}`))[0]['count'];
    const pageCount = Math.ceil(count / limit);
    const hasPrev = currentPage > 1;
    const hasNext = pageCount - currentPage > 0;
    const data = (await (<MySQLClient>db.getClient())['query'](`${pembayaranQuery.replace(/__FIELDS__/g, pembayaranFields)} ${conditions.length>0?`AND (${conditions.join(' OR ')})`:''} ORDER BY tanggal_pembayaran DESC LIMIT ${limit} OFFSET ${offset}`));
    await db.close();
    return { count, pageCount, currentPage, hasPrev, hasNext, data };
}