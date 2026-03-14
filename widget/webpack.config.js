const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => ({
  entry: './src/widget.ts',
  output: {
    filename: 'widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'AgentTip',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: false, passes: 2 },
          output: { comments: false },
        },
      }),
    ],
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  performance: {
    maxAssetSize: 80000,
    maxEntrypointSize: 80000,
    hints: 'warning',
  },
});
