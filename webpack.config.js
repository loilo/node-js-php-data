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

let publicPath = process.env.PUBLIC_PATH || '/'

if (!publicPath.endsWith('/')) {
  publicPath += '/'
}

module.exports = {
  entry: {
    script: './demo/js/script.js',
    styles: './demo/css/stylesheet.scss',
    editor: './demo/css/editor.css'
  },
  output: {
    path: resolve('demo', 'dist'),
    globalObject: 'self',
    publicPath,
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
      scriptLoading: 'defer',
      favicon: 'demo/icons/favicon.svg'
    }),
    new WebpackPwaManifest({
      name: 'JS to PHP data',
      short_name: 'JS to PHP data',
      description: 'Convert JavaScript data structures to PHP.',
      lang: 'en',
      display: 'fullscreen',
      background_color: '#1c202b',
      theme_color: '#1c202b',
      icons: [
        ...[120, 152, 167, 180, 1024].map(size => ({
          src: resolve(`demo/icons/ios_${size}x${size}.png`),
          size,
          destination: 'icons/ios',
          ios: true
        })),
        {
          src: resolve('demo/icons/ios_1024x1024.png'),
          size: 1024,
          destination: 'icons/ios',
          ios: 'startup'
        },
        ...[48, 72, 96, 144, 168, 192, 512].map(size => ({
          src: resolve(`demo/icons/android_${size}x${size}.png`),
          size,
          destination: 'icons/android'
        })),
        {
          src: resolve('demo/icons/maskable.png'),
          size: '1024x1024',
          destination: 'icons/android',
          purpose: 'maskable'
        }
      ],
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
