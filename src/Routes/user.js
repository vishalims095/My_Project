import user from '../Controllers/user_controller';
import auth from '../Modules/auth';
import multer from 'multer';
import md5 from 'md5';
import express from 'express'
import path from 'path';

exports.getRouter = (app) => {

	let storage = multer.diskStorage({
	destination : function(req,file,callback){
		console.log(file)
        callback(null,'./src/uploads/user');
	},
	filename : function(req,file,callback){
		let fileUniqueName = md5(Date.now());
        callback(null,fileUniqueName+ path.extname(file.originalname));
    }
});
	let upload = multer({storage:storage});

	app.route("/user/getPushNotification").post(user.getPushNotification);

	app.route("/user/receiveMoneyDetails").post(user.receiveMoneyDetails);

	app.route("/user/sendMoneyDetails").post(user.sendMoneyDetails);

	app.route("/user/allActivityDetails").post(user.allActivityDetails);

	app.route("/user/getAllInvoiceDetails").post(user.getAllInvoiceDetails);

	app.route("/user/getSortedInvoiceDetails").post(user.getSortedInvoiceDetails);

	app.route("/user/sendQrCode").post(upload.any(),user.sendQrCode);

	app.route("/user/showAllUser").post(user.showAllUser);

	app.route("/user/generateBill").post(user.generateBill);

	app.route("/user/generateInvoice").post(user.generateInvoice);

	app.route("/user/getInvoiceDetails").post(user.getInvoiceDetails);

	app.route("/user/searchInvoice").post(user.searchInvoice);

	app.route("/user/showItemList").post(user.showItemList);

	app.route("/user/merchantlogin").post(user.merchantlogin);

	app.route("/user/merchantCreateProfile").post(upload.any(), user.merchantCreateProfile);

	app.route("/user/merchantEditProfile").post(upload.any(), user.merchantEditProfile);

	app.route("/user/merchantAddBankDetails").post(user.merchantAddBankDetails);

	app.route("/user/merchantEditBankDetails").post(user.merchantEditBankDetails);

	app.route("/user/getBankDetails").post(user.getBankDetails);

	app.route("/user/merchantDeleteBankDetails").post(user.merchantDeleteBankDetails);

	app.route("/user/generateBill").post(user.generateBill);

	app.route("/user/sendRequest").post(user.sendRequest);

	app.route("/user/getRequestSummary").post(user.getRequestSummary);

	app.route("/user/updateProfileImage").post(upload.any(), user.updateProfileImage);

	app.route("/user/deleteProfileImage").post(user.deleteProfileImage);

	app.route("/user/EditProfile").post(upload.any(), user.EditProfile);

	 app.route("/user/login").post(user.login);

	 app.route("/user/signup").post(user.signup);

	 app.route("/user/verify/otp").post(user.verifyOtp);

	 app.route("/user/setpin").post(user.setpin);

	 app.route("/user/pin_login").post(user.pin_login);

	 app.route("/user/forget_password").post(user.forget_password);

  	 app.route("/user/reset_password").post(user.reset_password);

  	 app.route("/user/Reset_password1").post(user.Reset_password1);

  	 app.route("/user/logout").post(user.logout);

   	 app.route("/user/admin_login").post(user.admin_login);

     app.route("/user/admin_forget_password").post(user.admin_forget_password);

	 app.route("/user/checkUserExists").post(user.checkUserExists);

	 app.route("/user/sendOtp").post(user.sendOtp);

	 app.route("/user/matchOtp").post(user.matchOtp);

	 app.route("/user/resetPassword").post(user.resetPassword);

	 app.route("/user/getSecurityQuestion").post(user.getSecurityQuestion);

	 app.route("/user/matchSecurityQuestions").post(user.matchSecurityQuestions);

	 app.route("/user/isValidUser").post(user.isValidUser);

	 app.route("/user/searchUser").post(user.searchUser);

	 app.route("/user/ChangeMobileNumber").post(user.ChangeMobileNumber);
	 
	 app.route("/user/SendMoney").post(user.SendMoney);	
	 
	 app.route("/user/login1").post(user.login1);
	 
	 app.route("/user/getwalletdetails").post(user.getwalletdetails);	
	 
	 app.route("/user/addCardDetails").post(user.addCardDetails);
	 
	 app.route("/user/getSummary").post(user.getSummary);

	 app.route("/user/getRequestDetails").get(user.getRequestDetails);

	 app.route("/user/addMoneyInWallet").post(user.addMoneyInWallet);

	  app.route("/user/searchMerchant").post(user.searchMerchant);	 

	  app.route("/user/getcarddetails").post(auth.requiresLogin, user.getcarddetails);

	// app.route("/user/get_user_details").post(auth.requiresLogin, user.get_user_details);

	// Loyality programs

	app.route("/user/addLoyalityPrograms").post(upload.any(),user.addLoyalityPrograms);

	app.route("/user/getAllLoyalityProgramDetails").get(user.getAllLoyalityProgramDetails);

	app.route("/user/addLoyalityCardDetails").post(user.addLoyalityCardDetails);

	app.route("/user/loyalityCradList").get(user.loyalityCradList);

	app.route("/user/editLoyalityCardDetails").post(user.editLoyalityCardDetails);

	app.route("/user/deleteLoyalityCard").delete(user.deleteLoyalityCard);

	app.route("/user/searchLoyalityProgram").post(user.searchLoyalityProgram);	

	app.route("/user/addOffers").post(upload.any(),user.addOffers);

	app.route("/user/showOfferList").get(user.showOfferList);

	app.route("/user/changePin").post(user.changePin);

	app.route("/user/editCardDetails").post(user.editCardDetails);
	
	app.route("/user/deleteCard").post(user.deleteCard);

	app.route("/user/setDefaultCard").put(user.setDefaultCard);

	return app;
}