import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index, get_pelanggan, create_pelanggan, store_pelanggan, edit_pelanggan, update_pelanggan, delete_pelanggan } from './../controllers/pelangganController.ts';

export default function(g: Group){
    g.get('/', index);
    g.get('/get', get_pelanggan);
    g.get('/register', create_pelanggan);
    g.post('/register', store_pelanggan);
    g.get('/:id', edit_pelanggan);
    g.put('/:id', update_pelanggan);
    g.delete('/:id', delete_pelanggan);
}