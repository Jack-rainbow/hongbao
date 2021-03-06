import path from 'path';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin  from 'extract-text-webpack-plugin';

import precss from 'precss';
import autoprefixer from 'autoprefixer';


const appPath = path.resolve(__dirname, 'app');

let webpackConfig = {
  devtool: 'source-map', //生成 source map文件
  resolve: {
    root: [appPath], // 设置要加载模块根路径，该路径必须是绝对路径
    //自动扩展文件后缀名
    extensions: ['', '.js', '.jsx', '.css', '.json']
  },

  postcss () {
    return {
      defaults: [precss, autoprefixer],
      cleaner: [autoprefixer({browsers: ['last 2 version', 'chrome >=30', 'Android >= 4.3']})]
    };
  },

  entry: {
    index: ['./app/scripts/index.js'],
    share: ['./app/scripts/share.js'],
    //添加要打包在vendors里面的库，作为公共的js文件
    vendors: ['react', 'react-dom']
  },
  output: {
    path: path.join(__dirname, 'dist'), //打包输出目录
    filename: '[name].[hash].bundle.js', //文件名称
    publicPath: '/m-hongbao/' //生成文件基于上下文路径
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        exclude: /(node_modules)/,
      },
      // https://github.com/webpack/extract-text-webpack-plugin 单独引入css文件
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader', 'postcss-loader?pack=cleaner')
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      // https://github.com/webpack/url-loader
      {
        test: /\.(png|jpg|gif|woff|woff2|svg)$/,
        loader: 'url?limit=10000', // 10kb
        query: {
          mimetype: 'image/png'
        }
      },
      {
        test: /\.(mp4|ogg)$/,
        loader: 'file-loader'
      }
    ]
  },

  plugins: [
    //把入口文件里面的 vendors 包含的js文件 打包成verdors.js，除了指定的verdors外，多个入口的公共文件也会被打包到 vendors中
    new webpack.optimize.CommonsChunkPlugin({name: 'vendors', filename: 'vendors.[hash].js'}),
    new ExtractTextPlugin('[name].[hash].css', {
      disable: false,
      allChunks: true
    }),
    // http://webpack.github.io/docs/list-of-plugins.html#dependency-injection
    // 替换全局变量，根据需要待加
    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
    // 相当于命令参数 --optimize-dedupe 消除冗余的或重复的代码
    new webpack.optimize.DedupePlugin(),
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    // 相当于命令参数 --optimize-minimize
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['wx', 'MtaH5'] // 设置不混淆变量名
      }
    }),
    //用来优化生成的代码 chunk,合并相同的代码
    new webpack.optimize.AggressiveMergingPlugin(),
    //用来保证编译过程不出错
    new webpack.NoErrorsPlugin()
  ]
};

//创建 HtmlWebpackPlugin 的实例
// https://www.npmjs.com/package/html-webpack-plugin
const entry = webpackConfig.entry;

// 为 HtmlwebpackPlugin 设置配置项，与 entry 键对应，根据需要设置其参数值
const htmlwebpackPluginConfig = {
  index: {
    title: '京东红包'
  },
  share: {
    title: '京东红包'
  }
};

for (let key in entry) {
  if (entry.hasOwnProperty(key) && key !== 'vendors') {
    webpackConfig.plugins.push(
      new HtmlwebpackPlugin({
        title: htmlwebpackPluginConfig[key].title,
        template: path.resolve(appPath, 'templates/layout.html'),
        filename: `${key}.html`,
        //chunks这个参数告诉插件要引用entry里面的哪几个入口
        chunks: [key, 'vendors'],
        //要把script插入到标签里
        inject: 'body'
      })
    );
  }
}

module.exports = webpackConfig;
