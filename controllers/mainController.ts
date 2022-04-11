import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { EJSContext } from './../lib/abc_ejs/mod.ts';
import { db, query, Pelanggan, PenggunaanAir, Kategori, Subkategori, Tarif, Tagihan } from './../db.ts';
import { Model } from "denodb";
import { Values } from "denodb/lib/data-types.ts";
import createTagihanPDFBase64 from '../services/tagihan/createTagihanPDFBase64.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    const customCtx = (ctx as EJSContext);
    const user = customCtx.get('user') as ({ idKaryawan: number, username: string, password: string, role: string });
    await ctx.render(user.role === 'field_officer' ? 'main/field-officer' : 'main/cashier', { title: 'Main' });
}

export const update_meteran: HandlerFunc = async (ctx: Context) => {
    const { idPelanggan, meteranAkhir } = ((await ctx.body) as Record<string, unknown>);
    if (typeof idPelanggan === 'string' && typeof meteranAkhir === 'string' && idPelanggan !== '' && meteranAkhir !== '') {
        const customCtx = (ctx as EJSContext);
        const user = customCtx.get('user') as ({ idKaryawan: number, username: string, password: string, role: string });
        const pelanggan = await Pelanggan.find(idPelanggan);
        if (pelanggan) {
            const newPenggunaan = new PenggunaanAir();
            newPenggunaan.tanggalPenggunaan = (new Date()).toISOString().split('T')[0];
            newPenggunaan.meteranAkhir = meteranAkhir;
            const lastPenggunaan = await PenggunaanAir.select('meteran_akhir').where('id_pelanggan', idPelanggan).orderBy('tanggal_penggunaan', 'desc').first();
            const meteranAwal = lastPenggunaan ? (lastPenggunaan.meteranAkhir || 0) : 0;
            if (meteranAkhir < meteranAwal) return { error: 'Meteran Akhir tidak valid' };
            newPenggunaan.meteranAwal = meteranAwal;
            newPenggunaan.idPelanggan = idPelanggan;
            newPenggunaan.idKaryawan = user.idKaryawan;
            await newPenggunaan.save();
            return { success: `Update Meteran dengan ID Pelanggan: ${idPelanggan} Berhasil!`, data: newPenggunaan }
        }
        return { error: 'ID Pelanggan tidak valid' }
    }
    return { error: 'ID Pelanggan dan Meteran Akhir harus diisi.' };
}

export const cek_tagihan: HandlerFunc = async (ctx: Context) => {
    const { idPelanggan } = ctx.queryParams;
    const customCtx = ctx as EJSContext;
    const customerData = await Pelanggan.leftJoin(Subkategori, Subkategori.field('id_subkategori'), Pelanggan.field('id_subkategori'))
        .leftJoin(Kategori, Kategori.field('id_kategori'), Subkategori.field('id_kategori'))
        .where(Pelanggan.field('id_pelanggan'), idPelanggan).first();
    if (!customerData) return { error: 'Tidak ditemukan pelanggan dengan ID tersebut' };
    try {
        const usagesNB = <Model[]>(await PenggunaanAir.select(PenggunaanAir.field('*'), Tagihan.field('id_tagihan'))
            .leftJoin(Tagihan, Tagihan.field('id_penggunaan'), PenggunaanAir.field('id_penggunaan'))
            .where({ 'tagihan.id_tagihan': null, 'penggunaan_air.id_pelanggan': idPelanggan }).get());
        const newBills = <Values[]>usagesNB.map(usage => {
            const usageDate = new Date(<string>usage.tanggalPenggunaan);
            usageDate.setDate(usageDate.getDate() + 20);
            return { idPelanggan: usage.idPelanggan, idPenggunaan: usage.idPenggunaan, status: Date.now() >= (usageDate.getTime()) ? 'Terlambat' : 'Belum Lunas' };
        });
        if (newBills.length > 0) await Tagihan.create(newBills);
        const unpaidBillsQuery = /*sql*/`
        SELECT
        tagihan.id_tagihan as idTagihan,
        tagihan.id_pelanggan as idPelanggan,
        tagihan.id_penggunaan as idPenggunaan,
        '${customerData.namaPelanggan}' as namaPelanggan,
        '${customerData.alamat}' as alamat,
        penggunaan_air.tanggal_penggunaan as tanggalPenggunaan,
        DATE_FORMAT(penggunaan_air.tanggal_penggunaan, '%b %Y', 'id_ID') as periode,
        penggunaan_air.meteran_awal as meteranAwal,
        penggunaan_air.meteran_akhir as meteranAkhir,
        (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal) as penggunaan,
        (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)*tarif.nilai as biaya,
        IF(status!='Terlambat', 0, (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)*tarif.nilai/10) as denda,
        DATE_ADD(penggunaan_air.tanggal_penggunaan, INTERVAL 20 DAY) as jatuhTempo,
        tagihan.tanggal_pembayaran as tanggalPembayaran,
        status
        FROM tagihan JOIN penggunaan_air ON penggunaan_air.id_penggunaan=tagihan.id_penggunaan
        JOIN tarif ON tarif.id_kategori=${customerData.idKategori} AND
        tarif.range_awal<=(penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal) AND
        IF(tarif.range_akhir=0, (penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal), tarif.range_akhir)>=(penggunaan_air.meteran_akhir-penggunaan_air.meteran_awal)
        WHERE penggunaan_air.id_pelanggan=${idPelanggan} AND (tagihan.status='Belum Lunas' OR tagihan.status='Terlambat')
        `
        const unpaidBills = <{ [key: string]: unknown }[]>await query(unpaidBillsQuery);
        unpaidBills.forEach(bill => {
            bill.denda = parseFloat(<string>bill.denda);
            bill.tanggalPenggunaan = new Date(<string>bill.tanggalPenggunaan);
            bill.jatuhTempo = new Date(<string>bill.jatuhTempo);
        })
        const pastUnpaidBills = unpaidBills.filter(bill => Date.now() >= (<Date>bill.jatuhTempo).getTime());
        for await (const bill of pastUnpaidBills) {
            if (bill.status === 'Belum Lunas') {
                bill.status = 'Terlambat';
                Tagihan.where({ idPenggunaan: <string>bill.idPenggunaan }).update('status', 'Terlambat');
            }
        }
        const currentBill = unpaidBills.find(bill => Date.now() < (<Date>bill.jatuhTempo).getTime());

        const billToPDF: { [key: string]: unknown }[] = [];
        if (currentBill) billToPDF.push(currentBill)
        pastUnpaidBills.forEach(bill => billToPDF.push(bill));

        if(!customCtx.get('isAuthenticated')) return { data: { pastBills: pastUnpaidBills, currentBill } };

        const pdfBase64 = await createTagihanPDFBase64(billToPDF);
        return { data: { pastBills: pastUnpaidBills, currentBill, pdf64: pdfBase64 } };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const bayar_tagihan: HandlerFunc = async (ctx: Context) => {
    const { idPelanggan } = <Record<string, unknown>>(await ctx.body);
    const pelangganData = await Pelanggan.where(Pelanggan.field('id_pelanggan'), <string>idPelanggan).first();
    try {
        if (!pelangganData) return { error: 'Tidak ditemukan pelanggan dengan ID tersebut' };
        const customCtx = (ctx as EJSContext);
        const user = customCtx.get('user') as ({ idKaryawan: number, username: string, password: string, role: string });
        await query(`UPDATE tagihan SET status='Lunas', tanggal_pembayaran=CURDATE(), id_karyawan='${user.idKaryawan}' WHERE id_pelanggan='${idPelanggan}' AND status!='Lunas'`);
        return { success: 'Pembayaran berhasil!' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}