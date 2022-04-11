import { Model, DataTypes } from 'denodb';
import Subkategori from './Subkategori.ts';
import PenggunaanAir from './PenggunaanAir.ts';
import Tagihan from './Tagihan.ts';

export default class Pelanggan extends Model{
    static table = 'pelanggan';

    static fields = {
        idPelanggan: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            length: 7
        },
        namaPelanggan: DataTypes.STRING,
        alamat: DataTypes.TEXT,
        idSubkategori: DataTypes.INTEGER
    }

    static subkategori(){
        return this.hasOne(Subkategori);
    } 

    static penggunaan(){
        return this.hasMany(PenggunaanAir);
    }

    static tagihan(){
        return this.hasMany(Tagihan);
    }
}