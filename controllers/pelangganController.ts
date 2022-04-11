import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { MySQLClient } from "denodb/deps.ts";
import { db, Pelanggan, Kategori, Subkategori } from './../db.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    await ctx.render('pelanggan/index', { title: 'Daftar Pelanggan' });
}

export const get_pelanggan: HandlerFunc = async (ctx: Context) => {
    const { search } = ctx.queryParams;
    const currentPage = parseInt(ctx.queryParams.page) || 1;
    const limit = 10;
    const offset = limit*(currentPage-1);
    if (typeof search === 'string' && search !== '') {
        const pelangganFields = ['id_pelanggan', 'nama_pelanggan', 'alamat', 'nama_subkategori'];
        const conditions: string[] = [];
        const searchWords = search.split(/\b/g).filter(str => str !== ' ');
        pelangganFields.forEach(pfield => {
            searchWords.forEach(sword => {
                conditions.push(`${pfield} LIKE '%${sword}%'`);
            })
        })
        await db.getConnector()._makeConnection();
        const count = (await (<MySQLClient>db.getClient())['query'](`SELECT COUNT(*) AS 'count' FROM pelanggan LEFT JOIN subkategori ON subkategori.id_subkategori=pelanggan.id_subkategori WHERE ${conditions.join(' OR ')}`))[0]['count'];
        const pageCount = Math.ceil(count / limit);
        const hasPrev = currentPage > 1;
        const hasNext = pageCount - currentPage > 0;
        const data = await (<MySQLClient>db.getClient())['query'](`SELECT id_pelanggan AS idPelanggan, nama_pelanggan AS namaPelanggan, alamat AS alamat, nama_subkategori AS namaSubkategori FROM pelanggan LEFT JOIN subkategori ON subkategori.id_subkategori=pelanggan.id_subkategori HAVING ${conditions.join(' OR ')} LIMIT ${limit} OFFSET ${offset}`);
        await db.close();
        return { count, pageCount, currentPage, hasPrev, hasNext, data };
    }
    const count = await Pelanggan.leftJoin(Subkategori, Subkategori.field('id_subkategori'), Pelanggan.field('id_subkategori')).count();
    const pageCount = Math.ceil(count / limit);
    const hasPrev = currentPage > 1;
    const hasNext = pageCount - currentPage > 0;
    const data = await Pelanggan.select(Pelanggan.field('id_pelanggan'), Pelanggan.field('nama_pelanggan'), 'alamat', Subkategori.field('nama_subkategori')).leftJoin(Subkategori, Subkategori.field('id_subkategori'), Pelanggan.field('id_subkategori')).limit(limit).offset(offset).get();
    return { count, pageCount, currentPage, hasPrev, hasNext, data };
}

export const create_pelanggan: HandlerFunc = async (ctx: Context) => {
    try {
        const kategoriData = await Kategori.all();
        const subkategoriData = await Subkategori.all();
        await ctx.render('pelanggan/register', { title: 'Register Pelanggan', kategoriData, subkategoriData });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const store_pelanggan: HandlerFunc = async (ctx: Context) => {
    const { namaPelanggan, alamat, idSubkategori } = ((await ctx.body) as Record<string, unknown>);
    if (typeof namaPelanggan === 'string' && typeof alamat === 'string' && typeof idSubkategori === 'string' && namaPelanggan !== '' && alamat !== '' && idSubkategori !== '') {
        const newPelanggan = new Pelanggan();
        let newId = Math.floor(Math.random() * (10 ** 7 - 1)) + 1;
        while (await Pelanggan.find(newId)) {
            newId = Math.floor(Math.random() * (10 ** 7 - 1)) + 1;
        }
        newPelanggan.idPelanggan = newId;
        newPelanggan.namaPelanggan = namaPelanggan;
        newPelanggan.alamat = alamat;
        newPelanggan.idSubkategori = parseInt(idSubkategori);
        await newPelanggan.save();
        return { success: 'Pelanggan berhasil registrasi!', redirect: '/pelanggan' };
    }
    return { error: 'Nama, Alamat, Kategori harus diisi.' };
}

export const edit_pelanggan: HandlerFunc = async (ctx: Context) => {
    try {
        const existingPelanggan = await Pelanggan.find(ctx.params.id);
        if (!existingPelanggan) return { error: 'Pelanggan dengan ID tersebut tidak ditemukan.' };
        const kategoriData = await Kategori.all();
        const subkategoriData = await Subkategori.all();
        await ctx.render('pelanggan/edit', { title: 'Edit Pelanggan', pelangganData: existingPelanggan, kategoriData, subkategoriData });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const update_pelanggan: HandlerFunc = async (ctx: Context) => {
    try {
        const idPelanggan = ctx.params.id;
        const existingPelanggan = await Pelanggan.find(idPelanggan);
        if (!existingPelanggan) return { error: 'Pelanggan dengan ID tersebut tidak ditemukan.' };
        const { namaPelanggan, alamat, idSubkategori } = ((await ctx.body) as Record<string, unknown>);
        if (typeof namaPelanggan === 'string' && typeof alamat === 'string' && typeof idSubkategori === 'string' && namaPelanggan !== '' && alamat !== '' && idSubkategori !== '') {
            // existingPelanggan.namaPelanggan = namaPelanggan;
            // existingPelanggan.alamat = alamat;
            // existingPelanggan.idSubkategori = idSubkategori;
            // await existingPelanggan.update();
            await Pelanggan.where({idPelanggan: idPelanggan}).update({namaPelanggan: namaPelanggan, alamat: alamat, idSubkategori: idSubkategori});
            return {success: `Pelanggan dengan ID: ${idPelanggan} berhasil di update!`, redirect: '/pelanggan'};
        }
        return { error: 'Nama, Alamat, Subategori harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const delete_pelanggan: HandlerFunc = async (ctx: Context) => {
    try {
        const idPelanggan = ctx.params.id;
        const existingPelanggan = await Pelanggan.find(idPelanggan);
        if (!existingPelanggan) return { error: 'Pelanggan dengan ID tersebut tidak ditemukan.' };
        await Pelanggan.where({idPelanggan: idPelanggan}).delete();
        return {success: `Berhasil hapus Pelanggan dengan ID: ${idPelanggan}`, redirect: '/pelanggan'}
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}