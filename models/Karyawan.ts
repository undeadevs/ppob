import { Model, DataTypes } from 'denodb';
import PenggunaanAir from './PenggunaanAir.ts';
import Tagihan from './Tagihan.ts';

export default class Karyawan extends Model {
    static table = 'karyawan';

    static fields = {
        idKaryawan: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.TEXT,
        role: { type: DataTypes.ENUM, values: ['administrator', 'field_officer', 'cashier'] }
    }

    static penggunaan(){
        return this.hasOne(PenggunaanAir);
    }

    static tagihan(){
        return this.hasOne(Tagihan);
    }
}