const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    test_reads: './src/test_reads.js',
    test_writes: './src/test_writes.js',
    test_bids: './src/test_bids.js',
    test_buy: './src/test_buy.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // eslint-disable-line
    libraryTarget: 'commonjs',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
  target: 'web',
  externals: /k6(\/.*)?/,
};
