import { MiddlewareFunc, Context } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import SessionOptions from './src/SessionOptions.ts';
import SessionContext from './src/SessionContext.ts';
import MemoryStore from './src/stores/MemoryStore.ts';

export function session(options: SessionOptions): MiddlewareFunc {
    options.store = options.store || new MemoryStore();
    return (next) => {
        return (ctx: Context) => {

            const sctx = new SessionContext(ctx, options);

            return next(sctx);
        }
    };
}

export {
    SessionContext,
    MemoryStore
};

export type {
    SessionOptions
}