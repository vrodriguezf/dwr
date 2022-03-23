module.exports = {
	OK : {
		code : 0,
		description: 'Everything is fine :)'
	},
	PARAMS_ERROR : {
		code : -1,
		description : 'Parameter errors'
	},
	custom : function (description, options) {
		return {
			code : 1,	//For custom DEMStatus
			description : description
		}
	}
}