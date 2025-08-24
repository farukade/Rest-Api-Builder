import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "src",
  build: {
    outDir: resolve(__dirname, "public"), // compile into public/
    emptyOutDir: false, // don’t delete non-React files in public
  },
});
