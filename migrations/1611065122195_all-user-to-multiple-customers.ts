/* eslint-disable @typescript-eslint/camelcase, camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('user_customer', {
		user_email: {
			type: 'text',
			notNull: true,
			primaryKey: true,
		},
		customer_id: {
			type: 'char(20)',
			notNull: true,
			primaryKey: true,
		},
		permissions: {
			type: 'jsonb',
			notNull: true,
			default: '{}',
		},
	})

	pgm.addConstraint('user_customer', 'user_customer_customer_id_fk', {
		foreignKeys: {
			references: 'customer(id)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
			columns: 'customer_id',
		},
	})

	pgm.addConstraint('user_customer', 'user_customer_user_email_fk', {
		foreignKeys: {
			columns: 'user_email',
			references: '"user" (email)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	const users = await pgm.db.query(`
      select email,
             customer_id as "customerId"
      from "user"
  `)

	console.log('wtf', users)
	users.rows.forEach((user) => {
		pgm.sql(
			`
	        insert into user_customer (user_email, customer_id)
	        values ('${user.email}', '${user.customerId}')
	    `
		)
	})

	pgm.dropColumn('user', 'customer_id')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumns('user', {
		'customer_id': {
			type: 'char(20)',
		},
	})

	// Check if user has more customers
	const {
		rows: [{ableToRollback}],
	} = await pgm.db.query(`
      select count(*) = 0 as "ableToRollback"
      from (select count(*) as "count" from user_customer group by user_email) as numberOfCustomers
      where count > 1
  `)
	if (!ableToRollback)
		throw new Error(
			'Unable to rollout, there is at least one user that is assigned to multiple customers. Rolling back would result in data lost'
		)

	const usersCustomers = await pgm.db.query(`select *
            
                                             from user_customer`)
	usersCustomers.rows.forEach(({user_email, customer_id}) => {
		pgm.sql(`
			update "user"
			set customer_id = '${customer_id}'
			where email = '${user_email}' 
		`)
	})

	pgm.addConstraint('user', 'user_customer_id_fk', {
		foreignKeys: {
			columns: 'customer_id',
			references: 'customer(id)',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})
	pgm.dropTable('user_customer')
}
