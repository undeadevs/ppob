import { Application, Context, MiddlewareFunc } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { MemoryStore } from './lib/abc_session/mod.ts';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid/mod.ts"
import { EJSContext } from "./lib/abc_ejs/mod.ts";

import dashboardRoutes from './routes/dashboardRoutes.ts'
import mainRoutes from './routes/mainRoutes.ts'
import pelangganRoutes from './routes/pelangganRoutes.ts'
import karyawanRoutes from './routes/karyawanRoutes.ts'
import penggunaanRoutes from "./routes/penggunaanRoutes.ts";
import pembayaranRoutes from "./routes/pembayaranRoutes.ts";
import tarifRoutes from './routes/tarifRoutes.ts'

import { Karyawan } from './db.ts';

Deno.env.set('admCode', `ADM@${nanoid()}`);
Deno.env.set('fdoCode', `FDO@${nanoid()}`);
Deno.env.set('cshCode', `CSH@${nanoid()}`);

const app = new Application();

app.static('/', '/public');

app.pre(((): MiddlewareFunc => {
    const newStore = new MemoryStore();
    return (next) => {
        return (ctx: Context) => {
            const ejsCtx = new EJSContext(ctx, { secret: <string>Deno.env.get('SESSION_SECRET')!, store: newStore });
            return next(ejsCtx);
        }
    };
})())

app.pre((next) => {
    return (ctx: Context) => {
        if(ctx.method==='GET'){
            const acceptHeader = ctx.request.headers.get('Accept');
            if(acceptHeader){
                if(acceptHeader==="image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" && ctx.path.includes('.')) ctx.response.headers.set('Cache-Control', 'public, max-age=31536000');
            }
        }
        return next(ctx);
    }
})

app.use((next) => {
    const generateCSRFToken = async (secret: string) => {
        return await bcrypt.hash(secret);
    }

    const verifyCSRFToken = async (token: string, secret: string) => {
        return await bcrypt.compare(secret, token);
    }

    return async (ctx: Context) => {
        const customCtx = (ctx as EJSContext);
        if (ctx.method === 'GET') {
            if (!ctx.path.includes('.')) {
                if (!customCtx.session.csrfToken) customCtx.session.csrfToken = await generateCSRFToken(<string>customCtx.sessionId);
                customCtx.passCurrent('csrfToken', customCtx.session.csrfToken);
            }
        } else {
            const csrfToken = ((await customCtx.body) as Record<string, unknown>).csrfToken;
            if (!(await verifyCSRFToken(<string>csrfToken, <string>customCtx.sessionId)) || !customCtx.session.csrfToken) return { error: 'CSRF Token Invalid.' }
            customCtx.session.csrfToken = await generateCSRFToken(<string>customCtx.sessionId);
        }
        return next(customCtx);
    }
})

app.use((next) => {
    return (ctx: Context) => {
        const customCtx = (ctx as EJSContext);
        if (customCtx.session.user) customCtx.set('user', customCtx.session.user);
        customCtx.set('isAuthenticated', !(!customCtx.session.user));
        customCtx.passCurrent('user', customCtx.session.user);
        return next(customCtx);
    }
})

// app.use((next)=>{
//     return (ctx: Context)=>{
//         const customCtx = (ctx as EJSContext);
//         const isAuthenticated = <boolean>customCtx.get('isAuthenticated');
//         if(!isAuthenticated) retu
//     }
// })

app.use((next) => {
    return (ctx: Context) => {
        const customCtx = (ctx as EJSContext);
        const user = customCtx.get('user') as ({ id_karyawan: number, username: string, password: string, role: 'administrator' | 'field_officer' | 'cashier' } | null);
        if (customCtx.path.includes('.') || customCtx.path === '/' || customCtx.path === '/cek-tagihan') return next(customCtx);
        if (customCtx.get('isAuthenticated') && user) {
            if (customCtx.path === '/login' || customCtx.path === '/register') return customCtx.redirect('/dashboard');
            if (/(pelanggan|karyawan|tarif)/g.test(customCtx.path) && user.role !== 'administrator') return customCtx.redirect('/dashboard');
            if (/(tagihan|main|meteran)/g.test(customCtx.path) && user.role === 'administrator') return customCtx.redirect('/dashboard');
            if (/penggunaan/g.test(customCtx.path) && (user.role !== 'administrator' && user.role !== 'field_officer')) return customCtx.redirect('/dashboard');
            if (/penggunaan\/(?!get)/g.test(customCtx.path) && user.role !== 'field_officer') return customCtx.redirect('/dashboard');
            if (/pembayaran/g.test(customCtx.path) && (user.role !== 'administrator' && user.role !== 'cashier')) return customCtx.redirect('/dashboard');
        } else {
            if (customCtx.path !== '/login' && customCtx.path !== '/register') {
                return customCtx.redirect('/login');
            }
        }
        return next(customCtx);
    }
})

app.get('/', async (ctx: Context) => {
    // const customCtx = (ctx as EJSContext);
    await ctx.render('front', { title: 'Frontpage' });
})

app.get('/login', async (ctx: Context) => {
    // const customCtx = (ctx as EJSContext);
    await ctx.render('login', { title: 'Login' })
})

app.post('/login', async (ctx: Context) => {
    try {
        const customCtx = (ctx as EJSContext);
        const { username, password } = ((await ctx.body) as Record<string, unknown>);
        if (typeof username === 'string' && typeof password === 'string' && username !== '' && password !== '') {
            const karyawan = await Karyawan.where({ username }).first();
            if (karyawan) {
                const passwordMatched = await bcrypt.compare(password, karyawan.password as string);
                if (passwordMatched) {
                    customCtx.session.user = karyawan;
                    return { success: 'Login berhasil! Mohon tunggu...', redirect: '/dashboard' };
                }
            }
            return { error: 'Username atau Password salah.' };
        } else {
            return { error: 'Username dan Password harus diisi.' };
        }
    } catch (err) {
        console.error(err);
        return { error: 'Something went wrong.' }
    }
})

app.delete('/logout', (ctx: Context) => {
    const customCtx = (ctx as EJSContext);
    const user = customCtx.get('user') as ({ id_karyawan: number, username: string, password: string, role: string } | null);
    if (user) {
        customCtx.session.user = null;
        return { success: 'Logout Berhasil!', redirect: '/login' };
    }
})

app.get('/register', async (ctx: Context) => {
    await ctx.render('register', { title: 'Register' })
})

app.post('/register', async (ctx: Context) => {
    try {
        const { regCode, username, password } = ((await ctx.body) as Record<string, unknown>);
        if (typeof username === 'string' && typeof password === 'string' && username !== '' && password !== '') {
            if (await Karyawan.where('username', username).first()) return { error: 'Sudah ada akun dengan Username tersebut.' };
            const newKaryawan = new Karyawan();
            newKaryawan.username = username;
            newKaryawan.password = await bcrypt.hash(password);

            switch (regCode) {
                case Deno.env.get('admCode'):
                    newKaryawan.role = 'administrator';
                    Deno.env.set('admCode', `ADM@${nanoid()}`);
                    break;
                case Deno.env.get('fdoCode'):
                    newKaryawan.role = 'field_officer';
                    Deno.env.set('fdoCode', `FDO@${nanoid()}`);
                    break;
                case Deno.env.get('cshCode'):
                    newKaryawan.role = 'cashier';
                    Deno.env.set('cshCode', `CSH@${nanoid()}`);
                    break;
                default:
                    return { error: 'Kode Registrasi salah.' }
            }
            await newKaryawan.save();
            const customCtx = (ctx as EJSContext);
            customCtx.session.user = newKaryawan;
            return { success: 'Registrasi berhasil! Mohon tunggu...', redirect: '/dashboard' };
        } else {
            return { error: 'Username dan Password harus diisi.' };
        }
    } catch (err) {
        console.error(err);
        return { error: 'Ada kesalahan.' }
    }
})

dashboardRoutes(app.group(''));
mainRoutes(app.group(''));
pelangganRoutes(app.group('pelanggan'));
karyawanRoutes(app.group('karyawan'));
penggunaanRoutes(app.group('penggunaan'));
pembayaranRoutes(app.group('pembayaran'));
tarifRoutes(app.group('tarif'));

const port = parseInt(Deno.env.get('PORT')!) || 2509;
app.start({ port: port });
console.log(`listening on port ${port}`);