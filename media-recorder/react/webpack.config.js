const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"],
          plugins: ["@babel/plugin-proposal-class-properties"],
        },
      },
    ],
  },
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "../dist/react"),
    filename: "index.js",
    library: "mediaRecorderReact",
    libraryTarget: "commonjs2",
  },
  externals: {
    react: "commonjs2 react",
  },
};
