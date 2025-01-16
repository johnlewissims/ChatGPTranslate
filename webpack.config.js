const path = require('path');

const buildPath = path.resolve(__dirname, 'dist');
const sourcePath = path.resolve(__dirname, 'src');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        background: `${sourcePath}/background/background.js`,
        content: `${sourcePath}/content/content.js`,
    },
    output: {
        path: buildPath,
        filename: '[name].bundle.js',
        clean: true,
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
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: `${sourcePath}/manifest.json`, to: `${buildPath}/` },
                { from: `${sourcePath}/views`, to: `${buildPath}/views` },
                { from: `${sourcePath}/icons`, to: `${buildPath}/icons` },
                { from: `${sourcePath}/scripts`, to: `${buildPath}/scripts` },
                { from: `${sourcePath}/styles`, to: `${buildPath}/styles` },
            ],
        }),
    ],
};
