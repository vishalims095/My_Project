import merchant from '../Controllers/merchant_controller';
//import auth from '../modules/auth';

exports.getRouter = (app) => {

	 app.route("/merchant/login").post(merchant.login);

	 app.route("/merchant/signup").post(merchant.signup);

	 app.route("/merchant/verify/otp").post(merchant.verifyOtp);

	 app.route("/merchant/setpin").post(merchant.setpin);

	 app.route("/merchant/pin_login").post(merchant.pin_login);

	 app.route("/merchant/forget_password").post(merchant.forget_password);

  	 app.route("/merchant/reset_password").post(merchant.reset_password);

  	 app.route("/merchant/Reset_password1").post(merchant.Reset_password1);

  	 app.route("/merchant/logout").post(merchant.logout);

   	 app.route("/merchant/admin_login").post(merchant.admin_login);

     app.route("/merchant/admin_forget_password").post(merchant.admin_forget_password);

	 app.route("/merchant/checkmerchantExists").post(merchant.checkmerchantExists);

	 app.route("/merchant/sendOtp").post(merchant.sendOtp);

	 app.route("/merchant/matchOtp").post(merchant.matchOtp);

	 app.route("/merchant/resetPassword").post(merchant.resetPassword);

	 app.route("/merchant/getSecurityQuestion").post(merchant.getSecurityQuestion);

	 app.route("/merchant/matchSecurityQuestions").post(merchant.matchSecurityQuestions);

	 app.route("/merchant/isValidmerchant").post(merchant.isValidmerchant);

	 app.route("/merchant/searchmerchant").post(merchant.searchmerchant);
	 app.route("/merchant/ChangeMobileNumber").post(merchant.ChangeMobileNumber);
	 app.route("/merchant/SendMoney").post(merchant.SendMoney);		 

	// app.route("/merchant/get_merchant_details").post(auth.requiresLogin, merchant.get_merchant_details);

	return app;
}