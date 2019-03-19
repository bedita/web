#!/usr/bin/env node
'use strict'

// require environment setup
require('./webpack.config.environment');

// webpack dependencies
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// vue dependencies
const VueLoaderPlugin = require('vue-loader/lib/loader');
// config
const appEntry = `${path.resolve(__dirname, BUNDLE.jsRoot)}/${BUNDLE.appPath}/${BUNDLE.appName}`;

let message = ' Production Bundle';
let separator = '-------------------';
if (devMode) {
    separator = '--------------------';
    message = ' Development Bundle';
}

// Print env infos
bundler.printMessage(message, separator);

// Create webpack plugins list
// Common Plugins
let webpackPlugins = [
    new CleanWebpackPlugin([
        BUNDLE.jsDir,
        BUNDLE.cssDir,
    ], {
        root: path.resolve(__dirname, BUNDLE.webroot),
        verbose: false,
        exclude: ['be-icons-codes.css', 'be-icons-font.css'],
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': `'${ENVIRONMENT.mode}'`
    }),

    new MiniCssExtractPlugin({
        filename: `${BUNDLE.cssDir}/[name].css`,
        chunkFilename: `${BUNDLE.cssDir}/[name].css`,
    }),

    new MomentLocalesPlugin({
        localesToKeep: locales.locales,
    }),
];

// Development or report bundle Plugin
if (devMode || forceReport) {
    webpackPlugins.push(
        new BundleAnalyzerPlugin({
            openAnalyzer: false,
            analyzerMode: 'static',
            reportFilename: `bundle-report/bundle-report.${ENVIRONMENT.mode}.html`,
        })
    );
}

// Development Plugins
if (devMode) {
    webpackPlugins.push(
        new BrowserSyncPlugin({
            proxy: {
                target: ENVIRONMENT.proxy,
                proxyReq: [
                    (proxyReq) => {
                        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
                        proxyReq.setHeader('Access-Control-Allow-Headers', 'content-type, origin, x-api-key, x-requested-with, authorization');
                        proxyReq.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, PATCH, DELETE, OPTIONS');
                    }
                ]
            },
            cors: true,
            notify: false,
            open: false,
            reloadOnRestart: true,
            host: ENVIRONMENT.host,
            port: ENVIRONMENT.port,
        })
    );

    // used to watch twig template files
    webpackPlugins.push(
        new WatchExternalFilesPlugin.default({
            files: [
            `./${BUNDLE.templateRoot}/**/*.twig`,
            ]
        }),
    );
} else {
    // Production Plugins

    webpackPlugins.push(
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                reduceIdents: false, // unexpected behavior with animations
            },
            canPrint: false
        })
    );
}

module.exports = {
    entry: {
        app: [appEntry],
    },

    output: {
        path: path.resolve(__dirname, `${BUNDLE.webroot}/`),
        filename: `${BUNDLE.jsDir}/[name].bundle.js`,
        publicPath: '/',

        devtoolModuleFilenameTemplate: info => {
            if (info.identifier.indexOf('webpack') === -1 && info.identifier.indexOf('.scss') === -1) {
                return `sourcemap/${info.resourcePath}`;
            }
            return '';
        }
    },

    // extract vendors import and put them in separate file
    optimization: {
        moduleIds: 'named',
        chunkIds: 'named',
        minimize: true,
        usedExports: true, // treeshaking
        sideEffects: true, // check sideEffects flag in libraries
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            maxAsyncRequests: 5,
            maxInitialRequests: 5,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: 1,
                    chunks: 'async',
                    enforce: true,
                    name(module) {
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return `vendors/async/${packageName.replace('@', '')}`;
                    },
                },
                default: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendors',
                    enforce: true,
                    name(module) {
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // console.log(module.context);
                        return `vendors/${packageName.replace('@', '')}`;
                    },
                },
                css: {
                    test: /\.(css)$/,
                    name: 'vendors',
                    chunks: 'all',
                    minChunks: 1,
                },
            }
        }
    },

    resolve: {
        // aliases for import
        alias: SRC_TEMPLATE_ALIAS,
        extensions: ['.js', '.vue', '.json', '.scss', '.css', 'po'],
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            // if dev mode don't use babel
            devMode ? {} : {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.po$/,
                include: [
                    path.resolve(__dirname, BUNDLE.localeDir),
                ],
                use: [
                    { loader: 'json-loader' },
                    { loader: 'po-gettext-loader' },
                ]
            },
            {
                test: /\.(scss|css)$/,
                include: [
                    path.resolve(__dirname, BUNDLE.templateRoot),
                ],

                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: devMode,
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: devMode,
                        }
                    }
                ]
            },
            {
                test: /\.(scss|css)$/,
                include: [
                    path.resolve(__dirname, 'node_modules'),
                ],
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: devMode,
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: devMode
                        }
                    }
                ],
            },
            {
                test: /\.(woff|eot|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8092 * 1024,
                        }
                    }
                ]
            },
            {
                include: [
                    path.resolve(__dirname, 'node_modules'),
                ],
                test: /\.svg$/,
                use: 'svg-url-loader',
            },
        ],
    },

    devtool: devMode ? "source-map" : false,

    watch: devMode,

    plugins: webpackPlugins,

    stats: {
        // Display the entry points with the corresponding bundles
        entrypoints: false,
        modules: false,
        warnings: devMode,
        children: false,
        assets: true,
        excludeAssets: /(.map)/,
    },
}
