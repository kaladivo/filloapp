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
		refreshTokenOfWriter: string
		spreadsheetId: string
	}
}
