/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('user', 'customer_admin')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('user', {
		customer_admin: {
			default: false,
			type: 'boolean',
			notNull: true,
		},
	})
}
