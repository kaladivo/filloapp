/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('blueprint', {
		is_submitted: {
			type: 'boolean',
		},
	})

	pgm.sql(`
    update blueprint
    set is_submitted = true
  `)

	pgm.alterColumn('blueprint', 'is_submitted', {notNull: true})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('blueprint', 'is_submitted')
}
