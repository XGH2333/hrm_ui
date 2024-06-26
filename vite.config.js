/* eslint-disable */
import legacyPlugin from '@vitejs/plugin-legacy';
import {
  viteMockServe
} from 'vite-plugin-mock';
import * as path from 'path';
import {
  createVuePlugin
} from 'vite-plugin-vue2';
// @see https://cn.vitejs.dev/config/
export default ({
  command,
  mode
}) => {
  let rollupOptions = {};


  let optimizeDeps = {};


  let alias = {
    '@': path.resolve(__dirname, '.\src'),
    'vue$': 'vue/dist/vue.runtime.esm.js',
  }

  let proxy = {
    '/dev': {
      "target": "http://localhost:8888",
      "pathRewrite": {
        "^/dev": ""
      },
      "changeOrigin": true
    },
  }

  // todo 替换为原有变量
  let define = {
    // 'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"',
    'process.env.NODE_ENV': '"development"',
    'process.env.VUE_APP_BASE_API': '"/dev"',
    'process.env.VUE_APP_PORT': '"8888"',
  }

  let esbuild = {}

  return {
    base: './', // index.html文件所在位置
    root: './', // js导入的资源路径，src
    resolve: {
      alias,
    },
    define: define,
    server: {
      // 代理
      proxy,
    },
    build: {
      target: 'es2015',
      minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
      manifest: false, // 是否产出maifest.json
      sourcemap: false, // 是否产出soucemap.json
      outDir: 'build', // 产出目录
      rollupOptions,
    },
    esbuild,
    optimizeDeps,
    plugins: [
      createVuePlugin(), legacyPlugin({
        targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'],
      }), viteMockServe({
        mockPath: 'mock',
        localEnabled: command === 'serve',
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
        },
      },
    },
  };
};
