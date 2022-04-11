import { Context } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import SessionOptions from './SessionOptions.ts';
import { Keygrip } from "https://deno.land/x/keygrip/mod.ts";

export default class SessionContext extends Context {
    private keygrip: Keygrip;
    // deno-lint-ignore no-explicit-any
    private store: any;
    private sessionCookie: string;
    readonly sessionId: string | null = null;
    constructor(ctx: Context, options: SessionOptions) {
        super(ctx);
        this.keygrip = new Keygrip([options.secret]);
        this.store = options.store;
        this.sessionCookie = ctx.cookies['sid'];
        if (this.isSessionCookieValid()) {
            this.sessionId = this.decodedSessionCookie()!.sessionId;
        } else {
            this.sessionId = crypto.randomUUID();
            const newSessionCookie = this.newSessionCookie(this.sessionId);
            ctx.setCookie({
                name: 'sid',
                value: newSessionCookie,
                path: '/',
                sameSite: 'Lax'
            })
        }
        this.update();
    }

    private isSessionCookieValid() {
        const decodedSessionCookie = this.decodedSessionCookie();
        if (decodedSessionCookie !== null) {
            const { sessionId, signature } = decodedSessionCookie;
            return this.keygrip.verify(sessionId, signature) && this.store.sessionExists(sessionId);
        }
        return false;
    }

    private newSessionCookie(sessionId: string) {
        const encodedSessionId = btoa(sessionId);
        this.store.createSession(sessionId);
        return `ABC:${encodedSessionId}.${this.keygrip.sign(sessionId)}`;
    }

    private decodedSessionCookie() {
        if (/ABC:.+\..+/g.test(this.sessionCookie)) {
            const encodedSessionId = this.sessionCookie.split('.')[0].replace('ABC:', '');
            const decodedSessionId = atob(encodedSessionId);
            const signature = this.sessionCookie.split('.')[1];
            return { sessionId: decodedSessionId, signature };
        } else {
            return null;
        }
    }

    update(){
        const sessionIds = Array.from((this.store.data as Map<string, Record<string, unknown>>).keys());
        sessionIds.forEach(sid => {
            const sessionData = this.store.getSessionById(sid);
            if (sid === this.sessionId) {
                sessionData['expires'] = sessionData['expires'] + 10;
                this.store.persistSessionData(sid, sessionData);
            } else {
                sessionData['expires'] = sessionData['expires'] - 10;
                this.store.persistSessionData(sid, sessionData);
            }
            if(sessionData['expires']<=0) this.store.deleteSessionById(sid);
        });
    }

    get session() {
        return this.store.getSessionById(this.sessionId);
    }

    // deno-lint-ignore no-explicit-any
    set session(value: Record<string, any>) {
        this.store.persistSessionData(this.sessionId, value);
    }
}