/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('blueprint_field', {
		options: {
			type: 'jsonb',
			notNull: true,
			default: '{}',
		},
	})
}
