import { Model, DataTypes } from 'denodb';
import PenggunaanAir from './PenggunaanAir.ts';
import Pelanggan from './Pelanggan.ts';
import Karyawan from "./Karyawan.ts";

export default class Tagihan extends Model {
    static table = 'tagihan';

    static fields = {
        idTagihan: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idPelanggan: DataTypes.INTEGER,
        idPenggunaan: DataTypes.INTEGER,
        tanggalPembayaran: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM,
            values: ['Belum Lunas', 'Lunas', 'Terlambat']
        },
        idKaryawan: DataTypes.INTEGER
    }

    static penggunaan() {
        return this.hasOne(PenggunaanAir);
    }

    static pelanggan() {
        return this.hasOne(Pelanggan);
    }

    static karyawan(){
        return this.hasOne(Karyawan);
    }
}