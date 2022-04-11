import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { MySQLClient } from "denodb/deps.ts";
import { db, Karyawan } from './../db.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    await ctx.render('karyawan/index', { title: 'Daftar Karyawan', regCodes: { administrator: Deno.env.get('admCode'), fieldOfficer: Deno.env.get('fdoCode'), cashier: Deno.env.get('cshCode') } });
}

export const get_karyawan: HandlerFunc = async (ctx: Context) => {
    const { search } = ctx.queryParams;
    const currentPage = parseInt(ctx.queryParams.page) || 1;
    const limit = 10;
    const offset = limit * (currentPage - 1);
    if (typeof search === 'string' && search !== '') {
        const pelangganFields = ['username', 'role'];
        const conditions: string[] = [];
        const searchWords = search.split(/\b/g).filter(str => str !== ' ');
        pelangganFields.forEach(pfield => {
            searchWords.forEach(sword => {
                conditions.push(`${pfield} LIKE '%${sword}%'`);
            })
        })
        await db.getConnector()._makeConnection();
        const count = (await (<MySQLClient>db.getClient())['query'](`SELECT COUNT(*) AS 'count' FROM karyawan WHERE ${conditions.join(' OR ')}`))[0]['count'];
        const pageCount = Math.ceil(count / limit);
        const hasPrev = currentPage > 1;
        const hasNext = pageCount - currentPage > 0;
        const data = await (<MySQLClient>db.getClient())['query'](`SELECT id_karyawan AS idKaryawan, username, role FROM karyawan HAVING ${conditions.join(' OR ')} LIMIT ${limit} OFFSET ${offset}`);
        await db.close();
        return { count, pageCount, currentPage, hasPrev, hasNext, data };
    }
    const count = await Karyawan.count();
    const pageCount = Math.ceil(count / limit);
    const hasPrev = currentPage > 1;
    const hasNext = pageCount - currentPage > 0;
    const data = await Karyawan.select(Karyawan.field('id_karyawan'), Karyawan.field('username'), Karyawan.field('role')).limit(limit).offset(offset).get();
    return { count, pageCount, currentPage, hasPrev, hasNext, data };
}

export const create_karyawan: HandlerFunc = async (ctx: Context) => {
    // try {
    //     const customCtx = (ctx as EJSContext);
    //     const kategoriData = await Kategori.all();
    //     const subkategoriData = await Subkategori.all();
    //     await ctx.render('pelanggan/register', { title: 'Register Pelanggan', kategoriData, subkategoriData });
    // } catch (err) {
    //     console.error(err);
    //     return 'Terjadi kesalahan.';
    // }
}

export const store_karyawan: HandlerFunc = async (ctx: Context) => {
    // const { namaPelanggan, alamat, idSubkategori } = ((await ctx.body) as Record<string, unknown>);
    // if (typeof namaPelanggan === 'string' && typeof alamat === 'string' && typeof idSubkategori === 'string' && namaPelanggan !== '' && alamat !== '' && idSubkategori !== '') {
    //     const newPelanggan = new Pelanggan();
    //     let newId = Math.floor(Math.random() * (10 ** 7 - 1)) + 1;
    //     while (await Pelanggan.find(newId)) {
    //         newId = Math.floor(Math.random() * (10 ** 7 - 1)) + 1;
    //     }
    //     newPelanggan.idPelanggan = newId;
    //     newPelanggan.namaPelanggan = namaPelanggan;
    //     newPelanggan.alamat = alamat;
    //     newPelanggan.idSubkategori = parseInt(idSubkategori);
    //     await newPelanggan.save();
    //     return { success: 'Pelanggan berhasil registrasi!', redirect: '/pelanggan' };
    // }
    // return { error: 'Nama, Alamat, Kategori harus diisi.' };
}

export const edit_karyawan: HandlerFunc = async (ctx: Context) => {
    try {
        const existingKaryawan = await Karyawan.find(ctx.params.id);
        if (!existingKaryawan) return 'Karyawan dengan ID tersebut tidak ditemukan.'
        await ctx.render('karyawan/edit', { title: 'Edit Karyawan', karyawanData: existingKaryawan });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const update_karyawan: HandlerFunc = async (ctx: Context) => {
    try {
        const idKaryawan = ctx.params.id;
        const existingKaryawan = await Karyawan.find(idKaryawan);
        if (!existingKaryawan) return { error: 'Karyawan dengan ID tersebut tidak ditemukan.' };
        const { username, role, password } = ((await ctx.body) as Record<string, unknown>);
        if (typeof username === 'string' && typeof role === 'string' && username !== '' && role !== '') {
            // if(typeof password='string')
            return {success: `Karyawan dengan ID: ${idKaryawan} berhasil di update!`, redirect: '/karyawan'};
        }
        return { error: 'Username, Role harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const delete_karyawan: HandlerFunc = async (ctx: Context) => {
    try {
        const idKaryawan = ctx.params.id;
        const existingKaryawan = await Karyawan.find(idKaryawan);
        if (!existingKaryawan) return { error: 'Karyawan dengan ID tersebut tidak ditemukan.' };
        await Karyawan.where({idKaryawan: idKaryawan}).delete();
        return {success: `Berhasil hapus Karyawan dengan ID: ${idKaryawan}`, redirect: '/karyawan'}

    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}