import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

export default defineConfig(() => {
   const isAnalyze = process.env.ANALYZE === "true";
   const isHttps = process.env.HTTPS === "true";

   return {
      plugins: [
         react(),
         svgr(),
         ...(isHttps ? [basicSsl()] : []),
         ...(isAnalyze
            ? [visualizer({ open: true, filename: "dist/stats.html", gzipSize: true })]
            : []),
      ],

      envPrefix: "REACT_APP_",

      resolve: {
         alias: {
            "@assets": resolve(__dirname, "src/assets"),
            "@controls": resolve(__dirname, "src/controls"),
            "@context": resolve(__dirname, "src/context"),
            "@lib": resolve(__dirname, "src/lib"),
            "@utils": resolve(__dirname, "src/utils"),
            "@api": resolve(__dirname, "src/api"),
            "@routes": resolve(__dirname, "src/routes"),
            "@": resolve(__dirname, "src"),
         },
      },

      server: {
         port: 3000,
      },

      css: {
         preprocessorOptions: {
            scss: {
               quietDeps: true,
               silenceDeprecations: ["legacy-js-api"],
            },
         },
      },

      build: {
         outDir: "dist",
         sourcemap: false,
         rollupOptions: {
            output: {
               manualChunks(id) {
                  if (/node_modules\/(antd|@ant-design|rc-[a-z-]+)\//.test(id)) {
                     return "vendor-antd";
                  }
               },
            },
         },
      },
   };
});
