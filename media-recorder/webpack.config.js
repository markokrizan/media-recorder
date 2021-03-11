const path = require("path");
// Possibly use to compile all 3 versions
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
    ],
  },
  entry: {
    react: "./react/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  externals: {
    react: "commonjs react",
  },
};
