export type ErrorCode =
	| 'no_customer_for_email'
	| 'unknown'
	| 'unable_to_get_user_info'
	| 'unauthorized'
	| 'bad_body'
	| 'bad_file_type'

export const NO_CUSTOMER_FOR_EMAIL: ErrorCode = 'no_customer_for_email'
export const UNABLE_TO_GET_USER_INFO: ErrorCode = 'unable_to_get_user_info'
export const UNAUTHORIZED: ErrorCode = 'unauthorized'
export const UNKNOWN: ErrorCode = 'unknown'
export const BAD_BODY: ErrorCode = 'bad_body'
export const BAD_FILE_TYPE: ErrorCode = 'bad_file_type'
