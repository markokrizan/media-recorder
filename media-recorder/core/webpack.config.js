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
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "../dist/core"),
    filename: "index.js",
    library: "mediaRecorderCore",
    libraryTarget: "commonjs2",
  },
};
