/*global __dirname, require, module*/
let CopyWebpackPlugin = require('copy-webpack-plugin');
let path = require('path');

module.exports = {
  context: path.join(__dirname, 'src'),
  outputPath: path.join(__dirname, 'bin'),
  plugins: [
    new CopyWebpackPlugin(
      [
        // Copy glob results to /absolute/path/
        {
          from: 'src/**/*'
        }
      ], {
        ignore: [],
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: false
      }
    )
  ]
};