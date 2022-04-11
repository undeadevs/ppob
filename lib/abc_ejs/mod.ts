import { Status } from "https://deno.land/std@0.116.0/http/http_status.ts";
import { resolve } from "https://deno.land/std@0.116.0/path/mod.ts";
import { Context } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { Params, include, extend, renderFile } from "https://raw.githubusercontent.com/undeadevs/dejs/master/mod.ts";
// import { Params, include, extend, renderFile } from "../../../../Github/dejs/mod.ts";
import { SessionContext, SessionOptions } from "../abc_session/mod.ts";

export class EJSContext extends SessionContext {
    vroot: string;
    readonly redirectedFrom: string | null | undefined
    constructor(ctx: Context, options: SessionOptions) {
        super(ctx, options);
        this.vroot = resolve(Deno.cwd(), 'views');
        if(!this.get('##LOCALS')) this.set('##LOCALS', {});
        // if(!this.session._locals || Object.keys(this.session._locals).length===0) this.session._locals = this.get('##LOCALS');
        this.session._locals = this.session.locals ?? {};
        this.session._rlocals = this.session._rlocals ?? {};
        if (this.session.redirectedFrom) {
            this.redirectedFrom = this.session.redirectedFrom;
            delete this.session.redirectedFrom;
            this.session._locals = Object.assign(this.session._locals, this.session._rlocals);
        }
        if(this.session._rlocals) delete this.session._rlocals;
    }

    async render<T>(name: string, data: T, code: Status = Status.OK) {
        data = { vroot: this.vroot, ...this.session._locals, ...(this.get('##LOCALS') as Record<string, unknown>), ...data };
        const includeOverride = async(name: string, dataInc: Params) => {
            const compiled = await include(resolve(this.vroot, /\.\w$/g.test(name) ? name : name + '.ejs'), { include: includeOverride, extend: extendOverride, ...data, ...dataInc });
            return compiled;
        }
        // deno-lint-ignore no-explicit-any
        const extendOverride = async(name: string, dataExt: Params, getSections: any)=> {
            const compiled = await extend(resolve(this.vroot, /\.\w$/g.test(name) ? name : name + '.ejs'), { include: includeOverride, extend: extendOverride, ...data, ...dataExt }, getSections);
            return compiled;
        }
        const compiled = await renderFile(resolve(this.vroot, /\.\w$/g.test(name) ? name : name + '.ejs'), { include: includeOverride, extend: extendOverride, ...data });
        this.session._locals = {};
        return this.htmlBlob(compiled, code);
    }

    redirect(url: string, code = Status.Found): void {
        super.redirect(url, code);
        this.session.redirectedFrom = this.url.pathname;
    }

    passRedirect(key: string, value: unknown) {
        if(!this.session._rlocals) this.session._rlocals = {};
        this.session._rlocals[key] = value;
    }
    
    passCurrent(key: string, value: unknown) {
        const localRef = this.get('##LOCALS') as Record<string, unknown>;
        localRef[key] = value;
    }
}