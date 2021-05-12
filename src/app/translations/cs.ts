export default {
	'appName': 'FilloApp',
	'errors': {
		'document_does_not_include_any_fields':
			'Dokument neobsahuje žádná pole. Vyberte prosím dokument, ve kterém jsou připravená pole.',
		'unable_to_acquire_write_access_for_service_account':
			'Aplikaci se nedaří získat přístup na váš Google disk k vytváření dokumentů. Složku vyberte buď ručně, nebo nasdílejte práva k úpravám s účtem',
	},
	'common': {
		'goBack': 'Zpět',
		'submit': 'potvrdit',
		'back': 'zpět',
		'unexpectedError': 'Došlo k neočekávané chybě. Kliknutím to zkuste znovu.',
		'notImplemented':
			'Tato funkce ještě není připravena. Chystáme pro vás mnoho dalších funkcí.',
		'retry': 'Opakovat',
		'delete': 'Smazat',
		'loading': 'načítá se ...',
		'signIn': 'Přihlásit se',
		'cancel': 'Zrušit',
		'version': 'Verze:',
	},
	'DriveFilePicker': {
		'nothingSelected': 'Nebyl vybraný žádný soubor.',
	},
	'CustomerSelect': {
		'title': 'Vybrat tým',
		'text': 'Kliknutím na název týmu ho vyberete',
		'loading': 'Načítání seznamu týmů',
		'selecting': 'Výběr týmů',
		'errorSelecting':
			'Při vybírání týmu se objevila chyba. Zkuste to prosím ještě jednou.',
	},
	'TopBar': {
		'logout': 'Odhlásit',
		'switchCustomer': 'Přepnout tým',
		'loggedAs': '{{email}}',
	},
	'sections': {
		'blueprintsGroups': 'Dokumenty',
		'blueprints': 'Vzory dokumentů',
	},
	'LoginScreen': {
		'title': 'Přihlášení do FilloApp',
		'text': 'Přihlaste se pomocí vašeho google účtu',
		'loginWithGoogle': 'Přihlásit pomocí google',
		'canNotSignIn': 'Přihlášení se nepodařilo.',
		'badDomain':
			'Vaši doménu nemáme registrovanou. Ujistěte se prosím, jestli se hlásíte správným mailem.',
	},
	OwnerInfo: {
		'createdBy': 'Autor: {{name}}',
	},
	'BlueprintsGroupScreen': {
		'title': 'Připravené dokumenty',
		'addNew': 'Přidat nový',
		'unableToDelete': 'Nelze smazat. Jste vlastníkem?',
		'deleted': 'Smazáno',
		'searchLabel': 'Vyhledat podle jména nebo projektu',
	},
	'BlueprintsGroupDetailScreen': {
		'createdAt': 'Datum vytvoření: {{date}}',
		'generatedFiles': 'Vytvořené dokumenty',
		'submit': 'Potvrdit',
		'blueprints': 'Vzory',
		'submits': 'Potvrzení',
		'submitTitle': 'Potvrdil: {{name}} {{date}}',
		'generateNew': 'Upravit',
		'createSubmit': 'Potvrdit',
		'noneGeneratedYet': 'Zatím nebyly vytvořeny žádné dokumenty.',
		'goToFolderButton': 'Otevřít složku na disku',
		'projectName': 'Jméno projektu: {{projectName}}',
	},
	'SubmitBlueprintsGroupScreen': {
		'fillValues': 'Vytváříme dokumenty pro uživatele {{name}}',
		'generating': 'Vytváříme dokumenty. Může to trvat 10 - 30 vteřin.',
		'outputName': 'Jméno výstupu',
		'generatePdfs': 'Vytvořit jednotlivé soubory',
		'generateMasterPdf': 'Vytvořit jeden souhrnný soubor',
		'generateDocument': 'Vytvořit vyplněné google documenty',
		'selectOutputFolder': 'Vybrat složku pro uložení souborů',
		'selectedOutputFolder': 'Vybraná složka: {{name}}',
		'loading': 'Vytváříme dokumenty. Může to trvat 10 - 30 vteřin.',
		'select': 'Vybrat',
		'versionNameHelp': 'Bude přidáno k názvu souborů',
		'generate': 'Vytvořit vyplněné dokumenty',
		'outputFolderMissing': 'Je potřeba vybrat cílovou složku',
		'error': 'Během vytváření souborů se objevila chyba',
		'editValuesAndSettings': 'Upravit hodnoty/nastavení',
		'success': 'Dokumenty byly úspěšně vytvořeny!',
		'noAccess': 'K některým dokumentům nemáte přístup',
		'requireAccess': 'Je potřeba přístup k dokumentu s ID číslem {{number}}',
		'idHelp':
			'ID se bude automaticky navyšovat s každým připraveným dokumentem',
		'folderFieldHelp':
			'Pokud se vám nedaří vybrat složku, zkuste prosím vložit url adresu dané složky',
		'folderFieldBadFormat': 'Nepodařilo se nám rozpoznat url adresu složky',
		'folderFieldLabel': 'Url adresa složky',
	},
	'CreateBlueprintGroupScreen': {
		'title': 'Vytvořit nový dokument ',
		'name': 'Název',
		'nameHelp': 'Název dokumentu',
		'selectBlueprintsToGenerate':
			'Vyberte vzory, ze kterých chcete vytvořit dokumenty',
		'dontSeeBlueprint': 'Nevidíte svůj vzor dokumentu?',
		'createBlueprint': 'Přidat nový',
		'projectName': 'Název projektu',
		'projectNameDescription': 'Název projektu ke kterému tento dokument patří',
	},
	'CDSpecific': {
		'selectEntityLabel': 'Společnost',
		'autofillFromEntity':
			'Bude vyplněno automaticky jakmile vyberete společnost',
		'priceExceeded':
			'Částka překročila 200 000 Kč. Ujistěte se, že získáte potvrzení z finančního oddělení',
		'syncWithSpreadsheet': 'Synchronizovat výstupní excel',
		'syncWithSpreadsheetSuccess': 'Úspěšně synchronizováno',
		'syncWithSpreadsheetError':
			'Během synchronizace nastala chyba. Zkuste to prosím znovu později.',
	},
	'CreateBlueprintScreen': {
		'title': 'Vytvořit nový vzor',
		'textMd':
			'Zde můžete vytvořit nový vzor. Je to jednoduché:  \n' +
			'1. Vyberte dokument z vašeho google drivu\n' +
			'2. Pro vytvoření pole, vložde do dokumentu text ve složených závorkách  \n' +
			'\tPříklad: jméno → &#123;&#123;jméno&#125;&#125;\n' +
			'3. Poté můžete v aplikaci nastavit typ pole. Je to číslo, text nebo datum?\n' +
			'4. Vaše pole bude při exportu nahrazeno vyplňěnou hodnotou.  \n' +
			'\tPříklad: &#123;&#123;jméno&#125;&#125; → Pavel\n',
		'error': 'Chyba při vytváření vzoru',
		'pickerTitle': 'Vyberte vzorový dokument',
		'pickerLabel': 'Vyberte vzorový dokument',
	},
	'BlueprintsListScreen': {
		'createNew': 'Vytvořit nový vzor',
		'edit': 'Upravit',
		'canNotEditBlueprint':
			'Nemáte přidělená práva k úpravě vzorů jiných uživatelů',
	},
	'EditBlueprintScreen': {
		'title': 'Upravit vzor',
		'errorLoadingBlueprint': 'Při načítání vzoru nastala chyba.',
		'fieldTemplateNameLabel': 'Název pole v souboru',
		'fieldTemplateNameHelper':
			'Název pole, který jste použili ve vzorovém dokumentu',
		'fieldDisplayNameLabel': 'Název pole',
		'fieldDisplayNameHelper':
			'Název pole, který se zobrazí uživateli při vyplňování',
		'fieldHelperTextTitle': 'Pomocný popisek',
		'fieldHelperTextHelper':
			'K políčku můžete doplnit další instrukce pro lepší srozumitelnost.',
		'blueprintNameLabel': 'Jméno vzoru',
		'blueprintNameHelper':
			'Bude použito jako jméno vytvářeného dokumentu. Můžete použít také pole. Například {{jmeno}}',
		'fields': 'Pole:',
		'typeIsIdExplanation':
			'Pole ID. Další možnosti nastavení ještě nejsou připravená.',
		'typeSelectLabel': 'Typ pole',
		'stringTypeLabel': 'Text',
		'dateTypeLabel': 'Datum',
		'numberTypeLabel': 'Číslo',
		'selectTypeLabel': 'Předvybrané možnosti',
		'multilineLabel': 'Umožnit vkládat více řádků textu',
		'withTimeLabel': 'Používat také čas',
		'currentTime': 'Předvyplnit datem vyplňování vzoru',
		'enableMin': 'Určit minimální hodnotu',
		'enableMax': 'Určit maximální hodnotu',
		'minValue': 'Minimální hodnota',
		'maxValue': 'Maximální hodnota',
		'selectOptionValue': 'možnost {{number}}',
		'addNewField': 'Přidat nové pole',
		'newField': {
			'displayName': '',
			'helperText': '',
			'name': 'nove_pole',
		},
		'updateSuccess': 'Vzor byl úspěšně aktualizován',
		'updateError': 'Během aktualizace vzoru došlo k chybě',
		'deleteDialogTitle': 'Všechny dokumenty budou smazány!',
		'deleteDialogContent':
			'Smazáním tohoto vzoru zároveň smažete v aplikaci všechny dokumenty, které jsou z tohoto vzoru vytvořené. Soubory na vašem disku zůstanou.',
		'deleteSuccess': 'Úspěšně smazaný vzor',
		'deleteError': 'Chyba při mazání vzoru',
		'ownedBy': 'Vlastník:',
		'openFile': 'Otevřít vzorový dokument',
		'defaultValueLabel': 'Výchozí hodnota',
		'defaultValueHelper':
			'Pole nechte prázdné, pokud žádnou výchozí hodnotu nechcete určovat.',
	},
	'BlueprintField': {
		'valueIsNotNumber': 'V tomto poli musí být vyplněno číslo',
		'minValueExceeded': 'Hodnota musí být alespoň {{min}}',
		'maxValueExceeded': 'Hodnota nesmí být vyšší než {{max}}',
		'noDateSelected': 'Vyberte datum',
	},
	'Presentation': {
		'menu': {
			'about': 'O nás',
			'faq': 'Časté otázky',
			'getStarted': 'Začít',
			'enterApp': 'Vstoupit do aplikace',
		},
		'common': {
			'createAccount': 'Vytvořit účet',
		},
		'createAccountDialog': {
			'title': 'Napište nám a my se vám ozveme',
			'text': 'Napište nám na mail, ozveme se vám co nejdříve',
			'yes': 'Otevřít emailovou aplikaci',
			'no': 'Zavřít',
			'mailLink': 'mailto:hynjin@gmail.com?subject=Mám zájem používat FilloApp',
		},
		'hero': {
			'title': 'Vytvářejte dokumenty snadno z vlastních vzorů',
			'subtitle': 'A ušetřený čas využijete jistě lepším způsobem',
		},
		'about': {
			'1': {
				'title': 'Vyberete vzorový dokument',
				'subtitle':
					'Uvnitř textu dokumentu označíte místa, která se mění. Vloýíte je do složených závorek. Například text {{name}} bude uživatelem při vyplňování změněno na Pavel, Katka nebo cokoliv jiného.',
			},
			'2': {
				'title': 'Nechte své kolegy vyplňovat pole podle potřeby',
				'subtitle': 'Kdokoliv z vašeho týmu jednoduše vyplní, co je potřeba',
			},
			'3': {
				'title': 'Na jedno kliknuté vytvoříte všechny dokumenty',
				'subtitle':
					'Všechny dokumenty se vám uloží na váš disk do vybrané složky.',
			},
			'integrations': 'Nejlépe slouží na vašem Google Disku',
		},
		'faq': {
			'title': 'FAQ',
			'1': {
				'title': 'some title',
				'text': 'lorem shit',
			},
			'2': {
				'title': 'some title',
				'text': 'lorem shit',
			},
			'3': {
				'title': 'some title',
				'text': 'lorem shit',
			},
		},
		'footer': {
			'menu': {
				'contactUs': 'Napište nám',
				'terms': 'Podmínky služby',
				'privacyPolicy': 'Zásady ochrany osobních údajů',
			},
		},
	},
}
