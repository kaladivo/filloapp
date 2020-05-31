import React from 'react'
import {Card, CardContent, Typography, Button} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {BlueprintsGroupPreview} from '../../../../constants/models/BlueprintsGroup'

interface Props {
	className?: string
	blueprintGroup: BlueprintsGroupPreview
}

function BlueprintsGroupItem({className, blueprintGroup}: Props) {
	return (
		<Card className={className}>
			<CardContent>
				<Typography variant="h6">{blueprintGroup.name}</Typography>
				<div className="buttons">
					<Button
						variant="contained"
						color="primary"
						component={Link}
						to={`/blueprints-group/${blueprintGroup.id}`}
					>
						Detail
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export default BlueprintsGroupItem
