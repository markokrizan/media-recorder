const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env", "@babel/react"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
    ],
  },
  entry: "./react/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "react.js",
  },
  externals: {
    react: "commonjs2 react",
  },
};
