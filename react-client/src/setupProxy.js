const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/csvdata',
    createProxyMiddleware({
      target: process.env.REACT_APP_SERVER,
      changeOrigin: true,
    })
  );
};