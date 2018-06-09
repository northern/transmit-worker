
module.exports = {
  name: 'server',
  target: 'node',
  entry: './src/index.js',  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
