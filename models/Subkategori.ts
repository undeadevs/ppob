import { Model, DataTypes } from 'denodb';
import Kategori from './Kategori.ts';
import Pelanggan from './Pelanggan.ts';

export default class Subkategori extends Model{
    static table = 'subkategori';

    static fields = {
        idSubkategori: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idKategori: DataTypes.INTEGER,
        namaSubkategori: DataTypes.STRING
    }

    static kategori(){
        return this.hasOne(Kategori);
    } 

    static subkategori(){
        return this.hasOne(Pelanggan);
    } 
}