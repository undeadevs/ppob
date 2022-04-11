import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import {
        index, get_tarif, create_tarif, store_tarif, edit_tarif, update_tarif, delete_tarif,
        create_subkategori, store_subkategori, edit_subkategori, update_subkategori, delete_subkategori,
        create_range, store_range, edit_range, update_range, delete_range
        } from './../controllers/tarifController.ts';

export default function(g: Group){
    g.get('/', index);
    g.get('/get', get_tarif);
    g.get('/add', create_tarif);
    g.post('/add', store_tarif);
    g.get('/:id', edit_tarif);
    g.put('/:id', update_tarif);
    g.delete('/:id', delete_tarif);

    g.get('/:id/subkategori/add', create_subkategori);
    g.post('/:id/subkategori/add', store_subkategori);
    g.get('/:id/subkategori/:idSubkategori', edit_subkategori);
    g.put('/:id/subkategori/:idSubkategori', update_subkategori);
    g.delete('/:id/subkategori/:idSubkategori', delete_subkategori);

    g.get('/:id/range/add', create_range);
    g.post('/:id/range/add', store_range);
    g.get('/:id/range/:idRange', edit_range);
    g.put('/:id/range/:idRange', update_range);
    g.delete('/:id/range/:idRange', delete_range);
}