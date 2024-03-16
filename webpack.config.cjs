const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const jsRoot = "./src/client/js"

module.exports = {
    entry: {
        main: `${jsRoot}/main.js`,
        videoPlayer: `${jsRoot}/videoPlayer.js`,
        recorder: `${jsRoot}/recorder.js`,
        commentSection: `${jsRoot}/commentSection.js`
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'assets'),
        clean: true,
    },
    plugins: [new MiniCssExtractPlugin({
        filename: 'css/styles.css',
    })],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    //from last to first
                    // scss to css 
                    // pass the css code to css loader
                    // put the code on the browser
                    MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'
                ],
            },
        ],
    },
};

