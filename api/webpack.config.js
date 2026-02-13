const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve.alias,
        '@shared': path.resolve(__dirname, '../shared/index.ts'),
      },
      extensions: ['.ts', '.js', '.json'],
    },
  };
};
