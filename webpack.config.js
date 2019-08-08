const path = require('path');
const plugins = [];

module.exports = {
  entry: ['./src/roundware.js'],

  output: {
    filename: "roundware.js",

    libraryTarget: "umd",
    libraryExport: "default",
    library: "Roundware",

  },

  devtool: 'cheap-module-eval-source-map',

  devServer: {
    port: 8080,
    contentBase: [path.resolve(__dirname,"example")],
    disableHostCheck: true,
    
    watchContentBase: true,

    watchOptions: {
      poll: 1000
    },

    overlay: {
      warnings: true,
      errors: true
    },
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },

  plugins
};