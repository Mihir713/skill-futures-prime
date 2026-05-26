import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    tailwindcss(),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});