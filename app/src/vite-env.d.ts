/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // más variables de entono...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
