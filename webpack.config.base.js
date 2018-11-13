const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
module.exports = function(name, env = {}) {
  let vuejsLoaderExclude = [`${name}/store`, `${name}/workers`].map(x => path.resolve(__dirname, x))
  return {
    name,
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, name),
          exclude: vuejsLoaderExclude,
          loader: 'vuejs-loader'
        },
        { test: /\.js$/, include: vuejsLoaderExclude, loader: 'babel-loader' },
        { test: /\.mjs$/, loader: 'babel-loader' },
        { test: /\.vue$/, include: path.resolve(__dirname, name), loader: 'vue-loader' },
        { test: /\.css$/, loader: 'vue-style-loader!css-loader' },
        { test: /\.scss$/, loader: 'vue-style-loader!css-loader!sass-loader' },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg|jpg|otf|gif)$/,
          loader: 'file-loader?outputPath=files/'
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', _: 'lodash', Vue: 'vue' })
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, `${name}`),
        '@constant': path.resolve(
          __dirname,
          'constant',
          env.prod ? 'prod' : fs.existsSync('constant/local.js') ? 'local' : 'dev'
        ),
        vue: 'vue/dist/vue.js'
      }
    }
  }
}
