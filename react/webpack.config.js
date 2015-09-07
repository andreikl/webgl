module.exports = {
            entry: "./app/app.js",
            output: {
                path: __dirname + '/build',
                filename: "bundle.js"
            },
            //devtool: "inline-source-map",
            module: {
                loaders: [
                    { test: /\.js$/, exclude: "/node_modules/", loader: "babel-loader" },
                    { test: /\.scss$/, loader: 'style!css!sass' }
                ]
            },
            plugins: [
                /*new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })*/
                /*new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': '"production"'
                    }
                })*/
            ]
};