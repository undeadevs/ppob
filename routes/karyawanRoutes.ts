import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index, get_karyawan, edit_karyawan, update_karyawan, delete_karyawan } from './../controllers/karyawanController.ts';

export default function(g: Group){
    g.get('/', index);
    g.get('/get', get_karyawan);
    g.get('/:id', edit_karyawan);
    g.put('/:id', update_karyawan);
    g.delete('/:id', delete_karyawan);
}