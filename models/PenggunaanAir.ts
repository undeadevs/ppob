import { Model, DataTypes } from 'denodb';
import Pelanggan from './Pelanggan.ts';
import Tagihan from './Tagihan.ts';
import Karyawan from './Karyawan.ts';

export default class PenggunaanAir extends Model{
    static table = 'penggunaan_air';

    static fields = {
        idPenggunaan: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tanggalPenggunaan: DataTypes.DATE,
        idPelanggan: DataTypes.INTEGER,
        meteranAwal: DataTypes.INTEGER,
        meteranAkhir: DataTypes.INTEGER,
        idKaryawan: DataTypes.INTEGER
    }

    static pelanggan(){
        return this.hasOne(Pelanggan);
    } 

    static tagihan(){
        return this.hasOne(Tagihan);
    }

    static karyawan(){
        return this.hasOne(Karyawan);
    }
}