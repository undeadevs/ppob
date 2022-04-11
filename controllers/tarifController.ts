import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { EJSContext } from "../lib/abc_ejs/mod.ts";
import { db, Kategori, Subkategori, Tarif } from './../db.ts';

export const index: HandlerFunc = async (ctx: Context) => {
    const customCtx = (ctx as EJSContext);
    await ctx.render('tarif/index', { title: 'Daftar Tarif' });
}

export const get_tarif: HandlerFunc = async (ctx: Context) => {
    const kategoriData = await Kategori.all();
    const subkategoriData = await Subkategori.all();
    const tarifData = await Tarif.all();
    return { data: { kategori: kategoriData, subkategori: subkategoriData, tarif: tarifData } };
}

export const create_tarif: HandlerFunc = async (ctx: Context) => {
    try {
        await ctx.render('tarif/create', { title: 'Tambah Tarif' });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const store_tarif: HandlerFunc = async (ctx: Context) => {
    try {
        const { namaKelompok, subkategori, range } = ((await ctx.body) as Record<string, unknown>);
        const validArr = [];
        validArr.push(namaKelompok && namaKelompok !== '');
        validArr.push(Array.isArray(subkategori));
        if (Array.isArray(subkategori)) validArr.push(subkategori.length > 0);
        validArr.push(Array.isArray(range));
        if (Array.isArray(range)) validArr.push(range.length > 0);
        if (validArr.every(v => v)) {
            const idKategori = (await Kategori.create({ namaKategori: <string>namaKelompok })).lastInsertId;
            await Subkategori.create((<string[]>subkategori).map(subname => ({ idKategori: <number>idKategori, namaSubkategori: subname })));
            await Tarif.create((<{ rangeAwal: number, rangeAkhir: number, nilai: number }[]>range).map(robj => ({ idKategori: <number>idKategori, ...robj })));
            return { success: 'Tarif berhasil ditambahkan!', redirect: '/tarif' };
        }
        return { error: 'Ada kesalahan dalam penginputan' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const edit_tarif: HandlerFunc = async (ctx: Context) => {
    try {
        const idKategori = ctx.params.id;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return { error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.' };
        const subkategoriData = await Subkategori.where('id_kategori', idKategori).get();
        const tarifData = await Tarif.where('id_kategori', idKategori).get();
        await ctx.render('tarif/edit', { title: 'Edit Tarif', kategoriData: existingKategori, subkategoriData, tarifData });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const update_tarif: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori} = ctx.params;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return { error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.' };
        const { namaKelompok } = ((await ctx.body) as Record<string, unknown>);
        if (typeof namaKelompok === 'string' && namaKelompok !== '') {
            await Kategori.where('id_kategori', idKategori).update({namaKategori: namaKelompok});
            return { success: `Kelompok Tarif dengan ID: ${idKategori} berhasil di update!`, redirect: `/tarif` };
        }
        return { error: 'Nama Kelompok harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const delete_tarif: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori} = ctx.params;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return { error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.' };
        await Kategori.where({idKategori: idKategori}).delete();
        return {success: `Kelompok Tarif dengan ID: ${idKategori} di hapus!`, redirect: `/tarif`}
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

/* SUBKATEGORI */

export const create_subkategori: HandlerFunc = async (ctx: Context) => {
    try {
        const idKategori = ctx.params.id;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return {error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.'};
        await ctx.render('tarif/subkategori/create', { title: 'Tambah Subkategori' });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const store_subkategori: HandlerFunc = async (ctx: Context) => {
    try {
        const idKategori = ctx.params.id;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return { error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.' };
        const { namaSubkategori } = ((await ctx.body) as Record<string, unknown>);
        if (typeof namaSubkategori === 'string' && namaSubkategori !== '') {
            const newSubkategori = new Subkategori();
            newSubkategori.idKategori = idKategori;
            newSubkategori.namaSubkategori = namaSubkategori;
            await newSubkategori.save();
            return { success: 'Subkategori berhasil ditambahkan!', redirect: `/tarif/${idKategori}` };
        }
        return { error: 'Nama Subkategori harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const edit_subkategori: HandlerFunc = async (ctx: Context) => {
    try{
        const {id: idKategori, idSubkategori} = ctx.params;
        const existingSubkategori = await Subkategori.find(idSubkategori);
        if (!existingSubkategori) return { error: 'Subkategori Tarif dengan ID tersebut tidak ditemukan.' };
        await ctx.render('tarif/subkategori/edit', { title: 'Edit Subkategori', subkategoriData: existingSubkategori });
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const update_subkategori: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori, idSubkategori} = ctx.params;
        const existingSubkategori = await Subkategori.find(idSubkategori);
        if (!existingSubkategori) return { error: 'Subkategori Tarif dengan ID tersebut tidak ditemukan.' };
        const { namaSubkategori } = ((await ctx.body) as Record<string, unknown>);
        if (typeof namaSubkategori === 'string' && namaSubkategori !== '') {
            await Subkategori.where('id_subkategori', idSubkategori).update({namaSubkategori});
            return { success: `Subkategori dengan ID: ${idSubkategori} berhasil di update!`, redirect: `/tarif/${idKategori}` };
        }
        return { error: 'Nama Subkategori harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const delete_subkategori: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori, idSubkategori} = ctx.params;
        const existingSubkategori = await Subkategori.find(idSubkategori);
        if (!existingSubkategori) return { error: 'Subkategori Tarif dengan ID tersebut tidak ditemukan.' };
        await Subkategori.where({idSubkategori: idSubkategori}).delete();
        return {success: `Subkategori dengan ID: ${idSubkategori} di hapus!`, redirect: `/tarif/${idKategori}`}
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

/* RANGE */

export const create_range: HandlerFunc = async (ctx: Context) => {
    try {
        const idKategori = ctx.params.id;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return {error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.'};
        await ctx.render('tarif/range/create', { title: 'Tambah Range' });
    } catch (err) {
        console.error(err);
        return 'Terjadi kesalahan.';
    }
}

export const store_range: HandlerFunc = async (ctx: Context) => {
    try {
        const idKategori = ctx.params.id;
        const existingKategori = await Kategori.find(idKategori);
        if (!existingKategori) return { error: 'Kelompok Tarif dengan ID tersebut tidak ditemukan.' };
        const { rangeAwal, rangeAkhir, nilai } = ((await ctx.body) as Record<string, unknown>);
        if (typeof rangeAwal === 'string' && typeof rangeAkhir === 'string' && typeof nilai === 'string' &&
            rangeAwal !== '' && rangeAkhir !== '' && nilai !== '') {
            const newTarif = new Tarif();
            newTarif.idKategori = idKategori;
            newTarif.rangeAwal = parseFloat(rangeAwal);
            newTarif.rangeAkhir = parseFloat(rangeAkhir);
            newTarif.nilai = parseFloat(nilai);
            await newTarif.save();
            return { success: 'Range berhasil ditambahkan!', redirect: `/tarif/${idKategori}` };
        }
        return { error: 'Range Awal, Range Akhir, Nilai harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const edit_range: HandlerFunc = async (ctx: Context) => {
    try{
        const {id: idKategori, idRange} = ctx.params;
        const existingTarif = await Tarif.find(idRange);
        if (!existingTarif) return { error: 'Range Tarif dengan ID tersebut tidak ditemukan.' };
        await ctx.render('tarif/range/edit', { title: 'Edit Range', tarifData: existingTarif });
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const update_range: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori, idRange} = ctx.params;
        const existingTarif = await Tarif.find(idRange);
        if (!existingTarif) return { error: 'Range Tarif dengan ID tersebut tidak ditemukan.' };
        const { rangeAwal, rangeAkhir, nilai } = ((await ctx.body) as Record<string, unknown>);
        if (typeof rangeAwal === 'string' && typeof rangeAkhir === 'string' && typeof nilai === 'string' &&
            rangeAwal !== '' && rangeAkhir !== '' && nilai !== '') {
            await Tarif.where('id_tarif', idRange).update({rangeAwal: parseFloat(rangeAwal), rangeAkhir: parseFloat(rangeAkhir), nilai: parseFloat(nilai)});
            return { success: `Range dengan ID: ${idRange} berhasil di update!`, redirect: `/tarif/${idKategori}` };
        }
        return { error: 'Range Awal, Range Akhir, Nilai harus diisi.' };
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}

export const delete_range: HandlerFunc = async (ctx: Context) => {
    try {
        const {id: idKategori, idRange} = ctx.params;
        const existingTarif = await Tarif.find(idRange);
        if (!existingTarif) return { error: 'Range Tarif dengan ID tersebut tidak ditemukan.' };
        await Tarif.where({idTarif: idRange}).delete();
        return {success: `Range dengan ID: ${idRange} di hapus!`, redirect: `/tarif/${idKategori}`}
    } catch (err) {
        console.error(err);
        return { error: 'Terjadi kesalahan.' };
    }
}