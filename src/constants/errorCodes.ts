export type ErrorCode =
	| 'no_customer_for_email'
	| 'unknown'
	| 'unable_to_get_user_info'
	| 'unable_to_get_google_file'
	| 'not_found'
	| 'unauthorized'
	| 'bad_body'
	| 'bad_file_type'
	| 'resource_not_deleted'
	| 'forbidden'
	| 'bad_pagination'

export const NO_CUSTOMER_FOR_EMAIL: ErrorCode = 'no_customer_for_email'
export const UNABLE_TO_GET_USER_INFO: ErrorCode = 'unable_to_get_user_info'
export const UNAUTHORIZED: ErrorCode = 'unauthorized'
export const UNKNOWN: ErrorCode = 'unknown'
export const BAD_BODY: ErrorCode = 'bad_body'
export const BAD_FILE_TYPE: ErrorCode = 'bad_file_type'
export const NOT_DELETED: ErrorCode = 'resource_not_deleted'
export const FORBIDDEN: ErrorCode = 'forbidden'
export const NOT_FOUND: ErrorCode = 'not_found'
export const BAD_PAGINATION: ErrorCode = 'bad_pagination'
export const UNABLE_TO_GET_GOOGLE_FILE: ErrorCode = 'unable_to_get_google_file'

const errorCodes: {[key: string]: ErrorCode} = {
	NO_CUSTOMER_FOR_EMAIL,
	UNABLE_TO_GET_USER_INFO,
	UNAUTHORIZED,
	UNKNOWN,
	BAD_BODY,
	BAD_FILE_TYPE,
	NOT_DELETED,
	FORBIDDEN,
	NOT_FOUND,
	BAD_PAGINATION,
	UNABLE_TO_GET_GOOGLE_FILE,
}

export default errorCodes
