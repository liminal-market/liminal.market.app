const path = require('path');

module.exports = {
  entry: './src/main.ts',
  devtool: 'eval-source-map',
  mode:'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include : [path.resolve(__dirname, 'src')],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: { "http": false, "https":false, "os":false, "url":false, "crypto":false },
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