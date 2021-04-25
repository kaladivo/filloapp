import Schema from 'validate'

const createOrEditGroupSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	blueprintsIds: {
		type: Array,
		each: {type: String},
		required: true,
	},
	projectName: {
		type: String,
		required: false,
	},
})

export default createOrEditGroupSchema
