const path = require('path');

module.exports = {
    entry: './src/content/content.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'content.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
};
