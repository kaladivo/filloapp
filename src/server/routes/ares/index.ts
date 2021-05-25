import Router from 'koa-router'
import axios from 'axios'
import xml from 'fast-xml-parser'
import {getAres} from '../../../constants/api/ares'
import {withValidUserMiddleware} from '../../utils/auth'
import SendableError from '../../utils/SendableError'

const router = new Router()

async function fetchDIC(dic: string) {
	try {
		const url = `https://wwwinfo.mfcr.cz/cgi-bin/ares/darv_bas.cgi?ico=${dic}`
		const result = await axios.get(url)
		const data = xml.parse(result.data)

		return data['are:Ares_odpovedi']['are:Odpoved']['D:VBAS']['D:DIC']
	} catch (e) {
		return null
	}
}

async function fetchIco(ico: string) {
	const url = `https://wwwinfo.mfcr.cz/cgi-bin/ares/darv_std.cgi?ico=${ico}`
	const result = await axios.get(url)

	const data = xml.parse(result.data)

	const root = data['are:Ares_odpovedi']['are:Odpoved']['are:Zaznam']
	const identification = root['are:Identifikace']['are:Adresa_ARES']

	return {
		name: root['are:Obchodni_firma'],
		ico: root['are:ICO'],
		okres: identification['dtt:Nazev_okresu'],
		obec: identification['dtt:Nazev_obce'],
		castObce: identification['dtt:Nazev_casti_obce'],
		mestskaCast: identification['dtt:Nazev_mestske_casti'],
		ulice: identification['dtt:Nazev_ulice'],
		domovni: identification['dtt:Cislo_domovni'],
		orientacni: identification['dtt:Cislo_orientacni'],
		psc: identification['dtt:PSC'],
		dic: await fetchDIC(ico),
	}
}

router.get(getAres, withValidUserMiddleware, async (ctx, next) => {
	const {ico} = ctx.params

	try {
		ctx.response.body = await fetchIco(ico)
		console.log(ctx.response.body)
	} catch (e) {
		console.log(e)
		// TODO sentry
		// TODO handle 404 error
		throw new SendableError('not found', {status: 404, errorCode: 'not_found'})
	}

	await next()
})

export default router
