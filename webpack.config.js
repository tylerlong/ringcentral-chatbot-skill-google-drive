const nodeExternals = require('webpack-node-externals')

const config = {
  target: 'node',
  externals: [nodeExternals()],
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'index.min.js',
    libraryTarget: 'commonjs2'
  }
}

module.exports = config
