/* eslint-disable @typescript-eslint/camelcase */
import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.dropConstraint('user_customer', 'user_customer_pkey')
	pgm.addColumn('user_customer', {
		id: {
			type: 'serial',
			primaryKey: true,
			unique: true,
		},
	})

	pgm.addConstraint('user_customer', 'user_customer_uindex', {
		unique: ['user_email', 'customer_id'],
	})

	// TODO migrate: blueprints_group_submit, 'blueprint', 'blueprints_group'

	// blueprints_group_submit
	pgm.addColumn('blueprints_group_submit', {
		submitted_by_user_customer_id: {
			type: 'serial',
		},
	})

	pgm.sql(`
      update blueprints_group_submit bgs
      set submitted_by_user_customer_id = (
          select id
          from user_customer uc
          where uc.user_email = bgs.submitted_by_email
          limit 1
      )
  `)

	pgm.addConstraint(
		'blueprints_group_submit',
		'submitted_by_user_customer_id_user_customer_id_fk',
		{
			foreignKeys: {
				references: 'user_customer(id)',
				columns: 'submitted_by_user_customer_id',
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
		}
	)
	pgm.alterColumn('blueprints_group_submit', 'submitted_by_user_customer_id', {
		notNull: true,
	})
	pgm.dropColumn('blueprints_group_submit', 'submitted_by_email')

	// blueprint
	pgm.addColumn('blueprint', {
		user_customer_id: {
			type: 'serial',
		},
	})
	pgm.sql(`
      update blueprint b
      set user_customer_id = (
          select id
          from user_customer uc
          where uc.user_email = b.user_email
          limit 1
      )
  `)
	pgm.alterColumn('blueprint', 'user_customer_id', {
		notNull: true,
	})

	pgm.addConstraint('blueprint', 'blueprint_user_customer_id_fk', {
		foreignKeys: {
			references: 'user_customer(id)',
			columns: 'user_customer_id',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	pgm.addConstraint(
		'blueprint',
		'blueprint_google_docs_id_user_customer_id_uindex',
		{
			unique: ['google_docs_id', 'user_customer_id'],
		}
	)

	pgm.dropColumn('blueprint', 'user_email')

	// Blueprint group
	pgm.addColumn('blueprints_group', {
		user_customer_id: {
			type: 'serial',
		},
	})
	pgm.sql(`
      update blueprints_group bg
      set user_customer_id = (
          select id
          from user_customer uc
          where uc.user_email = bg.created_by
          limit 1
      )
  `)
	pgm.alterColumn('blueprints_group', 'user_customer_id', {
		notNull: true,
	})

	pgm.addConstraint('blueprints_group', 'blueprint_group_user_customer_id_fk', {
		foreignKeys: {
			references: 'user_customer(id)',
			columns: 'user_customer_id',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	pgm.dropColumn('blueprints_group', 'created_by')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	// blueprints_group_submit
	pgm.addColumn('blueprints_group_submit', {
		submitted_by_email: {
			type: 'text',
		},
	})

	pgm.sql(`
		update blueprints_group_submit bgs
		set submitted_by_email = (
		    select user_email
		    from user_customer uc
		    where bgs.submitted_by_user_customer_id = uc.id
		    limit 1
			)
	`)
	pgm.alterColumn('blueprints_group_submit', 'submitted_by_email', {
		notNull: true,
	})
	pgm.addConstraint(
		'blueprints_group_submit',
		'blueprint_submit_user_email_fk',
		{
			foreignKeys: {
				references: '"user" (email)',
				columns: 'submitted_by_email',
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
		}
	)
	pgm.dropColumn('blueprints_group_submit', 'submitted_by_user_customer_id')

	// blueprint
	pgm.addColumn('blueprint', {
		user_email: {
			type: 'text',
		},
	})

	pgm.sql(`
		update blueprint b
		set user_email = (
		    select user_email
		    from user_customer uc
		    where b.user_customer_id = uc.id
		    limit 1
			)
	`)

	pgm.alterColumn('blueprint', 'user_email', {
		notNull: true,
	})

	pgm.addConstraint('blueprint', 'blueprint_user_email_fk', {
		foreignKeys: {
			references: '"user" (email)',
			columns: 'user_email',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})

	pgm.addConstraint('blueprint', 'blueprint_google_docs_id_user_email_uindex', {
		unique: ['google_docs_id', 'user_email'],
	})

	pgm.dropColumn('blueprint', 'user_customer_id')

	// blueprint groudp
	pgm.addColumn('blueprints_group', {
		created_by: {
			type: 'text',
		},
	})

	pgm.sql(`
		update blueprints_group bg
		set created_by = (
		    select user_email
		    from user_customer uc
		    where bg.user_customer_id = uc.id
		    limit 1
			)
	`)

	pgm.alterColumn('blueprints_group', 'created_by', {
		notNull: true,
	})

	pgm.addConstraint('blueprints_group', 'blueprint_group_user_email_fk', {
		foreignKeys: {
			references: '"user" (email)',
			columns: 'created_by',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		},
	})
	pgm.dropColumn('blueprints_group', 'user_customer_id')

	//
	//
	pgm.dropConstraint('user_customer', 'user_customer_uindex')
	pgm.dropConstraint('user_customer', 'user_customer_pkey')
	pgm.dropColumn('user_customer', 'id')

	pgm.addConstraint('user_customer', 'user_customer_pkey', {
		primaryKey: ['user_email', 'customer_id'],
	})
}
