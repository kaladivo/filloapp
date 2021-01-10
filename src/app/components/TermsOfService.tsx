import React from 'react'
import {
	Container,
	createStyles,
	makeStyles,
	Typography,
} from '@material-ui/core'
import PresentationTemplate from './PresentationTemplate'

// TODO kaladivo: move this into translation strings

function Title1({children}: {children: React.ReactNode}) {
	return (
		<Typography variant="h3" component="h1">
			{children}
		</Typography>
	)
}
function Title2({children}: {children: React.ReactNode}) {
	return (
		<Typography variant="h4" component="h2">
			{children}
		</Typography>
	)
}
function Paragraph({children}: {children: React.ReactNode}) {
	return (
		<Typography variant="body1" component="p">
			{children}
		</Typography>
	)
}

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			'& > *': {
				margin: theme.spacing(2, 0),
			},
		},
	})
)

function TermsOfService() {
	const classes = useStyles()
	return (
		<PresentationTemplate>
			<Container className={classes.root} maxWidth="md">
				<Title1>Terms and Conditions (&quot;Terms&quot;)</Title1>
				<Paragraph>Last updated: 26.5.2020</Paragraph>
				<Paragraph>
					Please read these Terms and Conditions (&quot;Terms&quot;, &quot;Terms
					and Conditions&quot;) carefully before using the http://filloapp.cz/
					website and the Fillo mobile application (the &quot;Service&quot;)
					operated by us.
				</Paragraph>
				<Paragraph>
					Your access to and use of the Service is conditioned on your
					acceptance of and compliance with these Terms. These Terms apply to
					all visitors, users and others who access or use the Service.
				</Paragraph>
				<Paragraph>
					<b>
						By accessing or using the Service you agree to be bound by these
						Terms. If you disagree with any part of the terms then you may not
						access the Service.
					</b>
				</Paragraph>
				<Title2>Purchases</Title2>
				<Paragraph>
					If you wish to purchase any product or service made available through
					the Service (&quot;Purchase&quot;), you may be asked to supply certain
					information relevant to your Purchase including, without limitation,
					your payment detail and invoice description.
				</Paragraph>
				<Title2>Subscriptions</Title2>
				<Paragraph>
					Some parts of the Service are billed on a subscription basis
					(&quot;Subscription(s)&quot;). You will be billed in advance on a
					recurring.
				</Paragraph>
				<Title2>Content</Title2>
				<Paragraph>
					Our Service allows you to edit your documents. You are responsible for
					the content and usage of these documents.
				</Paragraph>
				<Paragraph>
					Our Service may contain links to third-party web sites or services
					that are not owned or controlled by us.
				</Paragraph>
				<Paragraph>
					We have no control over, and assumes no responsibility for, the
					content, privacy policies, or practices of any third party web sites
					or services. You further acknowledge and agree that we shall not be
					responsible or liable, directly or indirectly, for any damage or loss
					caused or alleged to be caused by or in connection with use of or
					reliance on any such content, goods or services available on or
					through any such web sites or services.
				</Paragraph>
				<Title2>Changes</Title2>
				<Paragraph>
					We reserve the right, at our sole discretion, to modify or replace
					these Terms at any time. If a revision is material we will try to
					provide at least 30 days&apos; notice prior to any new terms taking
					effect. What constitutes a material change will be determined at our
					sole discretion.
				</Paragraph>

				<Title2>Contact Us</Title2>
				<Paragraph>
					If you have any questions about these Terms, please contact us via
					email hynjin@gmail.com
				</Paragraph>
			</Container>
		</PresentationTemplate>
	)
}

export default TermsOfService
