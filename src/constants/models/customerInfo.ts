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
		spreadsheetId: string
	}
	defaults?: {
		submitSettings?: {
			generatePdfs?: boolean
			generateMasterPdf?: boolean
			folder?: {
				id: string
				name: string
			}
		}
	}
}
