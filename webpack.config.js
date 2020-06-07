const { resolve } = require('path')
const { NormalModuleReplacementPlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

const prettierPath = require.resolve('prettier/standalone')

const cssLoaders = [
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      esModule: true
    }
  },
  'css-loader'
]

module.exports = {
  entry: {
    script: './demo/script.js',
    styles: './demo/stylesheet.scss',
    editor: './demo/editor.css'
  },
  output: {
    path: resolve('demo', 'dist'),
    globalObject: 'self',
    publicPath: process.env.PUBLIC_PATH || '/',
    filename: '[name].[contenthash].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new NormalModuleReplacementPlugin(/^prettier$/, prettierPath),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
      scriptLoading: 'defer'
    }),
    new WebpackPwaManifest({
      name: 'JS to PHP data',
      short_name: 'JS to PHP data',
      description: 'Convert JavaScript data structures to PHP.',
      lang: 'en',
      display: 'fullscreen',
      background_color: '#2f3035',
      theme_color: '#2f3035',
      inject: true
    }),
    new OfflinePlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [...cssLoaders]
      },
      {
        test: /\.scss$/i,
        use: [...cssLoaders, 'sass-loader']
      }
    ]
  }
}
