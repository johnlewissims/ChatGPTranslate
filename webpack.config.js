import path from 'path';
import fs from 'fs';
import CopyPlugin from 'copy-webpack-plugin';
const __dirname = import.meta.dirname;

const buildPath = path.resolve(__dirname, 'dist');
const sourcePath = path.resolve(__dirname, 'src');

const isDevelopment =
    process.argv[process.argv.indexOf('--mode') + 1] === 'development';
fs.writeFile(
    `${sourcePath}/content/development.ts`,
    `export const IsDevelopment = ${isDevelopment};\n`,
    () => void 0,
);

export default {
    entry: {
        background: `${sourcePath}/background/background`,
        content: `${sourcePath}/content/content`,
        settings: `${sourcePath}/scripts/settings`,
        popup: `${sourcePath}/scripts/popup`,
        chat: `${sourcePath}/scripts/chat`,
    },
    output: {
        path: buildPath,
        filename: '[name].bundle.js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, 'src'),
        },
        extensions: ['.js', '.ts'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: `${sourcePath}/manifest.json`, to: `${buildPath}/` },
                { from: `${sourcePath}/views`, to: `${buildPath}/views` },
                { from: `${sourcePath}/icons`, to: `${buildPath}/icons` },
                { from: `${sourcePath}/styles`, to: `${buildPath}/styles` },
            ],
        }),
    ],
};
