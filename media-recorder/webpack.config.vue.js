const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env"],
        },
      },
    ],
  },
  entry: "./vue/index.js",
  output: {
    path: path.resolve(__dirname, "dist/vue"),
    filename: "index.js",
    library: "mediaRecorderVue",
    libraryTarget: "commonjs2",
  },
  externals: {
    vue: "commonjs2 vue",
  },
};
