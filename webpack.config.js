const path = require('path');
const { spawn } = require('child_process');

spawn('node node_modules\\http-server\\bin\\http-server', {
  stdio: ['ignore', 'inherit', 'inherit'],
  shell: true
});

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
