import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index, update_meteran, cek_tagihan, bayar_tagihan } from './../controllers/mainController.ts';

export default function(g: Group){
    g.get('/main', index);
    g.post('/update-meteran', update_meteran);
    g.get('/cek-tagihan', cek_tagihan);
    g.post('/bayar-tagihan', bayar_tagihan);
}