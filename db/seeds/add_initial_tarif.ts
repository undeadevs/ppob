
import { AbstractSeed, Info, ClientMySQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";
import Dex from 'https://deno.land/x/dex@1.0.2/mod.ts';

export default class extends AbstractSeed<ClientMySQL> {
    /** Runs on seed */
    async run({ dialect }: Info): Promise<void> {
        const categoryNames = [
            { 'nama_kategori': 'Kelompok Sosial' },
            { 'nama_kategori': 'Kelompok Dasar I' },
            { 'nama_kategori': 'Kelompok Dasar II' },
            { 'nama_kategori': 'Kelompok Dasar III' },
        ]
        const subcategoryNames: { 'id_kategori': number, 'nama_subkategori': string }[] = [];
        const rates: { 'id_kategori': number, 'range_awal': number, 'range_akhir': number, 'nilai': number }[] = [];

        categoryNames.forEach((_names, index) => {
            const categoryId = index + 1;
            let ratesTemplate: { 'id_kategori': number, 'range_awal': number, 'range_akhir': number, 'nilai': number }[] = [
                { 'id_kategori': categoryId, 'range_awal': 0, 'range_akhir': 10, 'nilai': 0 },
                { 'id_kategori': categoryId, 'range_awal': 11, 'range_akhir': 20, 'nilai': 0 },
                { 'id_kategori': categoryId, 'range_awal': 21, 'range_akhir': 30, 'nilai': 0 },
                { 'id_kategori': categoryId, 'range_awal': 31, 'range_akhir': 0, 'nilai': 0 },
            ];
            switch (categoryId) {
                case 1:
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Ibadah',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Panti Asuhan',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Pesantren',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Yayasan Sosial',
                    });

                    ratesTemplate = [
                        {
                            'id_kategori': categoryId,
                            'range_awal': 0,
                            'range_akhir': 50,
                            'nilai': 2265
                        },
                        {
                            'id_kategori': categoryId,
                            'range_awal': 51,
                            'range_akhir': 100,
                            'nilai': 2548
                        },
                        {
                            'id_kategori': categoryId,
                            'range_awal': 101,
                            'range_akhir': 0,
                            'nilai': 3847
                        }
                    ];
                    break;
                case 2:
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Tempat Tinggal Kayu / Papan di jalan lingkungan / gang',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Sekolah Negeri / Swasta',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Sakit Pemerintah',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Sakit TNI / Polri',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Puskesmas',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Terminal Bus / Angkatan Umum',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'MCK Umum',
                    });

                    ratesTemplate[0]['nilai'] = 2573
                    ratesTemplate[1]['nilai'] = 3870
                    ratesTemplate[2]['nilai'] = 5144
                    ratesTemplate[3]['nilai'] = 7716
                    break;
                case 3:
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Tempat Tinggal Kayu / Papan di jalan utama',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Tempat Tinggal Permanen di jalan lingkungan / gang',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Asrama / Mess',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Susun',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Warung Sederhana',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Kost',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Bangsal',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Kantor Pemerintah / TNI / Polri',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Perguruan Tinggi Negeri / Swasta',
                    });

                    ratesTemplate[0]['nilai'] = 2831
                    ratesTemplate[1]['nilai'] = 4247
                    ratesTemplate[2]['nilai'] = 6914
                    ratesTemplate[3]['nilai'] = 8377
                    break;
                case 4:
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Tempat Tinggal Permanen di jalan utama',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Perumahan Hill, Villa, Residence, dan sebagainya',
                    });
                    subcategoryNames.push({
                        'id_kategori': categoryId,
                        'nama_subkategori': 'Rumah Makan Sedang',
                    });

                    ratesTemplate[0]['nilai'] = 3731
                    ratesTemplate[1]['nilai'] = 5596
                    ratesTemplate[2]['nilai'] = 10370
                    ratesTemplate[3]['nilai'] = 10855
                    break;
                default:
                    console.log('NO')
            }
            ratesTemplate.forEach(rate => rates.push(rate));
        })

        const categoryInsert = Dex({ client: dialect }).queryBuilder().insert(categoryNames.map((item, i)=>({'id_kategori': i+1, ...item}))).into('kategori').toString() as string;
        const subcategoryInsert = Dex({ client: dialect }).queryBuilder().insert(subcategoryNames.map((item, i)=>({'id_subkategori': i+1, ...item}))).into('subkategori').toString() as string;
        const ratesInsert = Dex({ client: dialect }).queryBuilder().insert(rates.map((item, i)=>({'id_tarif': i+1, ...item}))).into('tarif').toString() as string;
        try{
            await this.client.query(categoryInsert);
            await this.client.query(subcategoryInsert);
            await this.client.query(ratesInsert);
        }catch(_err){
            return;
        }
    }
}
