/* eslint-env node */

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        injector: 'injector.ts',
        jam: 'jam.ts'
    },
    output: {
        path: path.join(__dirname, 'extension', 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            exclude: ['/node_modules/', '!/node_modules/idb-file-storage'],
            test: /\.js$/,
            use: [
                "babel-loader",
                {
                    loader: "eslint-loader",
                    options: {
                        fix: true
                    }
                }
            ]
        }, {
            exclude: ['/node_modules/', '!/node_modules/idb-file-storage'],
            test: /\.tsx?$/,
            use: [
                "babel-loader",
                "ts-loader",
                {
                    loader: "tslint-loader",
                    options: {
                        fix: true
                    }
                }
            ]
        }]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        modules: [
            path.join(__dirname, 'src'),
            'node_modules'
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimize: false
    },
    devtool: 'sourcemap'
};
