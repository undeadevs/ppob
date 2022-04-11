import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { EJSContext } from './../lib/abc_ejs/mod.ts';
import { db, query, Pelanggan, PenggunaanAir, Kategori, Subkategori, Tarif, Tagihan } from './../db.ts';
import { Model } from "denodb";
import { Values } from "denodb/lib/data-types.ts";

export const index: HandlerFunc = async (ctx: Context) => {
    const customCtx = (ctx as EJSContext);
    const user = <{[key: string]: unknown}|null|undefined>customCtx.get('user');
    if(typeof user==='object' && user!==null){
        if(user.role!=='administrator') await ctx.render('dashboard', { title: 'Dashboard' });
    }
    const pelangganCount = await Pelanggan.count();
    const pelangganBayarCount = <number>(await Pelanggan.join(Tagihan, Tagihan.field('id_pelanggan'), Pelanggan.field('id_pelanggan')).where(Tagihan.field('status'), 'Lunas').groupBy(Pelanggan.field('id_pelanggan')).get()).length;
    const pelangganNunggakCount = (<{count: number}[]>(await query(`SELECT COUNT(*) as count FROM pelanggan WHERE id_pelanggan IN (SELECT penggunaan_air.id_pelanggan FROM penggunaan_air LEFT JOIN tagihan ON tagihan.id_penggunaan=penggunaan_air.id_penggunaan WHERE CURDATE()>=DATE_ADD(tanggal_penggunaan, INTERVAL 20 DAY) AND (tagihan.status='Terlambat' OR tagihan.status IS NULL))`)))[0].count;
    const pelangganBelumBayarCount = pelangganCount-pelangganBayarCount-pelangganNunggakCount;
    await ctx.render('dashboard', { title: 'Dashboard', data: {unpaid: pelangganBelumBayarCount, late: pelangganNunggakCount, paid: pelangganBayarCount, all: pelangganCount} });
}