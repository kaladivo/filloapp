/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('blueprint_field', {
		default_value: {
			type: 'text',
			notNull: false,
		},
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('blueprint_field', 'defaultValue')
}
