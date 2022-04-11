import { Server } from "https://deno.land/std@0.99.0/http/server.ts";
import { Application, Context, createHttpExceptionBody, Group, HandlerFunc, HttpException, InternalServerErrorException, MiddlewareFunc } from 'https://deno.land/x/abc@v1.3.3/mod.ts';

export default class ModifiedApplication extends Application {
    #groups: Group[] = [];
    #start = async (s: Server): Promise<void> => {
        this.server = s;

        for await (const req of this.server) {
            const c = new Context({
                r: req,
                app: this,
            });
            let h: HandlerFunc;

            for (const i of this.#groups) {
                i.θapplyMiddleware();
            }

            if (this.premiddleware.length === 0) {
                h = this.router.find(req.method, c);
                h = this.#applyMiddleware(h, ...this.middleware);
            } else {
                h = (c) => {
                    h = this.router.find(req.method, c);
                    h = this.#applyMiddleware(h, ...this.middleware);
                    return h(c);
                };
                h = this.#applyMiddleware(h, ...this.premiddleware);
            }

            this.#transformResult(c, h).then((): void => {
                req.respond(c.response).catch(() => { });
            });
        }
    };
    #applyMiddleware = (h: HandlerFunc, ...m: MiddlewareFunc[]): HandlerFunc => {
        for (let i = m.length - 1; i >= 0; --i) {
            h = m[i](h);
        }

        return h;
    };
    #transformResult = async (c: Context, h: HandlerFunc): Promise<void> => {
        let result: unknown;
        try {
            result = await h(c);
        } catch (e) {
            if (e instanceof HttpException) {
                result = c.json(
                    typeof e.response === "object"
                        ? e.response
                        : createHttpExceptionBody(e.response, undefined, e.status),
                    e.status,
                );
            } else {
                console.log(e);
                // e = new InternalServerErrorException(e.message);
                result = c.json(
                    (new InternalServerErrorException(e.message)).response,
                    (new InternalServerErrorException(e.message)).status,
                );
            }
        }
        if (c.response.status == undefined) {
            switch (typeof result) {
                case "object":
                    if (result instanceof Uint8Array) {
                        c.blob(result);
                    } else {
                        c.json(result as Record<string, unknown>);
                    }
                    break;
                case "string":
                    /^\s*</.test(result) ? c.html(result) : c.string(result);
                    break;
                default:
                    c.string(String(result));
            }
        }
    };
}