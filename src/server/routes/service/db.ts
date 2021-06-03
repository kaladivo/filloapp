import {PoolClient} from 'pg'

export async function deleteCustomer({
	dbClient,
	customerId,
}: {
	dbClient: PoolClient
	customerId: string
}) {
	await dbClient.query(
		`
        DELETE
        FROM blueprint_field
            USING blueprint_field AS bf
                LEFT JOIN blueprint b ON b.id = bf.blueprint_id
                LEFT JOIN user_customer uc ON uc.id = b.user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND blueprint_field.id = bf.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM "document"
            USING "document" d
                LEFT JOIN blueprints_group_submit bgs ON d.blueprints_submit_group_id = bgs.id
                LEFT JOIN user_customer uc ON uc.id = bgs.submitted_by_user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND "document".id = d.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM filled_blueprint_field
            USING filled_blueprint_field fbf
                LEFT JOIN blueprints_group_submit bgs ON bgs.id = fbf.blueprints_group_submit_id
                LEFT JOIN user_customer uc ON uc.id = bgs.submitted_by_user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND filled_blueprint_field.id = fbf.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM generated_document
            USING generated_document gd
                LEFT JOIN blueprints_group_submit bgs ON bgs.id = gd.blueprints_group_submit_id
                LEFT JOIN user_customer uc ON uc.id = bgs.submitted_by_user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND generated_document.id = gd.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM blueprints_group_submit
            USING blueprints_group_submit bgs
                LEFT JOIN user_customer uc ON uc.id = bgs.submitted_by_user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND blueprints_group_submit.id = bgs.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM incrementing_field_value
            USING incrementing_field_value ifv
                LEFT JOIN incrementing_field_type ift ON ift.id = ifv.incrementing_field_type_id
                LEFT JOIN customer c ON c.id = ift.customer_id
        WHERE c.id = $1
          AND incrementing_field_value.incrementing_field_type_id = ifv.incrementing_field_type_id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM incrementing_field_type
            USING incrementing_field_type ift
                LEFT JOIN customer c ON c.id = ift.customer_id
        WHERE c.id = $1
          AND incrementing_field_type.id = ift.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM blueprint_blueprints_group
            USING blueprint_blueprints_group bbg
                LEFT JOIN blueprints_group bg ON bbg.blueprint_group_id = bg.id
                LEFT JOIN user_customer uc ON bg.user_customer_id = uc.id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND blueprint_blueprints_group.blueprint_id = bbg.blueprint_id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM blueprints_group
            USING blueprints_group bg
                LEFT JOIN user_customer uc ON bg.user_customer_id = uc.id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND blueprints_group.id = bg.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM blueprint
            USING blueprint b
                LEFT JOIN user_customer uc ON uc.id = b.user_customer_id
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND blueprint.id = b.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM user_customer
            USING user_customer uc
                LEFT JOIN customer c ON c.id = uc.customer_id
        WHERE c.id = $1
          AND user_customer.id = uc.id;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM customer c
        WHERE c.id = $1;
    `,
		[customerId]
	)
	await dbClient.query(
		`
        DELETE
        FROM "user"
            USING "user" u
                LEFT JOIN (SELECT user_email, count(*) AS user_usage
                           FROM user_customer uc
                           GROUP BY 1) uc ON uc.user_email = u.email
        WHERE uc.user_usage = 0
          AND "user".email = u.email;
    `,
		[]
	)
}
