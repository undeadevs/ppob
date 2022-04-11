import { Group } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { index } from './../controllers/dashboardController.ts';

export default function(g: Group){
    g.get('/dashboard', index);
}