const webpack = require('webpack');
module.exports = {
	entry: './web.js',
	output: {
		path: './dist',
		filename: 'outside-event.min.js',
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel',
			query: {
				presets: ['es2015']
			}
		}]
	},
	plugins: [
			new webpack.optimize.UglifyJsPlugin()
	]
};