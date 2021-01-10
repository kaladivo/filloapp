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

function PrivacyPolicy() {
	const classes = useStyles()
	return (
		<PresentationTemplate>
			<Container className={classes.root} maxWidth="md">
				<Title1>Privacy Policy</Title1>
				<Paragraph>Last updated: 26.5.2020</Paragraph>
				<Paragraph>
					Fillo app operates http://filloapp.cz/ (the &quot;Site&quot;). This
					page informs you of our policies regarding the collection, use and
					disclosure of Personal Information we receive from users of the Site.
				</Paragraph>
				<Paragraph>
					We use your Personal Information only for providing and improving the
					Site. By using the Site, you agree to the collection and use of
					information in accordance with this policy.
				</Paragraph>
				<Title2>Information Collection And Use</Title2>
				<Paragraph>
					While using our Site, we may ask you to provide us with certain
					personally identifiable information that can be used to contact or
					identify you. Personally identifiable information may include, but is
					not limited to your name (&quot;Personal Information&quot;).
				</Paragraph>
				<Title2>Log Data</Title2>
				<Paragraph>
					Like many site operators, we collect information that your browser
					sends whenever you visit our Site (&quot;Log Data&quot;).
				</Paragraph>
				<Paragraph>
					This Log Data may include information such as your computer&apos;s
					Internet Protocol (&quot;IP&quot;) address, browser type, browser
					version, the pages of our Site that you visit, the time and date of
					your visit, the time spent on those pages and other statistics.
				</Paragraph>
				<Paragraph>
					In addition, we may use third party services such as Google Analytics
					that collect, monitor and analyze this …
				</Paragraph>
				<Title2>Data manipulation</Title2>
				<Paragraph>
					We will access users Google drive with his confirmation to do
					following actions:
					<ul>
						<li>Upload a copy of document with users input from the app</li>
						<li>All the files are stored on users Google drive only</li>
						<li>
							All the file sharing is defined by user in his Google drive
							environment
						</li>
					</ul>
				</Paragraph>
				<Paragraph>
					If we download and store any documents or sheets from the user&apos;s
					drive, we will store them only for time necessary to do an action
					requested by the user and remove them as soon as possible. No file
					will be stored on our servers for a longer period of time.
				</Paragraph>
				<Paragraph>
					We will download the documents only for following tasks and remove
					them once they are done:
					<ol>
						<li>Converting file to pdf</li>
						<li>Joining multiple documents into bigger pdf</li>
					</ol>
				</Paragraph>
				<Paragraph>
					Users can revoke an access anytime. All the data contributions will be
					deleted within 30 days after the user&apos;s email request.
				</Paragraph>
				<Title2>Communications</Title2>
				<Paragraph>
					We may use your Personal Information to contact you with newsletters,
					marketing or promotional materials and other information.
				</Paragraph>
				<Title2>Cookies</Title2>
				<Paragraph>
					Cookies are files with small amount of data, which may include an
					anonymous unique identifier. Cookies are sent to your browser from a
					web site and stored on your computer&apos;s hard drive.
				</Paragraph>
				<Paragraph>
					Like many sites, we use &quot;cookies&quot; to collect information.
					You can instruct your browser to refuse all cookies or to indicate
					when a cookie is being sent. However, if you do not accept cookies,
					you may not be able to use some portions of our Site.
				</Paragraph>
				<Title2>Security</Title2>
				<Paragraph>
					The security of your Personal Information is important to us, but
					remember that no method of transmission over the Internet, or method
					of electronic storage, is 100% secure. While we strive to use
					commercially acceptable means to protect your Personal Information, we
					cannot guarantee its absolute security.
				</Paragraph>
				<Title2>Changes To This Privacy Policy</Title2>
				<Paragraph>
					This Privacy Policy is effective as of 26.5.2020 and will remain in
					effect except with respect to any changes in its provisions in the
					future, which will be in effect immediately after being posted on this
					page.
				</Paragraph>
				<Paragraph>
					We reserve the right to update or change our Privacy Policy at any
					time and you should check this Privacy Policy periodically. Your
					continued use of the Service after we post any modifications to the
					Privacy Policy on this page will constitute your acknowledgment of the
					modifications and your consent to abide and be bound by the modified
					Privacy Policy.
				</Paragraph>
				<Paragraph>
					If we make any material changes to this Privacy Policy, we will notify
					you either through the email address you have provided us, or by
					placing a prominent notice on our website.
				</Paragraph>
				<Title2>Contact Us</Title2>
				<Paragraph>
					If you have any questions about this Privacy Policy, please contact us
					via email hynjin@gmail.com.
				</Paragraph>
			</Container>
		</PresentationTemplate>
	)
}

export default PrivacyPolicy
