// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;

//-------------------proxy-------------------

const proxyMiddleware = require('http-proxy-middleware');
// Below URL need to be server host:port...
const restTarget = 'http://localhost:9090';

const proxyTable = {}; // when request.headers.host == 'dev.localhost:3000',
proxyTable[host + ':' + port] = restTarget; // override target 'http://www.example.org' to 'http://localhost:8000'

// configure proxy middleware options
const options = {
  target: 'http://localhost:9090', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  router: proxyTable,
  onProxyRes: function(proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
      var _cookie = proxyRes.headers['set-cookie'][0];
      _cookie = _cookie.replace(/Path=\/[a-zA-Z0-9_.-]*\/;/gi, "Path=/;");
      proxyRes.headers['set-cookie'] = [_cookie];
    }
  },
  onProxyReq: function(proxyReq, req, res) {

  },
  onError: function(err, req, res) {
    console.log('Error on proxy request');
  }
};

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8080,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: options,
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
  }
}
