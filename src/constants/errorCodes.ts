export type ErrorCode =
	| 'no_customer_for_email'
	| 'user_does_not_belong_to_specified_customer'
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
	| 'unable_to_access_drive_file'
	| 'unable_to_access_output_folder'
	| 'error_generating_documents'
	| 'user_must_have_customer_selected'
	| 'USER_DOES_NOT_EXIST'

export const NO_CUSTOMER_FOR_EMAIL: ErrorCode = 'no_customer_for_email'
export const USER_MUST_HAVE_CUSTOMER_SELECTED: ErrorCode =
	'user_must_have_customer_selected'
export const UNABLE_TO_GET_USER_INFO: ErrorCode = 'unable_to_get_user_info'
export const USER_DOES_NOT_BELONG_TO_SPECIFIED_CUSTOMER: ErrorCode =
	'user_does_not_belong_to_specified_customer'
export const UNAUTHORIZED: ErrorCode = 'unauthorized'
export const UNKNOWN: ErrorCode = 'unknown'
export const BAD_BODY: ErrorCode = 'bad_body'
export const BAD_FILE_TYPE: ErrorCode = 'bad_file_type'
export const NOT_DELETED: ErrorCode = 'resource_not_deleted'
export const FORBIDDEN: ErrorCode = 'forbidden'
export const NOT_FOUND: ErrorCode = 'not_found'
export const BAD_PAGINATION: ErrorCode = 'bad_pagination'
export const USER_DOES_NOT_EXIST: ErrorCode = 'USER_DOES_NOT_EXIST'
export const UNABLE_TO_GET_GOOGLE_FILE: ErrorCode = 'unable_to_get_google_file'
export const ERROR_GENERATING_DOCUMENT: ErrorCode = 'error_generating_documents'
export const UNABLE_TO_ACCESS_DRIVE_FILE: ErrorCode =
	'unable_to_access_drive_file'
export const UNABLE_TO_ACCESS_OUTPUT_FOLDER: ErrorCode =
	'unable_to_access_output_folder'

const errorCodes = {
	NO_CUSTOMER_FOR_EMAIL,
	USER_DOES_NOT_EXIST,
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
	UNABLE_TO_ACCESS_DRIVE_FILE,
	UNABLE_TO_ACCESS_OUTPUT_FOLDER,
	ERROR_GENERATING_DOCUMENT,
	USER_DOES_NOT_BELONG_TO_SPECIFIED_CUSTOMER,
	USER_MUST_HAVE_CUSTOMER_SELECTED,
}

export default errorCodes
