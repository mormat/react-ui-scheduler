import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  /*
  build: {
    lib: {
      entry:   path.resolve(__dirname, 'src/main.jsx'),
      name:    "Mormat's events calendar",
      fileName: (format) => `mormat-events-calendar.${format}.js`
    }
  },*/
 build: {
    rollupOptions: {
        output: {
            entryFileNames: 'components.js',
            assetFileNames: 'components.css',
            chunkFileNames: "chunk.js",
            manualChunks: undefined,
        }
    }  
 },
 css: {
     modules : {
         /*
        generateScopedName: function (name, filename, css) {
            console.log('generateScopedName', name, filename, css);
            var path = require("path");
            var i = css.indexOf("." + name);
            var line = css.substr(0, i).split(/[\r\n]/).length;
            var file = path.basename(filename, ".css");

            return name;
        },*/
        generateScopedName: "mormat-events-calendar_[local]_[hash]",
     },
  },
  plugins: [react()]
})

