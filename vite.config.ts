import { defineConfig } from 'vite'
import monkey, { cdn } from 'vite-plugin-monkey'

export default defineConfig({
  envDir: './env',
  plugins: [
    monkey({
      entry: 'src/index.ts',
      build: {
        externalGlobals: {
          sweetalert: cdn.unpkg('swal', 'dist/sweetalert.min.js'),
        },
      },
      userscript: {
        icon: 'https://static.hdslb.com/mobile/img/512.png',
        namespace: 'bili-dynamic-block',
        license: 'MIT',
        updateURL: 'https://raw.githubusercontent.com/xiaohuohumax/bili-dynamic-block/main/dist/bili-dynamic-block.user.js',
        downloadURL: 'https://raw.githubusercontent.com/xiaohuohumax/bili-dynamic-block/main/dist/bili-dynamic-block.user.js',
        noframes: true,
        match: [
          'https://t.bilibili.com/*',
          'https://space.bilibili.com/*',
        ],
      },
    }),
  ],
})
