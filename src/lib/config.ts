// src/lib/config.ts
import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: "https://jbssupply.medusajs.app",
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // No auth or fetchCredentials here — JWT is handled automatically by the browser
});