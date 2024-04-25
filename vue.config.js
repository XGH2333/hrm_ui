const fs = require('fs')
const path = require('path')
module.exports = {
  lintOnSave: true, // 关闭语法检查
  devServer: {
    proxy: {
      '/dev': {
        // 请求前缀
        target: 'http://xghwy.xghwy.top:' + process.env.VUE_APP_PORT,
        pathRewrite: { '^/dev': '' },
        changeOrigin: true, // 用于控制请求头中的host值
        https: {
          cert: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.cer')),
          key: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.key'))
        }
      }
    },
    disableHostCheck: true,
    https: true
  }
}
