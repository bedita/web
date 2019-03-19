// require environment setup
require('./webpack.config.environment');

const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');

// const extractSass = new ExtractTextPlugin({
//     filename: `${BUNDLE.beditaPluginsRoot}/OpenCorporation/${BUNDLE.webroot}/${BUNDLE.cssDir}/OpenCorporation.style.css`,
//     allChunks: true,
// });


// auto load installed plugins
const pluginsFound = readDirs(BUNDLE.beditaPluginsRoot);

let entries = {};
let aliases = {};

pluginsFound.forEach(plugin => {
    entries[plugin] = path.resolve(__dirname, `${BUNDLE.beditaPluginsRoot}/${plugin}/${BUNDLE.jsRoot}/index.js`);
    aliases[plugin] = path.resolve(__dirname, `${BUNDLE.beditaPluginsRoot}/${plugin}/node_modules`)
});

module.exports = {
    entry: entries,
    output: {
        path: path.resolve(__dirname, `${BUNDLE.beditaPluginsRoot}`),
        filename: '[name]/webroot/js/[name].plugin.js',
        libraryTarget: 'window',
        library: '[name]',
    },

    externals: {
        vue: 'vue/dist/vue',
    },

    resolve: {
        alias: aliases,
        extensions: ['.js', '.vue', '.json', '.scss', '.css'],
    },

    optimization: {
        minimize: true,
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            modules: 'commonjs',
                            targets: {
                                browsers: ['> 0.25%'],
                            },
                            useBuiltIns: false,
                        }]
                    ],
                    plugins: [
                        [
                            '@babel/plugin-transform-runtime',
                            {
                                absoluteRuntime: false,
                                corejs: 2,
                                helpers: true,
                                regenerator: true,
                                useESModules: false
                            }
                        ],
                        'syntax-dynamic-import'
                    ],
                }
            },
        ]
    },
    devtool: devMode ? "source-map" : false,

    watch: devMode,

    stats: {
        // Display the entry points with the corresponding bundles
        entrypoints: false,
        modules: false,
        warnings: devMode,
    },
};
