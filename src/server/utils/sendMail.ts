import Sendmail from 'sendmail'

const sendmail = Sendmail({})

export default async function sendMail({
	to,
	subject,
	html,
}: {
	to: string
	subject: string
	html: string
}) {
	return new Promise((resolve, reject) => {
		sendmail(
			{
				from: 'app@filloapp.com',
				to,
				subject,
				html,
			},
			function (err, reply) {
				if (err) {
					reject(err)
					return
				}
				resolve(reply)
			}
		)
	})
}
