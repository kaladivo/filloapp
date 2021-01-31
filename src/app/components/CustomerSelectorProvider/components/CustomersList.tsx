import React from 'react'
import {List, ListItem, ListItemText} from '@material-ui/core'
import Customer from '../../../../constants/models/Customer'

function CustomersList({
	customers,
	onClick,
}: {
	customers: Customer[]
	onClick: (customer: Customer) => void
}) {
	return (
		<List>
			{customers.map((customer) => (
				<ListItem button onClick={() => onClick(customer)} key={customer.id}>
					<ListItemText>{customer.name}</ListItemText>
				</ListItem>
			))}
		</List>
	)
}

export default CustomersList
