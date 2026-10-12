/// <reference types="vite/client" />

// Tells TypeScript which variables Vite puts on import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
