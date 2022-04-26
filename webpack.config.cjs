const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/main.ts',
  devtool: 'eval-source-map',
  mode:'development',
  plugins: [
    //new BundleAnalyzerPlugin()
  ],
  optimization: {
    chunkIds: 'named',
    concatenateModules: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include : [path.resolve(__dirname, 'src')],
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: { "stream":false, "assert":false, "http": false, "https":false, "os":false, "url":false, "crypto":false },
  },
  output: {
    publicPath:'app/js',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app/js'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'app')
    },
    devMiddleware : {
      writeToDisk: true,
    }
  },
};