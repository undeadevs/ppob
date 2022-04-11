import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index, get_penggunaan, perbaiki_get, perbaiki_put } from './../controllers/penggunaanController.ts';

export default function(g: Group){
    g.get('/', index);
    g.get('/get', get_penggunaan);
    g.get('/perbaiki', perbaiki_get);
    g.put('/perbaiki', perbaiki_put);
    // g.get('/register', create_pelanggan);
    // g.post('/register', store_pelanggan);
    // g.get('/:id', edit_pelanggan);
    // g.put('/:id', update_pelanggan);
    // g.delete('/:id', delete_pelanggan);
}