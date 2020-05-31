import React from 'react'
import {Link} from '@material-ui/core'

interface Props {
	className?: string
	file: {
		name: string
		id: string
	}
}

function GoogleFilePreview({className, file}: Props) {
	return (
		<Link
			className={className}
			target="_blank"
			href={`https://docs.google.com/document/d/${file.id}`}
		>
			{file.name}
		</Link>
	)
}

export default GoogleFilePreview
