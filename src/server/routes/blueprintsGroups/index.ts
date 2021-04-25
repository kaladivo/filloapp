import Router from 'koa-router'
// @ts-ignore
import createGroup from './routes/createGroup'
import deleteGroup from './routes/deleteGroup'
import editGroup from './routes/editGroup'
import getBlueprintGroup from './routes/getBlueprintGroup'
import getFieldValue from './routes/getFieldValue'
import listBlueprintGroups from './routes/listBlueprintGroups'
import search from './routes/search'
import submit from './routes/submit'
import triggerSpreadsheetExport from './routes/triggerSpreadsheetExport'

const router = new Router()

router.use(createGroup.routes(), createGroup.allowedMethods())
router.use(deleteGroup.routes(), deleteGroup.allowedMethods())
router.use(editGroup.routes(), editGroup.allowedMethods())
router.use(getBlueprintGroup.routes(), getBlueprintGroup.allowedMethods())
router.use(getFieldValue.routes(), getFieldValue.allowedMethods())
router.use(listBlueprintGroups.routes(), listBlueprintGroups.allowedMethods())
router.use(search.routes(), search.allowedMethods())
router.use(submit.routes(), submit.allowedMethods())
router.use(
	triggerSpreadsheetExport.routes(),
	triggerSpreadsheetExport.allowedMethods()
)

export default router
