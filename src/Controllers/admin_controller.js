import commFunc from '../Modules/commonFunction';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import UserModel from '../Modals/user_model';
import md5 from 'md5';
import connection from '../Modules/connection'
import loyalityModel from '../Modals/loyalitycards_model';
import shortid from 'shortid';
/*----------------------------------------------------------------------------------------
                            Admin_login
-----------------------------------------------------------------------------------------*/
exports.admin_login = (req, res) => {
    let {
        email_id ,
        mobile_number,
        password
    } = req.body;
    let manKeys = ["email_id", "password"];
    //let condition2 = {password};
    let encrypt_password = md5(password);
    console.log(encrypt_password);
    let access_token = md5(new Date());
    let updateData = {
        access_token
    };
    commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
            UserModel.LoginQuery2({mobile_number, email_id})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
                    } else if (userResult[0].password != encrypt_password){
                        responses.invalidCredential(res, constant.responseMessages.INCORRECT_PASSWORD)
                    } else if(userResult[0].is_varified === 0 ){
                          //responses.success(res, userResult[0],'please varify otp')
                            responses.varifyotp(res);
                          //lresponses.invalidCredential(res, constant.responseMessages.PLEASE_VERIFY_OTP)

                    } else {
                    mobile_number=userResult[0].mobile_number;
                    UserModel.updateQuery1(updateData, {mobile_number}).then((userResponse) => {
                                    responses.success(res, userResponse , 'login successfull')
                        })
                        .catch((error) => responses.sendError(error.message, res));
                    }
                })              
                .catch((error) => responses.sendError(error.message, res));
            }
        })
        .catch((error) => responses.sendError(error.message, res));
}


/*------------------------------------------------------------------------------------------
                                Admin_forget_password
-------------------------------------------------------------------------------------------*/

exports.admin_forget_password = (req, res) => {
    console.log("forget password calling")
    let {mobile_number, email_id} = req.body;
    UserModel.LoginQuery2({mobile_number, email_id})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
        } else {
            let varification_code = commFunc.generateRandomString();
            let access_token = md5(new Date());
            console.log(varification_code);
            mobile_number = userResult[0].mobile_number;
            UserModel.updateQuery1({varification_code : varification_code, access_token},{mobile_number})
            .then((userResponse) => {
                 //commFunc.sendotp(varification_code);
                 //commFunc.sendmail(varification_code, email_id);
                 let access_token = userResponse.access_token;
                responses.success(res, {access_token}, 'OTP SENT TO YOUR REGISTERED NUMBER');
            })
                .catch((error) => responses.sendError(error.message, res));           
        }       
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*---------------------------------------------------------------------------------------------
                                Admin_Profile_update
----------------------------------------------------------------------------------------------*/

exports.updateProfileImage = (req , res) => {
    let {access_token} = req.headers;
    let {profile_image, name, mobile_number} = req.body;
    console.log(access_token);
    UserModel.getadmindata({access_token})
    .then((userdata) => {
        if(userdata == 0) {
            responses.authenticationErrorResponse(res);
        }  else {
               console.log(req.files.length);
               if(req.files.length > 0) {
                 for(let i=0; i< req.files.length ;i++)
                profile_image = `/user/${req.files[i].filename}`;
                let updateData = {profile_image, name, mobile_number}
                UserModel.updateQuery1(updateData,{access_token : access_token})
                .then((userResponse) => {responses.success(res , userResponse)})
                .catch((error) => responses.sendError(error.message, res));

               }
            }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------
                    Admin_grt_user_details
--------------------------------------------------------------------------*/

exports.get_user_details = (req, res) => {
 UserModel.getuserdata()
 .then((userdata) =>{
    if(userdata == 0) {
        responses.invalidCredential(res, "No data found");
    } else {
        responses.success(res, userdata);
    }
 })
}

/*------------------------------------------------------------------------
                    Admin_Block_User
-------------------------------------------------------------------------*/

exports.blockUser = (req, res) => {
    let {id,is_block} = req.body;
    UserModel.updateQuery2({id}, {is_block})
    .then((updatedata) => {
        if(updatedata == 0) {
            responses.invalidCredential(res, "unable to update data")
        } else {
            responses.success(res, updatedata)
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------
                User_BarCode_List
--------------------------------------------------------------*/

exports.get_userBarCode_details = (req, res) => {
 UserModel.getuserBarCode()
 .then((userdata) =>{
    if(userdata == 0) {
        responses.invalidCredential(res, "No data found");
    } else {
        responses.success(res, userdata);
    }
 })   
}

/*---------------------------------------------------------------
                Merchant_BarCode_List
---------------------------------------------------------------*/

exports.get_merchantBarCode_details = (req, res) =>{
 UserModel.getmerchantBarCode()
 .then((userdata) =>{
    if(userdata == 0) {
        responses.invalidCredential(res, "No data found");
    } else {
        responses.success(res, userdata);
    }
 })   
}

/*----------------------------------------------------------
            Merchant_Money_Transfer_details
-----------------------------------------------------------*/

exports.merchantSendMoneyDetails = (req, res) => {
    let sql  = "SELECT p.`transection_id`, merchant.`first_name` sender_name, merchant.mobile_number, `reciever`.`first_name` reciever, p.`amount`, DATE_FORMAT(FROM_UNIXTIME(p.`time`),'%d-%b-%Y') pay_date FROM payment_tbl p JOIN user_tbl merchant ON p.sender_id = `merchant`.`id` JOIN user_tbl reciever ON reciever.id = p.`receiver_id` WHERE merchant.`user_type` = 1 ";
    connection.query(sql, (err, result) => {
        if(err) {
            console.log(err);
        } else if(result.length == 0) {
            responses.success(res, "No data found");
        } else {
            responses.success(res, result)
        }
    })
}


/*-----------------------------------------------------------
                User_Money_Transfer_Details
------------------------------------------------------------*/

exports.userSendMoneyDetails = (req, res) => {
    let sql  = "SELECT p.`transection_id`, user.`first_name` sender_name, user.mobile_number, `reciever`.`first_name` reciever_name, p.`amount`, DATE_FORMAT(FROM_UNIXTIME(p.`time`),'%d-%b-%Y') pay_date FROM payment_tbl p JOIN user_tbl user ON p.sender_id = `user`.`id` JOIN user_tbl reciever ON reciever.id = p.`receiver_id` WHERE user.`user_type` = 0 ";
    connection.query(sql, (err, result) => {
        if(err) {
            console.log(err);
        } else if(result.length == 0) {
            responses.success(res, "No data found");
        } else {
            responses.success(res, result)
        }
    })
}


/*----------------------------------------------------
                merchantBillPayment
----------------------------------------------------*/

exports.merchantBillPayment = (req, res) => {
    let sql = "SELECT p.`transection_id`, merchant.`first_name` sender_name, p.`company_name` reciever, p.`amount`, merchant.mobile_number FROM payment_tbl p JOIN user_tbl merchant ON p.sender_id = `merchant`.`id` WHERE (merchant.`user_type` = 1 AND p.payment_for = 1) and p.status = 1 ";
    connection.query(sql,(err, result) => {
        if(err) {
            console.log(err);
        } else if(result.length == 0) {
            responses.success(res, "No data found")
        } else {
            responses.success(res, result);
        }
    })
}

/*----------------------------------------------------------
                userBillPayment
-----------------------------------------------------------*/

exports.userBillPayment = (req, res) => {
    let sql = "SELECT p.`transection_id`, user.`first_name` sender_name, p.`company_name` reciever, p.`amount`, user.mobile_number FROM payment_tbl p JOIN user_tbl user ON p.sender_id = `user`.`id` WHERE (user.`user_type` = 0 AND p.payment_for = 1) and p.status = 1 ";
    connection.query(sql,(err, result) => {
        if(err) {
            console.log(err); 
        } else if(result.length == 0) {
            responses.success(res, "No data found");
        } else {
            responses.success(res, result);
        }
    })
}

/*-------------------------------------------------
            updatePasswod
------------------------------------------------*/

exports.updatePassword = (req, res) => {
    console.log("update password calling");
    let { access_token } = req.headers;
    let { old_password, password } = req.body;
    UserModel.getadmindata({access_token})
    .then((adminData) => {
        if(adminData.length == 0) {
            responses.authenticationErrorResponse(res);
        } else if(adminData[0].password != md5(old_password)) {
            responses.invalidCredential(res, "Invalid password");
        } else {
            UserModel.updateQuery1({password : md5(password)}, {access_token})
            .then((updateData) => {
                if(updateData.length == 0) {
                    responses.invalidCredential(res, "unable to update password")
                } else {
                    console.log("password changed successfull");
                    responses.success(res,updateData);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*----------------------------------------------------
                varifyotp
------------------------------------------------------*/

exports.verifyOtp = (req,res)=> {
    console.log("verifyotp calling")
    let {
        varification_code
    } = req.body;
    let {access_token} = req.headers;
    console.log(access_token);
    console.log(varification_code)
    let manKeys = ["varification_code"];
   commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
                UserModel.getadmindata({access_token})
                .then(userResult => {
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else if (userResult[0].varification_code != varification_code){
                        responses.invalidCredential(res, "invalid verification code")
                    } else {
                        console.log("success");
                        responses.success(res, "Verified successfully")          
                    }
                }) 
                .catch((error) => responses.sendError(error.message, res))
            }
        }) 
    .catch((error) => responses.sendError(error.message, res));
}


/*------------------------------------------------------
                    generateOffer
-------------------------------------------------------*/


exports.addOffers = (req, res) => {
    console.log("add offer calling")
    let {access_token} = req.headers
    let {offerImage, offerContent, discountPercentage} = req.body;
    UserModel.getadmindata({access_token})
    .then((adminData) =>{
        if(adminData.length == 0) {
            responses.authenticationErrorResponse(res)
        } else {
            if(req.files.length > 0) {
            for(let i=0; i< req.files.length ;i++)
            offerImage = `/user/${req.files[i].filename}`;
            let offerId = md5(new Date());
            let offerData = {offerId, offerImage, offerContent, discountPercentage}
            loyalityModel.insertOffer(offerData)
            .then((offerData) =>{
                if(offerData == 0) {
                    responses.invalidCredential(res, "Offer details not added");
                } else {
                    responses.success(res,"Offer details inserted" )
                }
            })
            .catch((error) => responses.sendError(error.message, res));
            }    
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------
                    addUtility
-----------------------------------------------------*/

exports.addUtility = (req, res) => {
    console.log("add category working");
    let {category_name} = req.body;
    let {access_token} = req.headers;
    let utilityId = shortid.generate();
    console.log(utilityId);
    UserModel.getadmindata({access_token})
    .then((adminData) => {
        if(adminData.length == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            let utilityDetails = {utilityId, utilityName : category_name}
            UserModel.addutility(utilityDetails)
            .then((utilityResult) =>{
                if(utilityResult.length == 0) {
                    responses.invalidCredential(res, "unable to add utility")
                } else {
                    responses.success(res, "Utilit added successfully");
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res))
}

/*--------------------------------------------------------------
                    getUtilityList
---------------------------------------------------------------*/

exports.getUtilityList = (req, res) => {
    console.log("get utility list calling");
    let {access_token} = req.headers;
    UserModel.getadmindata({access_token})
    .then((adminData) =>{
        if(adminData.length == 0) {
            responses.authenticationErrorResponse(res)
        } else {
            let sql = "SELECT utilityName as category_name from `utilityList_tbl` ";
            connection.query(sql,(err, result) =>{
                if(err) {
                    console.log(err);
                } else {
                    responses.success(res,result);
                }
            })
        }
    })
}

/*------------------------------------------------------
            changePassword
------------------------------------------------------*/


exports.changePassword = (req, res) => {
    console.log("change password calling");
    let { access_token } = req.headers;
    let { password } = req.body;
    UserModel.getadmindata({access_token})
    .then((adminData) => {
        if(adminData.length == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            UserModel.updateQuery1({password : md5(password)}, {access_token})
            .then((updateData) => {
                if(updateData.length == 0) {
                    responses.invalidCredential(res, "unable to update password")
                } else {
                    console.log("password changed successfull");
                    responses.success(res,updateData);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}
