declare module 'buffer' {
    export const Buffer: any;
}

declare module 'simple-cbor' {
    export const encode: any;
    export const decode: any;
    export const diagnose: any;
    export const Reader: any;
    export const Writer: any;
    export const Tagged: any;
    export const Simple: any;
}

interface Window {
    Buffer: any;
    global: any;
    process: any;
    require: any;
}
