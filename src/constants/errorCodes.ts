export type ErrorCode =
	| 'user_does_not_exist'
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

export const USER_DOES_NOT_EXIST: ErrorCode = 'user_does_not_exist'
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
export const ERROR_GENERATING_DOCUMENT: ErrorCode = 'error_generating_documents'
export const UNABLE_TO_ACCESS_DRIVE_FILE: ErrorCode =
	'unable_to_access_drive_file'
export const UNABLE_TO_ACCESS_OUTPUT_FOLDER: ErrorCode =
	'unable_to_access_output_folder'

const errorCodes: {[key: string]: ErrorCode} = {
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
}

export default errorCodes
