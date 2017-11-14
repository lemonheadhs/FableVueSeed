'use strict'
const path = require('path')
const fs = require('fs')
const config = require('./config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const R = require('ramda')

let isProduction = process.argv.indexOf("-p") >= 0

exports.assetsPath = function (_path) {
    const assetsSubDirectory = isProduction
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory
    return path.posix.join(assetsSubDirectory, _path)
}

exports.styleLoaders = function (options) {
    options = options || {}

    const cssLoader = {
        loader: 'css-loader',
        options: {
          minimize: isProduction,
          sourceMap: options.sourceMap
        }
    }

    function mainLoaders (recipe) {
        if (!recipe) return [];

        let loaderName = typeof recipe === 'string' ? recipe : recipe[0]
        let loaderOptions = typeof recipe === 'string' ? undefined : recipe[1]
        return [{
            loader: loaderName + '-loader',
            options: Object.assign({}, loaderOptions, {
                sourceMap: options.sourceMap
            })
        }]
    }

    function extractTextOrUseStyleLoader(loaders) {
        return options.extract
            ? ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            })
            : ['vue-style-loader'].concat(loaders)          
    }

    let prLens = R.lens(R.nth(1), (v, p)=>R.append(v, R.take(1, p)))

    let ext_recipe_pairs = [
        ['css', null],
        // ['postcss', null],
        // ['less', 'less'],
        // ['sass', ['sass', {indentedSyntax: true}]],
        ['scss', 'sass'],
        // ['stylus', 'stylus'],
        // ['styl', 'stylus']
    ]

    return R.pipe(
        R.map(R.over(prLens, mainLoaders)),
        R.map(R.over(prLens, R.prepend(cssLoader))),
        R.map(R.over(prLens, extractTextOrUseStyleLoader)),
        R.map(pair => {
            let extension = pair[0]
            let loaders = pair[1]
            return {
                enforce: 'post',
                test: new RegExp('\\.' + extension + '$'),
                use: loaders
            }
        })
    )(ext_recipe_pairs)
}




