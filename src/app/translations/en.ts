export default {
	'appName': 'FilloApp',
	'errors': {
		'document_does_not_include_any_fields':
			'Document does not include any fields. Make sure to select documents with fields.',
	},
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
		'signIn': 'Sign in',
		'cancel': 'Cancel',
		'version': 'Version:',
	},
	'DriveFilePicker': {
		'nothingSelected': 'No files selected. Picker was closed.',
	},
	'CustomerSelect': {
		'title': 'Select team',
		'text': 'Click on team name to select it',
		'loading': 'Loading teams list',
		'selecting': 'Selecting team',
		'errorSelecting':
			'Error while selecting team. Please try selecting it again.',
	},
	'TopBar': {
		'logout': 'Logout',
		'switchCustomer': 'Switch team',
		'loggedAs': '{{email}}',
	},
	'sections': {
		'blueprintsGroups': 'Documents',
		'blueprints': 'Templates',
	},
	'LoginScreen': {
		'title': 'Sign into FilloApp',
		'text': 'Sign in with your google account',
		'loginWithGoogle': 'Sign in with google',
		'canNotSignIn': 'Can not sign you in.',
		'badDomain':
			'Your domain is not on our list, make sure you are using your work email',
	},
	OwnerInfo: {
		'createdBy': 'Created by {{name}}',
	},
	'BlueprintsGroupScreen': {
		'title': 'Forms to submit',
		'addNew': 'Add new',
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
		'selectOutputFolder': 'Select folder to save the generated items into',
		'selectedOutputFolder': 'Selected folder: {{name}}',
		'loading': 'Generating documents, this might take 10 - 30 seconds',
		'select': 'Select',
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
	'CreateBlueprintScreen': {
		'title': 'Create new template',
		'text': 'TODO',
		'error': 'Error while creating template',
		'pickerTitle': 'Pick template document',
		'pickerLabel': 'Pick template document',
	},
	'BlueprintsListScreen': {
		'createNew': 'Create new template',
		'edit': 'Edit',
		'canNotEditBlueprint':
			'You do not have permissions to edit blueprints created by other users',
	},
	'EditBlueprintScreen': {
		'title': 'Edit template',
		'errorLoadingBlueprint': 'There was an error while loading template.',
		'fieldTemplateNameLabel': 'Field name',
		'fieldTemplateNameHelper': 'Name of the field as it is in the template',
		'fieldDisplayNameLabel': 'Display name',
		'fieldDisplayNameHelper': 'Name of the field to be displayed in fillo app',
		'fieldHelperTextTitle': 'Helper text',
		'fieldHelperTextHelper':
			'You can put description here, to help others fill it.',
		'blueprintNameLabel': 'Template name',
		'blueprintNameHelper':
			'Will be used as a name of generated document. You can put values into the name also',
		'fields': 'Fields:',
		'typeIsIdExplanation':
			'This is ID field. Further configuration of this field is not yet implemented. We are working on many new features, this is one of them!',
		'typeSelectLabel': 'Field type',
		'stringTypeLabel': 'Text',
		'dateTypeLabel': 'Date',
		'numberTypeLabel': 'Number',
		'selectTypeLabel': 'Predefined options',
		'multilineLabel': 'Allow inserting newline',
		'withTimeLabel': 'Include exact time with the date',
		'currentTime': 'Prefill with current time',
		'enableMin': 'Specify minimal value',
		'enableMax': 'Specify maximal value',
		'minValue': 'Minimal value',
		'maxValue': 'Maximal value',
		'selectOptionValue': 'option {{number}}',
		'addNewField': 'Add new field',
		'newField': {
			'displayName': '',
			'helperText': '',
			'name': 'newField',
		},
		'updateSuccess': 'template successfully updated',
		'updateError': 'Error while updating template',
		'deleteDialogTitle': 'All documents will be deleted!',
		'deleteDialogContent':
			'Deleting this template will also remove all documents that this template appears in',
		'deleteSuccess': 'Successfully deleted template',
		'deleteError': 'Error while deleting template',
		'ownedBy': 'Owned by',
		'openFile': 'Open template document',
		'defaultValueLabel': 'Default value',
		'defaultValueHelper': 'Leave empty for no default value',
	},
	'BlueprintField': {
		'valueIsNotNumber': 'Filled must be a number',
		'minValueExceeded': 'Value must be higher than {{min}}',
		'maxValueExceeded': 'Value must be lower than {{max}}',
		'noDateSelected': 'No date selected',
	},
	'Presentation': {
		'menu': {
			'about': 'About',
			'faq': 'FAQ',
			'getStarted': 'Get started',
			'enterApp': 'Enter app',
		},
		'common': {
			'createAccount': 'Create an account',
		},
		'createAccountDialog': {
			'title': 'Contact us and well get back to you',
			'text': 'Contact us on email below, and we get back to you asap',
			'yes': 'Open in email app',
			'no': 'Close',
			'mailLink':
				'mailto:hynjin@gmail.com?subject=I am interested in using FilloApp',
		},
		'hero': {
			'title': 'Let your documents be filled',
			'subtitle': 'And get time for what really matters',
		},
		'about': {
			'1': {
				'title': 'Select your document templates',
				'subtitle':
					'Mark all field by puting them between curly brackets {{}}. For example {{name}} will be changed to Paul, Kate and other participants.',
			},
			'2': {
				'title': 'Let the participants fill the fields',
				'subtitle': 'Fill in your fields and start the magic.',
			},
			'3': {
				'title': 'All documents get filled',
				'subtitle':
					'All documents will be created and filled with the requested fields',
			},
			'integrations': 'Works best on your Google Drive',
		},
		'faq': {
			'title': 'FAQ',
			'1': {
				'title': 'some title',
				'text': 'lorem shit',
			},
			'2': {
				'title': 'some title',
				'text': 'lorem shit',
			},
			'3': {
				'title': 'some title',
				'text': 'lorem shit',
			},
		},
		'footer': {
			'menu': {
				'contactUs': 'Contact Us',
				'terms': 'Terms of Service',
				'privacyPolicy': 'Privacy Policy',
			},
		},
	},
}
