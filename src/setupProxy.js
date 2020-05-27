const proxy = require('http-proxy-middleware')

module.exports = function setupProxy(app) {
	app.use(
		'/api',
		proxy.createProxyMiddleware({
			target: `http://localhost:${process.env.SERVER_PORT}`,
			changeOrigin: true,
		})
	)
}
