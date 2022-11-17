
module.exports = new User({
	title:  'User',
	name:		'user',
	table:	'users',
	key:		'id',
	// limit:		50,
	// limitMax:	100000,

	// group_by: 'users.id',
	// join: [
	// 	'LEFT JOIN account ON (users.account_id = account.id)',
	// ],

	schema: {
		id:					  {convert:'int', insert:false, update:false},
		usertype_id:  {convert:'int'},
		firstname:		{convert:'trim'},
		lastname:			{convert:'trim'},
		password:			{convert:'trim', required:false, select:false, validator:vPassword, validateBlank:true, regexp:/^((?=.*[a-z])(?=.*[A-Z])(?=.*[\d~"'`!?@#$%^&*()+={}\[\]\\|<>,.\/:;_-])[a-zA-Z\d~"'`!?@#$%^&*()+={}\[\]\\|<>,.\/:;_-]{8,128})?$/, regexText:'Password must be minimum 8 characters long and should contain both uppercase and lowercase letters and numbers or symbols'},
		email:				{convert:'trim', validator: vUserEmail},
		ts:					  {convert:'trim', redis:true},
		// phone:		 				{db:'users.mobile', convert:'trim', nullable: '', validator:vMobile},
		// last_login:					{db:'ROUND(EXTRACT(EPOCH FROM users.last_login)) AS last_login', insert:false, update:false, log:false},
		// ts:							{db:'ROUND(EXTRACT(EPOCH FROM users.ts)) AS ts', insert:false, update:false}, //, convert:function(){return new Date();}
		// tfa_email:					{convert: 'bool'},
		// tfa_sms:					{db:'users.tfa_sms', convert: 'bool'},
		// tfa_google_authenticator:	{convert: 'bool'},
		// image:                			{db:"encode(users.image, 'escape') as image",convert:v=>(v ? '\\x'+v : null)},
	},


  async create(){
    const user = 'new user'
		return user
	},

	async find(){
    const find = 'new find'
		return find;
	},

	async tfa(){
	},

	async update(){
		const upd = 'Update';
		return upd;
	},

	async forgot_password(){
		return 'forgot password';
	},

	async verify_email(){
		return 'verify email';
	},


	async login(){
	},

	async logout(){
	},

	async change_pwd(){
	},

	_pass_hash(){
	},

	// override
	async del(){
		return 'del';
	},

});

