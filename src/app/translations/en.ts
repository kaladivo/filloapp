export default {
	'appName': 'FilloApp',
	'common': {
		'goBack': 'Back',
		'submit': 'submit',
		'back': 'back',
		'unexpectedError': 'There was an unexpected error. Click to try again.',
		'notImplemented':
			'This is not implemented yet. Many more exciting features are comming in the future including this one',
		'retry': 'Retry',
		'delete': 'Delete',
		'loading': 'loading...',
	},
	'AuthChecker': {
		'unableToCheckUser':
			'Unable to check user. Logout and login might be required.',
	},
	'DriveFilePicker': {
		'nothingSelected': 'No files selected. Picker was closed.',
	},
	'TopBar': {
		'logout': 'Logout',
	},
	'sections': {
		'blueprintsGroups': 'Documents',
	},
	'LoginScreen': {
		'loginWithGoogle': 'Sign in with google',
		'canNotSignIn': 'Can not sign you in.',
		'badDomain':
			'Your domain is not on our list, make sure you are using your work email',
	},
	'BlueprintsGroupScreen': {
		'title': 'Forms to submit',
		'addNew': 'Add new',
		'createdBy': 'Created by {{name}}',
		'unableToDelete': 'Unable to delete. Are you the owner?',
		'deleted': 'Deleted',
		'searchLabel': 'Search by name or project',
	},
	'BlueprintsGroupDetailScreen': {
		'createdAt': 'Created at: {{date}}',
		'generatedFiles': 'Generated documents',
		'submit': 'Submit',
		'blueprints': 'Templates',
		'submits': 'Submits',
		'submitTitle': 'Submitted at: {{date}} by {{name}}',
		'generateNew': 'Edit',
		'createSubmit': 'Submit',
		'noneGeneratedYet': 'No documents were yet generated.',
		'goToFolderButton': 'Open drive folder',
		'projectName': 'Project name: {{projectName}}',
	},
	'SubmitBlueprintsGroupScreen': {
		'fillValues': 'Generating documents for {{name}}',
		'generating': 'Generating documents. This might take 10 - 30 seconds.',
		'outputName': 'Output name',
		'generatePdfs': 'Generate PDF files from generated documents',
		'generateMasterPdf': 'Generate all of the files into one PDF',
		'generateDocuments': 'Generate editable documents',
		'removeOldVersion': 'Remove old version from drive',
		'selectOutputFolder': 'Select folder to save the generated items into',
		'selectedOutputFolder': 'Selected folder: {{name}}',
		'loading': 'Generating documents, this might take 10 - 30 seconds',
		'select': 'Select',
		'versionName': 'Version name',
		'versionNameHelp': 'Will be used as a part of the name',
		'generate': 'Generate filled document',
		'outputFolderMissing': 'Output folder must be selected',
		'error': 'There was an error while generating documents',
		'editValuesAndSettings': 'Edit values/settings',
		'success': 'Documents were successfully generated!',
		'noAccess': 'You dont have access to some of the documents',
		'requireAccess': 'Require access to document {{number}}',
		'idHelp': 'Id, will be automatically incremented for each document',
		'folderFieldHelp': 'If you can not pick a file, insert folder url',
		'folderFieldBadFormat': 'Can not recognize file url',
		'folderFieldLabel': 'Folder url',
	},
	'CreateBlueprintGroupScreen': {
		'title': 'Create new Document ',
		'name': 'Name',
		'nameHelp': 'Name of the document',
		'selectBlueprintsToGenerate': 'Select templates to generate',
		'dontSeeBlueprint': 'Dont see your template?',
		'createBlueprint': 'Add a new one',
		'projectName': 'Project name',
		'projectNameDescription': 'Name of the project this document belongs to',
	},
	'CDSpecific': {
		'selectEntityLabel': 'Entity',
		'autofillFromEntity': 'Will be auto filled once the entity is selected',
		'priceExceeded':
			'Price exceeds  200 000 Kč. Make sure to get approval from Finance department',
		'syncWithSpreadsheet': 'Sync with spreadsheet',
		'syncWithSpreadsheetSuccess': 'Sync was successful',
		'syncWithSpreadsheetError': 'Error while syncing. Try again later.',
	},
}
