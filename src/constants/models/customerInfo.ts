export interface CustomerInfo {
	priceLimit?: {
		limit: number
		fieldName: string
		alertEmail: string
	}
	entityFields?: {
		disabledFields: string[]
		suppliersList: Array<{
			name: string
			[key: string]: string
		}>
	}
	projectsList?: string[]
	spreadsheetExport?: {
		// Remove token, request user to share with service account instead
		refreshTokenOfWriter: string
		spreadsheetId: string
	}
	defaults?: {
		submitSettings?: {
			generatePdfs?: boolean
			generateMasterPdf?: boolean
		}
	}
}
