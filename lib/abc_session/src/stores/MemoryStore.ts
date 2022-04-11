export default class MemoryStore{
    data: Map<string, Record<string, unknown>>;
    expireStart: number;
    constructor(expireStart?: number){
        // deno-lint-ignore no-explicit-any
        this.data = new Map<string, Record<string, any>>();
        this.expireStart = expireStart || 2592000000;
    }

    sessionExists(sessionId: string){
        return this.data.has(sessionId);
    }

    getSessionById(sessionId: string){
        return this.data.get(sessionId);
    }

    createSession(sessionId: string){
        this.data.set(sessionId, {
            'expires': this.expireStart
        });
    }

    deleteSessionById(sessionId: string){
        this.data.delete(sessionId);
    }

    persistSessionData(sessionId: string, sessionData: Record<string, unknown>){
        if(this.sessionExists(sessionId)) this.data.set(sessionId, sessionData);
    }
}