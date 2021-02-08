import React from 'react'
import {
	createStyles,
	List,
	ListItem,
	ListItemText,
	makeStyles,
} from '@material-ui/core'
import Customer from '../../../../constants/models/Customer'

const useStyles = makeStyles(() =>
	createStyles({
		itemText: {
			textAlign: 'center',
		},
	})
)

function CustomersList({
	customers,
	onClick,
}: {
	customers: Customer[]
	onClick: (customer: Customer) => void
}) {
	const classes = useStyles()
	return (
		<List>
			{customers.map((customer) => (
				<ListItem
					button
					onClick={() => onClick(customer)}
					key={customer.customerId}
				>
					<ListItemText className={classes.itemText}>
						<b>{customer.name}</b>
					</ListItemText>
				</ListItem>
			))}
		</List>
	)
}

export default CustomersList
