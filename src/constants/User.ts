/* eslint-disable camelcase */

import Customer from './models/Customer'

interface UserWithoutCustomer {
	email: string
	googleAccessToken: string
	additionalInfo: {
		verified_email: boolean
		name?: string
		given_name?: string
		family_name?: string
		picture?: string
		locale?: string
	}
}

export default interface User extends UserWithoutCustomer {
	selectedCustomer?: Customer
}

export interface UserWithSelectedCustomer extends UserWithoutCustomer {
	selectedCustomer: Customer
}
