import React, {useCallback, useState} from 'react'
import clsx from 'clsx'
import {
	Button,
	CircularProgress,
	createStyles,
	makeStyles,
	Modal,
	TextField,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useSnackbar} from 'notistack'
import {useApiService} from '../../../api/apiContext'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		modalStyle: {
			top: '50%',
			left: '50%',
			transform: `translate(-50%, -50%)`,
			position: 'absolute',
			width: 400,
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
		consent: {
			marginTop: theme.spacing(3),
			color: theme.palette.grey.A200,
		},
	})
)

interface Props {
	className?: string
	open: boolean
	onOpen: (value: boolean) => void
}

function getEmptyData() {
	return {
		name: '',
		mail: '',
		phoneNumber: '',
		message: '',
	}
}

function ContactFormOverlay({className, open, onOpen}: Props): JSX.Element {
	const classes = useStyles()
	const {t} = useTranslation()
	const api = useApiService()
	const {enqueueSnackbar} = useSnackbar()
	const [data, setData] = useState(getEmptyData())

	const submitDataTask = useAsync({
		deferFn: useCallback(async () => {
			try {
				await api.contactForm.submitContactForm(data)
				enqueueSnackbar(t('Presentation.contactForm.success'), {
					variant: 'success',
				})
			} catch (e) {
				enqueueSnackbar(t('Presentation.contactForm.error'), {variant: 'error'})
			}
		}, [data, setData, api]),
	})

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!submitDataTask.isLoading) submitDataTask.run()
	}

	return (
		<div className={clsx(classes.root, className)}>
			<Modal open={open} onClose={() => onOpen(false)}>
				<div className={classes.modalStyle}>
					<Typography variant="h4" id="simple-modal-title">
						{t('Presentation.contactForm.title')}
					</Typography>
					<Typography id="simple-modal-title">
						{t('Presentation.contactForm.subtitle')}
					</Typography>
					<form onSubmit={handleSubmit}>
						<TextField
							value={data.name}
							variant="filled"
							fullWidth
							margin="normal"
							label={t('Presentation.contactForm.name')}
							helperText={t('Presentation.contactForm.optional')}
							onChange={(e) => {
								const {value} = e.target
								setData((old) => ({...old, name: value}))
							}}
						/>
						<TextField
							value={data.mail}
							variant="filled"
							fullWidth
							type="email"
							margin="normal"
							label={t('Presentation.contactForm.mail')}
							helperText={t('Presentation.contactForm.optional')}
							onChange={(e) => {
								const {value} = e.target
								setData((old) => ({...old, mail: value}))
							}}
						/>
						<TextField
							value={data.phoneNumber}
							variant="filled"
							fullWidth
							margin="normal"
							label={t('Presentation.contactForm.phoneNumber')}
							helperText={t('Presentation.contactForm.optional')}
							onChange={(e) => {
								const {value} = e.target
								setData((old) => ({...old, phoneNumber: value}))
							}}
						/>
						<TextField
							value={data.message}
							variant="filled"
							fullWidth
							rows={5}
							margin="normal"
							label={t('Presentation.contactForm.message')}
							helperText={t('Presentation.contactForm.optional')}
							multiline
							onChange={(e) => {
								const {value} = e.target
								setData((old) => ({...old, message: value}))
							}}
						/>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							disabled={submitDataTask.isLoading}
						>
							{submitDataTask.isLoading ? (
								<CircularProgress />
							) : (
								t('common.submit')
							)}
						</Button>
						<Typography className={classes.consent} variant="subtitle2">
							{t('Presentation.contactForm.consent')}
						</Typography>
					</form>
				</div>
			</Modal>
		</div>
	)
}

export default ContactFormOverlay
