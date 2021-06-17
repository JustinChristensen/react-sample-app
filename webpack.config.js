const { resolve } = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const title = process.env.TITLE || 'React Test';
const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT) || 3000;

const devOrNot = (dev, not) => env === 'development' ? dev : not;

const loaders = () => ([
    {
        test: /\.css$/,
        use: [devOrNot('style-loader', MiniCssExtractPlugin.loader), 'css-loader', 'postcss-loader'],
    },
    {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
    },
    {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
    }
]);

const devServer = () => ({
    contentBase: './dist',
    host, port,
    clientLogLevel: 'silent'
});

module.exports = {
    mode: env,
    target: 'web', // https://github.com/webpack/webpack-dev-server/issues/2758
    context: resolve('src'),
    entry: '.',
    devtool: devOrNot('inline-source-map', 'source-map'),
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    optimization: {
        minimizer: [
            '...',
            new CssMinimizerPlugin()
        ]
    },
    output: {
        path: resolve('dist'),
        filename: 'main.js'
    },
    module: {
        strictExportPresence: true,
        rules: loaders()
    },
    devServer: devServer(),
    plugins: [
        new HtmlPlugin({ title }),
        new MiniCssExtractPlugin({ filename: 'main.css' }),
        new CopyPlugin({
            patterns: [{ from: 'messages', to: 'messages' }]
        })
    ]
};
