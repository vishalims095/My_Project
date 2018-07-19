import admin from '../Controllers/admin_controller';

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

	app.route("/admin/updateProfileImage").post(upload.any(), admin.updateProfileImage);

   	app.route("/admin/blockUser").put(admin.blockUser);

   	app.route("/admin/admin_login").post(admin.admin_login);

   	app.route("/admin/get_user_details").get(admin.get_user_details);

   	app.route("/admin/get_userBarCode_details").get(admin.get_userBarCode_details);

   	app.route("/admin/get_merchantBarCode_details").get(admin.get_merchantBarCode_details);
	
	app.route("/admin/admin_forget_password").post(admin.admin_forget_password);

	app.route("/admin/merchantSendMoneyDetails").get(admin.merchantSendMoneyDetails);

	app.route("/admin/userSendMoneyDetails").get(admin.userSendMoneyDetails);

	app.route("/admin/merchantBillPayment").get(admin.merchantBillPayment);
	
	app.route("/admin/userBillPayment").get(admin.userBillPayment);

	app.route("/admin/updatePassword").put(admin.updatePassword);

	app.route("/admin/verifyOtp").post(admin.verifyOtp);

	app.route("/admin/changePassword").put(admin.changePassword);


	app.route("/admin/addOffers").post(upload.any(), admin.addOffers);


	app.route("/admin/addUtility").post(admin.addUtility);


	app.route("/admin/getUtilityList").get(admin.getUtilityList);

	return app;

}