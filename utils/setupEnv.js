/* eslint-disable */
const dotenv = require('dotenv')

const result2 = dotenv.config({
	path: `.env`,
})

if (result2.error) {
	throw result2.error
}
