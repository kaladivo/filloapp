/* eslint-disable camelcase */
export default interface User {
	email: string
	domain: string
	googleAccessToken: string
	customerAdmin: boolean
	additionalInfo: {
		verified_email: boolean
		name?: string
		given_name?: string
		family_name?: string
		picture?: string
		locale?: string
	}
}
