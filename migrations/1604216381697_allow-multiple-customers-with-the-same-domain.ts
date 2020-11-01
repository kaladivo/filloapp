/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumns('user', {
		'customer_id': {
			type: 'char(20)',
		},
	})

	// Set correct values to customer id
	pgm.sql(
		`update "user" u set customer_id = (select domain.customer_id from domain where domain.domain = u.domain)`
	)

	pgm.addConstraint('user', 'user_customer_id_fk', {
		foreignKeys: {
			columns: 'customer_id',
			references: 'customer(id)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	pgm.alterColumn('user', 'customer_id', {
		notNull: true,
	})

	pgm.dropConstraint('user', 'user_domain_domain_fk')
	pgm.dropConstraint('domain', 'domains_customer_id')
	pgm.dropTable('domain')
	pgm.dropColumn('user', 'domain')

	pgm.alterColumn('user', 'google_access_token', {
		notNull: false,
	})
	pgm.dropColumn('user', 'google_refresh_token')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropConstraint('user', 'user_customer_id_fk')
	pgm.dropColumn('user', 'customer_id')

	pgm.createTable('domain', {
		domain: {
			type: 'text',
			notNull: true,
			primaryKey: true,
			unique: true,
		},
		customer_id: {
			type: 'char(20)',
			notNull: true,
		},
	})

	pgm.addConstraint('domain', 'domains_customer_id', {
		foreignKeys: {
			references: 'customer(id)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
			columns: 'customer_id',
		},
	})

	pgm.addColumn('user', {
		domain: {
			type: 'text',
		},
	})

	const tempCustomerId = 'a0000000000000000000'
	const tempDomain = 'temp.temp'
	// create domains
	pgm.sql(
		`
		insert into customer (id, "name", info) values ('${tempCustomerId}', 'temp', '{}');
		insert into "domain" ("domain", customer_id) values ('${tempDomain}', '${tempCustomerId}');
		update "user" u set "domain" = '${tempDomain}';
	`
	)

	pgm.addConstraint('user', 'user_domain_domain_fk', {
		foreignKeys: {
			columns: 'domain',
			references: 'domain(domain)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	pgm.alterColumn('user', 'domain', {
		notNull: true,
	})

	pgm.sql(`
		update "user" set google_access_token = 'notset'
	`)

	pgm.alterColumn('user', 'google_access_token', {
		notNull: true,
	})

	pgm.addColumn('user', {
		'google_refresh_token': {
			type: 'text',
		},
	})
}
