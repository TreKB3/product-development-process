const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '', // Remove the /api prefix when forwarding
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log the proxy request for debugging
        console.log('Proxying request:', req.method, req.path);
      },
    })
  );
};
