const { defineConfig } = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
  
  css: {
    sourceMap: true,
  },
  // configureWebpack: {
  //   plugins: [
  //     require('unplugin-vue-components/webpack')({ /* options */ }),
  //   ],
  // },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        'C:\\Users\\Edward\\Desktop\\inefi_layout_cli\\src\\assets\\scss\\all.scss'
      ]
    }
  },
})
