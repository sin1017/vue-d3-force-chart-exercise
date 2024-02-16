// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///Users/qianzaidezuopiezi/Desktop/%E9%80%A3%E8%A8%8A/d3%E7%9F%A5%E8%AD%98%E5%9C%96%E8%AD%9C/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/qianzaidezuopiezi/Desktop/%E9%80%A3%E8%A8%8A/d3%E7%9F%A5%E8%AD%98%E5%9C%96%E8%AD%9C/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///Users/qianzaidezuopiezi/Desktop/%E9%80%A3%E8%A8%8A/d3%E7%9F%A5%E8%AD%98%E5%9C%96%E8%AD%9C/node_modules/unplugin-auto-import/dist/vite.js";
var __vite_injected_original_import_meta_url = "file:///Users/qianzaidezuopiezi/Desktop/%E9%80%A3%E8%A8%8A/d3%E7%9F%A5%E8%AD%98%E5%9C%96%E8%AD%9C/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]s?$/,
        // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/,
        // .vue
        /\.md$/
        // .md
      ],
      imports: ["vue", "vue-router"],
      dts: "./auto-import.d.ts",
      eslintrc: {
        enabled: false,
        filepath: "./.eslintrc-auto-import.json"
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};

