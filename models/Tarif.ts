import { Model, DataTypes } from 'denodb';
import Kategori from './Kategori.ts';

export default class Tarif extends Model{
    static table = 'tarif';

    static fields = {
        idTarif: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idKategori: DataTypes.INTEGER,
        rangeAwal: DataTypes.INTEGER,
        rangeAkhir: DataTypes.INTEGER,
        nilai: DataTypes.INTEGER
    }

    static kategori(){
        return this.hasOne(Kategori);
    } 
}