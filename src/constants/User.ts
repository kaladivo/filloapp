/* eslint-disable camelcase */
export default interface User {
	email: string
	googleAccessToken: string
	customerAdmin: boolean
	customer: {
		name: string
		id: string
	}
	additionalInfo: {
		verified_email: boolean
		name?: string
		given_name?: string
		family_name?: string
		picture?: string
		locale?: string
	}
}
