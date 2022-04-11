export default interface SessionOptions{
    secret: string,
    // deno-lint-ignore no-explicit-any
    store?: any
}