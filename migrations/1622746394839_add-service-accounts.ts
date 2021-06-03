/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('service_account', {
		id: {
			type: 'bigserial',
			notNull: true,
			primaryKey: true,
		},
		access_token_hash: {
			type: 'varchar(56)',
			notNull: true,
			unique: true,
		},
		description: {
			type: 'text',
		},
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTable('service_account')
}
