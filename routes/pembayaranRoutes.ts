import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index, get_pembayaran } from './../controllers/pembayaranController.ts';

export default function(g: Group){
    g.get('/', index);
    g.get('/get', get_pembayaran);
}