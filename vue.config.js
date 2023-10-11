module.exports = {
  lintOnSave: true, // 关闭语法检查
  devServer: {
    proxy: {
      '/dev': {
        // 请求前缀
        target: 'http://8.134.84.37:' + process.env.VUE_APP_PORT, pathRewrite: { '^/dev': '' }, changeOrigin: true // 用于控制请求头中的host值
      }
    },
    "disableHostCheck": true
  }
}
