const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser.js'),
    };

    config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser.js',
        }),
    ];

    return config;
};
