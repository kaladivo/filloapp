/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.alterColumn('user', 'additional_info', {type: 'jsonb'})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.alterColumn('user', 'additional_info', {type: 'json'})
}
