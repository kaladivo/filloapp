import {FormFile, FormFields} from '../../../api/forms/model'

const formFields: FormFields = {
	jmeno: {
		name: 'Jméno (jména)',
	},
	prijmeni: {
		name: 'Příjmení',
	},
	rodne: {
		name: 'Rodné číslo (není-li, datum narození)',
	},
	datumnarozeni: {
		name: 'Datum narození',
	},
	kdenarozen: {
		name: 'Obec a stát místa narození',
		description: 'Tak jak uvedeno v OP',
	},
	obcanstvi: {
		name: 'Státní občanství',
	},
	adresa: {
		name: 'Trvalý nebo jiný pobyt',
	},
	telefon: {
		name: 'Kontaktní telefon',
		description: 'Ve formatu +XXX XXX XXX XXX',
	},
	mail: {
		name: 'Emailová adresa',
	},
	prukaz: {
		name: 'Číslo průkazu totožnosti',
	},
	vydan: {
		name: 'Datum vydání průkazu totožnosti',
	},
	platnost: {
		name: 'Platnost průkazu totožnosti',
	},
	stat: {
		name: 'Stát, který průkaz totožnosti vydal',
	},
	organ: {
		name: 'Orgán, který průkaz totožnosti vydal',
	},
	zamestnani: {
		name: 'Zaměstnání/profese – název pozice',
	},
	ucel: {
		name: 'Účel a zamýšlená povaha obchodního vztahu',
	},
	zdroj: {
		name: 'Zdroj peněžních prostředků',
	},
	misto: {
		name: 'Místo podpisu smlouvy',
	},
	datum: {
		name: 'Datum',
		description: 'Ve formátu den.měsíc rok (např.: 2.4.2020)',
	},
	makler: {
		name: 'Jméno makléře',
	},
}

export const FILES: FormFile[] = [
	{
		displayName: 'AML',
		name: 'AML {{date}}',
		id: '11x2Q2Oe10q_mHPIsrojOFvDyfD0vU8F4Gu4VitaS040',
	},
	{
		displayName: 'GDPR',
		name: 'GDPR {{date}}',
		id: '1RUgfe2CJ7ytKUfkXDvPu8Cj2Cz7cpjUj_DmKdr_CJhI',
	},
	{
		displayName: 'Mimo kancelář - seznámení',
		name: 'Mimo kancelář - seznámení {{date}}',
		id: '1AeiwYPdvqaI1KsBYr3on5qQ5J-rr9xdFK3Pzp5Ha_uY',
	},
	{
		displayName: 'Obchodní podmínky',
		name: 'Obchodní podmínky {{date}}',
		id: '1iR5IYjwxqujHZYtrbGJWKIVtvToTY2R4MYfM6p-RApE',
	},
	{
		displayName: 'OS',
		name: 'OS {{date}}',
		id: '18-ur1sJAs92tBohot9cT8qIC7I5XwEb9ZHqLX28I_Xg',
	},
	{
		displayName: 'Zprostředkovatelská služba',
		name: 'Zprostředkovatelská služba {{date}}',
		id: '1rZglY9IFWbCe6DSV6wwYqmOLQv3rfZc8GTJME9Kaxh8',
	},
]

export default formFields
