import { Model, DataTypes } from 'denodb';
import Subkategori from './Subkategori.ts';
import Tarif from './Tarif.ts';

export default class Kategori extends Model{
    static table = 'kategori';

    static fields = {
        idKategori: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        namaKategori: DataTypes.STRING
    }

    static subkategori(){
        return this.hasMany(Subkategori);
    }

    static tarif(){
        return this.hasMany(Tarif);
    }
}