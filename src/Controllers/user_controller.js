import commFunc from '../Modules/commonFunction';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import UserModel from '../Modals/user_model';
import loyalityModel from '../Modals/loyalitycards_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";
import async from 'async';
import currencySymbol from 'currency-symbol';
import getSymbolFromCurrency from 'currency-symbol-map'
import uniqid from 'uniqid'
var qr = require('qr-image');
exports.signup = (req, res) => {
    let { email_id, password, country_code, mobile_number, first_name, last_name, device_token, device_type, latitude, longitude, user_type, location, bank_name, account_name, account_number, account_type, iban_code, swift_code, routing_number, question1_id, question2_id, question1_answer, question2_answer} = req.body;
    let manKeys = ["email_id", "password", "country_code", "mobile_number", "first_name", "last_name", "device_token", "device_type", "latitude", "longitude", "user_type", "location", "bank_name", "account_name", "account_number", "account_type" ,"iban_code", "swift_code", "routing_number", "question1_id", "question2_id", "question1_answer", "question2_answer"];
    // password = md5(password);
    let created_on= new Date();
    let access_token= md5(new Date()); 
    let id =md5(commFunc.generateRandomString());
    console.log(access_token,'===============')
    // let insertData = {id, access_token, email_id, password, country_code, mobile_number, first_name, last_name, device_token, device_type, latitude, longitude, created_on};
    commFunc.checkKeyExist(req.body, manKeys)
        .then(function(result) {
            if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
            } else {
                UserModel.selectQuery({mobile_number})
                    .then(userResult => userResult.length > 0 ? null : userResult)
                    .then(userResult => {
                        if (userResult) {
                             UserModel.selectQuery({email_id})
                    .then(userResult => userResult.length > 0 ? null : userResult)
                    .then(userResult => {
                        if (userResult) {
                            password = md5(password);
                            // let varification_code = commFunc.generateRandomString();
                            let varification_code = '1234';
                            let insertData = {
                                id,
                                varification_code,
                                access_token,
                                email_id,
                                password,
                                country_code,
                                mobile_number,
                                first_name,
                                last_name,
                                device_token,
                                device_type,
                                latitude,
                                longitude,
                                user_type,
                                location,
                                created_on,
                                is_varified:0,
                                is_merchant_profile_created : 0
                            };
                            UserModel.insertQuery(insertData)
                                .then((userResponse) => {
                                    let id = md5(commFunc.generateRandomString());
                                    let user_id = userResponse.id;
                                    let insert_bank_data = {
                                        id,
                                        user_id,
                                        bank_name,
                                        account_name,
                                        account_number,
                                        account_type,
                                        iban_code,
                                        swift_code,
                                        routing_number
                                    };
                                    UserModel.insertbankdetails(insert_bank_data)
                                        .then((Result) => {
                                            let id = md5(commFunc.generateRandomString());
                                            let user_id = userResponse.id;
                                            //let {question1_id, question2_id, question1_answer, question2_answer} = req.body;
                                            let insert_sequrity_details = {
                                                id,
                                                user_id,
                                                question1_id,
                                                question1_answer,
                                                question2_id,
                                                question2_answer
                                            };
                                            UserModel.sequritydetailsinsert(insert_sequrity_details)
                                                .then((securityResult) => {
                                                    commFunc.sendmail(varification_code,email_id);
                                                    commFunc.sendotp(varification_code);
                                                    responses.success(res, _.merge(insert_sequrity_details, insert_bank_data, insertData));
                                                    let id = insertData.id;
                                                    console.log(id);
                                                    let walletdata = {user_id : id, amount : 5000 , left_amount : 4500 , added_on : "15/jan/2015", currency_type : "AED"};
                                                    UserModel.insertwalletdetails(walletdata)
                                                    .then((walletresult) => {
                                                        if(walletresult == 0) {
                                                            responses.invalidCredential(res, "wallet not upadted");
                                                        } else {
                                                            console.log("wallet update success");
                                                        }
                                                    })
                                                    .catch((error) => responses.sendError(error.message, res));
                                                })
                                                .catch((error) => responses.sendError(error.message, res));
                                        })
                                        .catch((error) => responses.sendError(error.message, res));
                                })
                                .catch((error) => responses.sendError(error.message, res));
                        } else {
                            responses.invalidCredential(res, constant.responseMessages.EMAIL_ALREADY_EXISTS);
                        }
                    })
                      } else {
                            responses.invalidCredential(res, constant.responseMessages.MOBILE_ALREADY_EXISTS);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
            }
        })
        .catch(error =>responses.sendError(error.message, res));
};

/*----------------------------------------------
                    LOGIN
----------------------------------------------*/




exports.login = (req, res) => {
    let {
        email_id ,
        mobile_number,
        password,
        device_type,
        device_token,
        latitude,
        longitude
    } = req.body;
    let manKeys = [ "password", "device_type", "device_token", "latitude", "longitude"];
    //let condition2 = {password};
    let encrypt_password = md5(password);
    let access_token = md5(new Date());
    let updateData = {
        access_token,
        device_type,
        latitude,
        longitude,
        device_token
    };
    commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
            UserModel.LoginQuery1({mobile_number, email_id})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    if (email_id) {
                            responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
                        } else {
                             responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
                        }
                    //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
                    } else if (userResult[0].password != encrypt_password){
                        responses.invalidCredential(res, constant.responseMessages.INCORRECT_PASSWORD)
                    } else if(userResult[0].is_varified === 0 ) {
                          responses.success(res, userResult[0],'please varify otp')
                           // responses.varifyotp(res);
                          //lresponses.invalidCredential(res, constant.responseMessages.PLEASE_VERIFY_OTP)

                    } else {
                    mobile_number=userResult[0].mobile_number;
                    UserModel.updateQuery(updateData, {mobile_number}).then((userResponse) => {
                                    responses.success(res, userResponse , 'login successfull')
                        })
                        .catch((error) => responses.sendError(error.message, res));
                    }
                })              
                .catch((error) => responses.sendError(error.message, res));
            } //login query1 works
        })
        .catch((error) => responses.sendError(error.message, res));
}

// LOGIN1---------------------------------------------------------------------------------


exports.login1 = (req, res) => {
    let {
        email_id ,
        mobile_number,
        password,
        device_type,
        device_token,
        latitude,
        longitude
    } = req.body;
    let manKeys = ["password", "device_type", "device_token", "latitude", "longitude"];
    //let condition2 = {password};
    let encrypt_password = md5(password);
    let access_token = md5(new Date());
    let updateData = {
        access_token,
        device_type,
        latitude,
        longitude,
        device_token
    };
    commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
            UserModel.LoginQuery1({mobile_number, email_id})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    if (email_id) {
                            responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
                        } else {
                             responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
                        }
                    //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
                    } else if (userResult[0].password != encrypt_password){
                        responses.invalidCredential(res, constant.responseMessages.INCORRECT_PASSWORD)
                    } else if(userResult[0].user_type === 0 ) {
                        console.log("coming");

                        responses.invalidCredential(res,"Invalid user");
                    } 
                    else if(userResult[0].is_varified === 0 ) {
                          responses.success(res, userResult[0],'please varify otp')
                           // responses.varifyotp(res);
                          //lresponses.invalidCredential(res, constant.responseMessages.PLEASE_VERIFY_OTP)

                    } 

                    else {
                    mobile_number=userResult[0].mobile_number;
                    UserModel.updateQuery(updateData, {mobile_number}).then((userResponse) => {
                                    responses.success(res, userResponse , 'login successfull')
                        })
                        .catch((error) => responses.sendError(error.message, res));
                    }
                })              
                .catch((error) => responses.sendError(error.message, res));
            } //login query1 works
        })
        .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------------------------------------------------------
                                                merchantLogin
------------------------------------------------------------------------------------------------------------------------------*/

exports.merchantlogin = (req, res) => {
    let { email_id, mobile_number, login_key, password, device_type, device_token, latitude, longitude } = req.body;
    let manKeys = [ "password", "device_type", "device_token", "latitude", "longitude"];
    //let condition2 = {password};
    let encrypt_password = md5(password);
    let access_token = md5(new Date());
    let updateData = {access_token, device_type, latitude, longitude, device_token };

    commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
            UserModel.LoginQuery1({mobile_number, email_id})
                .then(userResult =>{
                    if(userResult.length == 0 ) {
                        if (email_id) {
                            responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
                        } else {
                             responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
                        }
                    } else if (userResult[0].password != encrypt_password){
                        responses.invalidCredential(res, constant.responseMessages.INCORRECT_PASSWORD)
                    } else if (userResult[0].user_type === 0) {
                        responses.invalidCredential(res, "Invalid User");
                    } 
                    else if(userResult[0].is_varified === 0 ){
                        responses.success(res, userResult[0],'please varify otp')
                        //responses.varifyotp(res);
                        //lresponses.invalidCredential(res, constant.responseMessages.PLEASE_VERIFY_OTP)

                    } else {
                        mobile_number=userResult[0].mobile_number;
                        UserModel.updateQuery(updateData, {mobile_number}).then((userResponse) => {
                            responses.success(res, userResponse , 'login successfull')
                        })
                        .catch((error) => responses.sendError(error.message, res));
                    }
                }).catch((error) => responses.sendError(error.message, res));
            }
        })
        .catch((error) => responses.sendError(error.message, res));
}


/*----------------------------------------------------
                varifyotp
------------------------------------------------------*/

exports.verifyOtp = (req,res)=> {
    let {
        varification_code
    } = req.body;
    let {access_token} = req.headers;
    let manKeys = ["varification_code"];
   commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
                UserModel.LoginQuery({access_token})
                .then(userResult => {
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else if (userResult[0].varification_code != varification_code){
                        responses.invalidCredential(res, "invalid verification code")
                    } else {
                  UserModel.updateQuery({is_varified:1}, {access_token}).then((userResponse) => {
                             responses.success(res, userResponse , 'verified sucess')
                        })
                        .catch((error) => responses.sendError(error.message, res));           
                    }
                }) 
            }
        }) 
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------
                set pin
--------------------------------------------------*/

exports.setpin = (req,res)=> {
    let {pin} = req.body;
    let {access_token} = req.headers;
    let manKeys = ["pin"];
   commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length) {
            responses.parameterMissing(res, result[0])  
        } else {
                UserModel.LoginQuery({access_token})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else {
                        let id = "0663a4ddceacb40b095eda264a85f15c";
                        var code = qr.image(id, { type: 'png' });
                        var qrCodePath = id+'.png';
                        code.pipe(require('fs').createWriteStream('./src/uploads/QR/'+qrCodePath));
                        //res.send(qrCodePath);
                        let qr_code = `/QR/${qrCodePath}`;
                        console.log(qr_code);
                        UserModel.updateQuery({is_pin_set:1,pin, qr_code : qr_code}, {access_token}).then((userResponse) => {
                             responses.success(res, userResponse , 'pin set successfully')
                        })
                        .catch((error) => responses.sendError(error.message, res));           
                    }
                }) 
                 .catch((error) => responses.sendError(error.message, res));
        }
    }) 
    .catch((error) => responses.sendError(error.message, res));
}


/*-----------------------------------------------------
                    Login through pin
------------------------------------------------------*/

exports.pin_login = (req, res) => {
    let {access_token} = req.headers;
    let {pin} = req.body;
    let manKeys = ["pin"];
    commFunc.checkKeyExist(req.body, manKeys)
    .then(function(result){
        if(result.length >0){
            responses.parameterMissing(res, result[0]);
        } else {
            UserModel.LoginQuery({access_token})
            .then(userResult => {
                if(userResult == 0) {
                    responses.INVALID_ACCESS_TOKEN(res);
                } else {
                    console.log(userResult[0].pin);
                    if(userResult[0].pin != pin) {
                        console.log("invalid pin coming");
                        responses.invalidCredential(res, constant.responseMessages.INVALID_PIN)
                    } else {
                        console.log("success");
                        responses.success(res, userResult[0], 'Pin varified successfully');
                    }
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
     .catch((error) => responses.sendError(error.message, res));
}

/*----------------------------------------------------
                Forget Password
-----------------------------------------------------*/

exports.forget_password = (req, res) => {
    let {mobile_number, email_id} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
            if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
        } else {
            let varification_code = commFunc.generateRandomString();
            console.log(varification_code);
            mobile_number=userResult[0].mobile_number;
            UserModel.updateQuery({varification_code : varification_code},{mobile_number})
            .then((userResponse) => {
                 commFunc.sendotp(varification_code);
                 commFunc.sendmail(varification_code, email_id);
                responses.success(res, userResponse, 'otp sent to your registered mobile number');
            })
                .catch((error) => responses.sendError(error.message, res));           
        }       
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*-----------------------------------------------------
                Verify_OTP_set_New_Password
------------------------------------------------------*/

exports.reset_password = (req, res) => {
   let {
        varification_code
    } = req.body;
    let {access_token} = req.headers;
    let manKeys = ["varification_code"];
   commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        } else {
                UserModel.LoginQuery({access_token})
                .then(userResult => {
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else if (userResult[0].varification_code != varification_code){
                        responses.invalidCredential(res, "invalid verification code")
                    } else {
                        let {password} = req.body;
                         password = md5(password);
                        UserModel.updateQuery({password : password}, {access_token}).then((userResponse) => {
                             responses.success(res , 'Password changed successfully');
                        })
                        .catch((error) => responses.sendError(error.message, res));           
                    }
                }) 
        }
    }) 
    .catch((error) => responses.sendError(error.message, res));
}


/*-----------------------------------------------------------------------
                    Reset_password_using_Security_questions
------------------------------------------------------------------------*/

exports.Reset_password1 = (req, res) => {
    let {access_token} = req.headers;
    let {question1_answer, question2_answer} = req.body;
    let manKeys = ["question1_answer" , "question2_answer"];
    commFunc.checkKeyExist(req.body, manKeys)
    .then(function(result) {
        if(result.length > 0) {
            responses.parameterMissing(res, result[0])
        } else {
            UserModel.selectQuery({access_token})
            .then(userResult => {
                if(userResult.length == 0) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
                } else  {
                    console.log("================"+access_token);
                    let user_id = userResult[0].id;
                    UserModel.selectQuery1({user_id})
                    .then(userResponse => {
                        console.log(question1_answer);
                      if ((userResponse[0].question1_answer != question1_answer) || (userResponse[0].question2_answer != question2_answer)) {
                        responses.invalidCredential(res, constant.responseMessages.INCORRECT_SECURITY_QUESTION_DETAILS)
                    } else {

                            console.log("coming to password reset Reset_password_using_Security_questions");
                        //      Password Reset ======================
                        let {password} = req.body;
                         password = md5(password);
                         console.log(password);
                        UserModel.updateQuery({password : password}, {access_token}).then((userResponse) => {
                             responses.success(res, userResponse , 'Password changed successfully');
                        })
                        .catch((error) => responses.sendError(error.message, res));

                    } 
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*--------------------------------------------------------------------------------
                                LOGOUT
---------------------------------------------------------------------------------*/

exports.logout = (req, res) => {
   let {access_token} = req.headers;
    UserModel.LoginQuery({access_token})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
        } else {
            let mobile_number = userResult[0].mobile_number;
            console.log(mobile_number);
            UserModel.updateQuery({access_token :" ", device_token : " "} , {mobile_number})
            .then((userResponse) => {
                console.log(userResponse);
                responses.success(res , 'User successfully logout');
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
     .catch((error) => responses.sendError(error.message, res));

}

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
    let {mobile_number, email_id} = req.body;
    UserModel.LoginQuery2({mobile_number, email_id})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
        } else {
            let varification_code = commFunc.generateRandomString();
            console.log(varification_code);
            mobile_number = userResult[0].mobile_number;
            UserModel.updateQuery1({varification_code : varification_code},{mobile_number})
            .then((userResponse) => {
                 //commFunc.sendotp(varification_code);
                 commFunc.sendmail(varification_code, email_id);
                responses.success(res, userResponse, 'OTP SENT TO YOUR REGISTERED NUMBER');
            })
                .catch((error) => responses.sendError(error.message, res));           
        }       
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*---------------------------------------------------------------------------------------------
                                Admin_Password_reset
----------------------------------------------------------------------------------------------*/




















/*----------------------------------------------------------------------------------------------
                                        checkUserExists
-----------------------------------------------------------------------------------------------*/


exports.checkUserExists = (req, res) => {
  let {mobile_number, email_id} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) => {
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
           responses.success(res, 'User already exist');           
        }       
    })
    .catch((error) => responses.sendError(error.message, res));   
}


/*------------------------------------------------------------------------------------------------
                                        sendOtp
-------------------------------------------------------------------------------------------------*/

exports.sendOtp = (req, res) => {
    let {mobile_number, email_id, country_code} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
            if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            let varification_code = commFunc.generateRandomString();
            console.log(varification_code);
            mobile_number=userResult[0].mobile_number;
            UserModel.updateQuery({varification_code : varification_code},{mobile_number})
            .then((userResponse) => {
                // let mobile_number1 = country_code.concat(mobile_number);
                // console.log(mobile_number1);
                 commFunc.sendotp(varification_code);
                 commFunc.sendmail(varification_code, email_id);
                responses.success(res, userResponse, 'OTP SENT TO YOUR REGISTERED NUMBER');
            })
                .catch((error) => responses.sendError(error.message, res));           
        }       
    })
    .catch((error) => responses.sendError(error.message, res)); 
}


/*-------------------------------------------------------------------------------------------------------
                                            matchOtp
--------------------------------------------------------------------------------------------------------*/

exports.matchOtp = (req, res) => {
 let {mobile_number, email_id, varification_code} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            if(varification_code != userResult[0].varification_code) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_VARIFICATION_CODE);
            }  else {
                responses.success(res, "OTP varified successfully");
            }
        }       
    })
    .catch((error) => responses.sendError(error.message, res));   
}

/*-----------------------------------------------------------------------------------------------------
                                            resetPassword
------------------------------------------------------------------------------------------------------*/

exports.resetPassword = (req, res) => {
    let {mobile_number, email_id, password} = req.body;
    password = md5(password);
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
            if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            mobile_number = userResult[0].mobile_number;
            UserModel.updateQuery({password}, {mobile_number})
            .then((userResponse) => {
                responses.success(res, 'Password has changed successfully');
            })
                .catch((error) => responses.sendError(error.message, res));
        }       
    })
    .catch((error) => responses.sendError(error.message, res));   
}

/*----------------------------------------------------------------------------------------------------------
                                        getSecurityQuestion
-----------------------------------------------------------------------------------------------------------*/

exports.getSecurityQuestion = (req, res) => {
    let {mobile_number, email_id} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            let user_id = userResult[0].id;
            UserModel.getSecurityDetails({user_id})
            .then((userResponse) => {
                responses.success(res, userResponse[0], 'Security question details');
            })
            .catch((error) => responses.sendError(error.message, res));   
        }
    })
    .catch((error) => responses.sendError(error.message, res));   
}


/*---------------------------------------------------------------------------------------------------------
                                            matchSecurityQuestions
----------------------------------------------------------------------------------------------------------*/

exports.matchSecurityQuestions = (req, res) => {
     let {mobile_number, email_id, question1_answer, question2_answer} = req.body;
    UserModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            let user_id = userResult[0].id;
            UserModel.getSecurityDetails({user_id})
            .then((userResponse) => {
               if(userResponse[0].question1_answer != question1_answer || userResponse[0].question2_answer != question2_answer) {
                 responses.invalidCredential(res, constant.responseMessages.INCORRECT_SECURITY_QUESTION_DETAILS);
               } else {
                responses.success(res, 'User varified successfully');
               }
            })
            .catch((error) => responses.sendError(error.message, res));   
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*---------------------------------------------------------------------------------------------------------
                                    is_valid_user
----------------------------------------------------------------------------------------------------------*/


exports.isValidUser = (req, res) => {
    let{mobile_number, email_id} = req.body;
    UserModel.selectQuery({mobile_number})
    .then((userResult) => {
        if(userResult == 0){
            UserModel.selectQuery({email_id})
            .then((userResponse) => {
                    if(userResponse == 0) {
                        responses.success(res, 'User not exist');
                    }
                else {
                    responses.invalidCredential(res, constant.responseMessages.EMAIL_ALREADY_EXISTS);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        } else {
            responses.invalidCredential(res, constant.responseMessages.MOBILE_ALREADY_EXISTS);
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*-------------------------------------------------------------------------------------------------------
                                            Search_user
--------------------------------------------------------------------------------------------------------*/

exports.searchUser = (req, res) => {
    let{mobile_number, email_id, first_name, user_type} = req.body;
    UserModel.searchUserdata({email_id, mobile_number, first_name})
    .then((userResult) =>{
        if(userResult == 0) {
            if(mobile_number) { 
                responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
            } else if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
            } else {
                responses.invalidCredential(res, constant.responseMessages.INVALID_NAME);
            }
        } else {
            if(user_type == 1) {
                if(userResult[0].user_type === 0) {
                    responses.invalidCredential(res, "Invalid user")
                } else {
                    responses.success(res,userResult[0], "User Data")
                }
            } else {
            responses.success(res, userResult[0], "User Data");
            }
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------------------------------------
                                            Change_mobilenumber
---------------------------------------------------------------------------------------------------------*/

exports.ChangeMobileNumber = (req,res) => {
    let {new_mobile_number} = req.body;
    let {access_token} = req.headers;
    let manKeys = ["new_mobile_number"]
    commFunc.checkKeyExist(req.body, manKeys)
    .then(function(result){
        if(result.length >0){
            responses.parameterMissing(res, result[0]);
        } else {
            UserModel.selectQuery({access_token})
            .then((userResult) => {
                if(userResult == 0) {
                   responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN); 
               } else {
                 let mobile_number = userResult[0].mobile_number;
                 UserModel.selectQuery({mobile_number : new_mobile_number})
                 .then((mobiledetails) => {
                    if(mobiledetails == 0) {
                        console.log("you can update");
                          UserModel.updateUserData({mobile_number : new_mobile_number} , {mobile_number})
                          .then((userResponse) =>  {
                             responses.success(res ,'Mobile number successfully update');
                         })
                           .catch((error) => responses.sendError(error.message, res));
                        } else {
                        responses.invalidCredential(res, constant.responseMessages.MOBILE_ALREADY_EXISTS);
                    }
                 })
                 .catch((error) => responses.sendError(error.message, res)); 
               }
            })
             .catch((error) => responses.sendError(error.message, res));
        }
    
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*------------------------------------------------------------------------------------------------------------
                                                SendMoney
--------------------------------------------------------------------------------------------------------------*/

// exports.SendMoney = (req, res) => {
//     let {access_token} = req.headers;
//     let {mobile_number, email_id} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
//         } else {
//             let userid = userResult[0].id;
//             UserModel.getwalletdetails({userid})
//             .then((walletdata) => {
//                 if(walletdata == 0) {
//                     responses.invalidCredential(res,"No wallet found");
//                 } else {
//                     //responses.success(res, walletdata[0]);
//                     UserModel.LoginQuery1({mobile_number, email_id})
//                     .then((userResponse) => {
//                         if(userResponse == 0) {
//                              if(mobile_number) {
//                                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
//                             } else {
//                                 responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
//                             }
//                         } else {
//                             let user_id1 = userResult[0].id;
//                             let user_id2 = userResponse[0].id;
//                             let transection_id = md5(new Date());
//                             let time = new Date();
//                             let {amount} = req.body;
//                             let insert_transection_details = {transection_id, sender_id : user_id1, receiver_id : user_id2, amount, time};
//                             UserModel.transectiondetails(insert_transection_details)
//                             .then((transectiondata) => {
//                                 if(transectiondata == 0) {
//                                     responses.invalidCredential(res, "Transection failed");
//                                 } else {
//                                     responses.success(res, transectiondata[0]);
//                                     console.log (walletdata[0].amount - amount);
//                                 }
//                             })
//                             .catch((error) => responses.sendError(error.message, res));
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 }
//             })
//             .catch((error) => responses.sendError(error.message, res));
//             // UserModel.LoginQuery1({mobile_number, email_id})
//             // .then((userResponse) => {
//             //     if(userResponse == 0) {
//             //         if(mobile_number) {
//             //             responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
//             //         } else {
//             //             responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
//             //         }
//             //     } else {
//             //         let user_id1 = userResult[0].id;
//             //         let user_id2 = userResponse[0].id;
//             //         let transection_id = md5(new Date());
//             //         let time = new Date();
//             //         let {amount} = req.body;
//             //         let insert_transection_details = {transection_id, sender_id : user_id1, receiver_id : user_id2, amount,time};
//             //         UserModel.transectiondetails(insert_transection_details)
//             //         .then((transectiondata) => {
//             //             if(transectiondata == 0) {
//             //                 console.log("transection failed")
//             //             } else {
//             //                 responses.success(res, "Transection successful");
//             //             }
//             //         }) 
//             //         .catch((error) => responses.sendError(error.message, res)); 
//             //      }
//             // })
//             // .catch((error) => responses.sendError(error.message, res));
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }


//------------------------------------------------------------------------------------------

// exports.login1 = (req,res) => {
//     let {mobile_number, email_id} = req.body;
//     UserModel.LoginQuery1({mobile_number, email_id})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
//         } else {
//             console.log(userResult);
//             let user_id = userResult[0].id;
//             UserModel.getSecurityDetails({user_id})
//             .then((userResponse) => {
//                 UserModel.getbankdetails({user_id})
//                 .then((bankdata)=> {
//                   responses.success(res, _.merge(userResult[0],bankdata[0],userResponse[0]),"success")  
//                 })
//                 .catch((error) => responses.sendError(error.message, res));
//                 //responses.success(res, userResponse,"success");
//                 //responses.success(res, _.merge(userResult[0],userResponse[0]),"success");
//             })
//             .catch((error) => responses.sendError(error.message, res));
//             //responses.success(res, userResult, "successfull");
//         }
//     })
//      .catch((error) => responses.sendError(error.message, res));
// }

//----------------------------------------------------------------------------------------

exports.getwalletdetails = (req, res) => {
    console.log(currencySymbol.symbol("United States"));
    console.log("د.إ");
    let currency_Symbol = "د.إ";
    console.log(getSymbolFromCurrency('JPY'));
     console.log(getSymbolFromCurrency('INR'));
      console.log(getSymbolFromCurrency('BSD'));
    let {access_token} = req.headers;
    let {send_amount, reciver_currency_type} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
        } else {
            let user_id = userResult[0].id;
            UserModel.getwalletdetails({user_id})
            .then((walletdata) => {
                if(walletdata == 0) {
                    responses.invalidCredential(res, "No data found");
                } else {
                    responses.success(res, _.merge(req.body,walletdata[0],{currency_Symbol}));
                }
            }) 
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

//-------------------------------------------send money--------------------------------------------

// exports.SendMoney = (req, res) => {
//     let {user_id, receiver_id, amount, reciver_currency_type} = req.body;
//     UserModel.getwalletdetails({user_id})
//     .then((walletdata) => {
//         if(walletdata == 0) {
//             responses.invalidCredential(res, "Invalid sender_id")
//         } else { 
//             if(walletdata[0].currency_type != reciver_currency_type ) {
//                 console.log("not matched");
//                 if(reciver_currency_type == "inr") {
//                     console.log("inr coming");
//                     console.log(amount);
//                     let converted_amount = amount/67 ;
//                     console.log(converted_amount);
//                     let left_amount = walletdata[0].left_amount - converted_amount;
//                     UserModel.walletupdate({left_amount}, {user_id})
//                     .then((walletupdatedata) => {
//                         if (walletupdatedata == 0) {
//                             responses.invalidCredential("Wallet not updated");
//                         } else {
//                              let insert_transection_details = {transection_id : md5(new Date()), sender_id : user_id, receiver_id, amount, time, currency_type : reciver_currency_type};
//                                 UserModel.transectiondetails(insert_transection_details)
//                                 .then ((transectiondata) => {
//                                     if(transectiondata == 0) {
//                                         responses.invalidCredential(res, "Transection Fail");
//                                     } else {
//                                         responses.success(res, "Transection successful")
//                                     }
//                                 })

//                             responses.success(res,"wallet update successfully");
//                         }
//                     })
//                 } else if (reciver_currency_type == "aed") {
//                     console.log("aed coming");
//                     console.log(amount);
//                     let converted_amount = amount*67 ;
//                     console.log(converted_amount);
//                     let left_amount = walletdata[0].left_amount - converted_amount;
//                     UserModel.walletupdate({left_amount}, {user_id})
//                     .then((walletupdatedata) => {
//                         if (walletupdatedata == 0) {
//                             responses.invalidCredential("Wallet not updated");
//                         } else {
//                             responses.success(res,"wallet update successfully");
//                         }
//                     })
//                 }
//             } else { 
//             let transection_id = md5(new Date());
//             let time = new Date();
//             let insert_transection_details = {transection_id, sender_id : user_id, receiver_id, amount, time, currency_type : reciver_currency_type};
//             UserModel.transectiondetails(insert_transection_details)
//             .then((transectiondata) => {
//                 if(transectiondata == 0) {
//                     responses.invalidCredential(res, "Transection failed");
//                 } else {
//                    console.log(walletdata[0].left_amount);
//                    console.log(amount);
//                    let left_amount = walletdata[0].left_amount - amount;
//                    console.log(left_amount);
//                    UserModel.walletupdate({left_amount}, {user_id})
//                    .then((walletupdatedata) => {
//                     if(walletupdatedata == 0) {
//                         responses.invalidCredential("Wallet not updated");
//                     } else {
//                         responses.success(res,insert_transection_details,"wallet update successfully");
//                     }
//                    })
//                    .catch((error) => responses.sendError(error.message, res));
//                 }
//             })
//             .catch((error) => responses.sendError(error.message, res));
//         }
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }

// exports.SendMoney = (req, res) => {
//     let {sender_access_token} = req.headers;
//     let {amount, currency_type, receiver_user_id, key} = req.body;
//     UserModel.selectQuery({access_token : sender_access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
//         } else {
//             let user_id = userResult[0].id;
//             console.log(user_id);
//             UserModel.getwalletdetails({user_id})
//             .then((walletdata) => {
//                 if(walletdata == 0) {
//                     responses.invalidCredential(res, "No wallet found")
//                 } else {
//                     UserModel.selectQuery({id : receiver_user_id})
//                     .then((receiverdata) =>{
//                         if(receiverdata == 0) {
//                             responses.invalidCredential(res, "invalid reciver user_id")
//                         } else {
//                             let receiver_id = receiverdata[0].id;
//                             console.log(receiver_id);
//                             let transection_id = md5(new Date());
//                             let time = new Date();
//                             let insert_transection_details = {transection_id, sender_id : user_id, receiver_id, amount, currency_type, time};
//                             UserModel.transectiondetails(insert_transection_details)
//                             .then((transectiondata) =>{
//                                 if(transectiondata == 0) {
//                                     responses.invalidCredential(res, "Transection failed");
//                                 } else {
//                                     console.log(walletdata[0].left_amount);
//                                     let service_charge, sgst, total_tax;
//                                     service_charge = 10;
//                                     sgst = 5;
//                                     total_tax = service_charge+sgst;
//                                     console.log(total_tax+amount);
//                                     let left_amount = walletdata[0].left_amount - (amount);
//                                     console.log(left_amount);
//                                     UserModel.walletupdate({left_amount}, {user_id})
//                                     .then((walletupdatedata)=>{
//                                         if(walletupdatedata == 0) {
//                                             responses.invalidCredential("Wallet not updated");
//                                         } else {
//                                             responses.success(res,insert_transection_details,"wallet update successfully");
//                                         }      
//                                     })  
//                                     .catch((error) => responses.sendError(error.message, res));              
//                                 }
//                             })
//                             .catch((error) => responses.sendError(error.message, res));
//                         }
//                     })
//                      .catch((error) => responses.sendError(error.message, res));
//                 }
//             })
//             .catch((error) => responses.sendError(error.message, res));
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }


exports.addCardDetails = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res)
            } else {
                let user_id = userResult[0].id;
                let {card_name, card_number, mm, yy, cvv, prefrence} = req.body;
                let card_id = md5(new Date());
                let card_added_on = new Date();
                let card_data = {card_id, user_id, card_name, card_number, mm, yy, cvv, card_added_on, prefrence};
                UserModel.addcarddetails(card_data)
                .then((carddata) => {
                if(carddata == 0) {
                    responses.invalidCredential(res, "Unable to add card details");
                } else {
                    responses.success(res, "card added successfully");
                }
            })
                 .catch((error) => responses.sendError(error.message, res));
        }
    })
     .catch((error) => responses.sendError(error.message, res));
}


//-------------------------------------------------------sendMoney------------------------------------------------------------


exports.SendMoney = (req,res) => {
   let {sender_access_token} = req.headers;
   let {receiver_user_id, amount, currency_type, key,  note, tranjection_type, company_name, requestId, offerId, discountPercentage} = req.body;
   let service_charge = 10;
   let sgst = 5;
   UserModel.selectQuery({access_token : sender_access_token})
   .then((userResult) =>{
    if(userResult == 0) {
        responses.authenticationErrorResponse(res);
    } else {
        if(tranjection_type == "utility") {
            console.log("utility transection code is running");
            let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                let service_tax = ((amount*service_charge)/100);
                let gst = ((amount*sgst)/100);
                console.log(service_tax+gst);
                let amount1 = amount+service_tax+gst;
                console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount");
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let wallet_id = walletdata[0].id;
                    //let data = commFunc.verifyData({ event_name, event_location, event_banner, event_date,user_id});
                    let insert_transection_details = commFunc.verifyData({transection_id, sender_id, company_name , amount, time, currency_type, service_charge,sgst, wallet_id, status : 1,note, payment_for : 1 });
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            console.log("success");
                            responses.success(res,transectiondata[0], "Transection successful");
                            console.log(walletdata[0].left_amount);
                            let left_amount = walletdata[0].left_amount - (amount);
                            console.log(left_amount);
                            UserModel.walletupdate({left_amount}, {user_id})
                            .then((walletupdatedata)=>{
                                if(walletupdatedata == 0) {
                                    responses.invalidCredential(res, "Wallet not updated");
                                } else {
                                    console.log(receiver_user_id);
                                    console.log("wallet update successfully");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet  amount is greater but after adding taxes is became higher than wallet " + amount1, amount);
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name ,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1, payment_for : 1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name ,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1, payment_for : 1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                     let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let insert_transection_details = {transection_id, sender_id, company_name , amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1, payment_for : 1}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,insert_transection_details, "transection successful");
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));

        } else if ( tranjection_type == "offer") {
            let manKeys = ["offerId", "discountPercentage"];
            commFunc.checkKeyExist(req.body, manKeys)
            .then((result) => {
                if(result.length > 0) {
                    responses.parameterMissing(res, result[0])
                } else {
        console.log("offerId is============"+offerId)
        console.log("discountPercentage======="+discountPercentage);
        console.log("normal transection calling");
        let discount = (amount*discountPercentage)/100
        amount = amount - ((amount*discountPercentage)/100);
        console.log(amount);
                    console.log("offer type running");
                    let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                console.log("==============="+amount);
                let service_tax = ((amount*service_charge)/100);
                let gst = ((amount*sgst)/100);
                console.log(service_tax+gst);
                let amount1 = amount+service_tax+gst;
                console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount");
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let wallet_id = walletdata[0].id;
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 1,note, offerId, discount };
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            console.log("success");
                            responses.success(res,transectiondata[0], "Transection successful");
                            console.log(walletdata[0].left_amount);
                            let left_amount = walletdata[0].left_amount - (amount);
                            console.log(left_amount);
                            UserModel.walletupdate({left_amount}, {user_id})
                            .then((walletupdatedata)=>{
                                if(walletupdatedata == 0) {
                                    responses.invalidCredential(res, "Wallet not updated");
                                } else {
                                    console.log(receiver_user_id);
                                    console.log("wallet update successfully");
                                    UserModel.getwalletdetails({user_id : receiver_user_id})
                                    .then((receiverWalletData) => {
                                        if(receiverWalletData == 0) {
                                            console.log("No receiver wallet found");
                                        } else {
                                            console.log("receiver wallet available");
                                            console.log(receiverWalletData[0].left_amount);
                                            console.log(req.body.amount);
                                            let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                            console.log(receiverWalletamount);
                                            UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                            .then((receiverWalletUpdate) => {
                                                console.log("comming");
                                                if(receiverWalletUpdate == 0) {
                                                    console.log("No update found in receiver wallet");
                                                } else {
                                                    let sql = "Delete from `userrequest` where `requestId` = ?";
                                                    connection.query(sql,[requestId],(err, result) => {
                                                        if(err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log("request money requestId deleted");
                                                        }
                                                    })
                                                    console.log("Amount added to receiver wallet successfully");
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet  amount is greater but after adding taxes is became higher than wallet " + amount1, amount);
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                            UserModel.getwalletdetails({user_id : receiver_user_id})
                                            .then((receiverWalletData) => {
                                                if(receiverWalletData == 0) {
                                                    console.log("No receiver wallet found");
                                                } else {
                                                    console.log("receiver wallet available");
                                                    console.log(receiverWalletData[0].left_amount);
                                                    console.log(req.body.amount);
                                                    let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                                    console.log(receiverWalletamount);
                                                    UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                                    .then((receiverWalletUpdate) => {
                                                        console.log("comming");
                                                        if(receiverWalletUpdate == 0) {
                                                            console.log("No update found in receiver wallet");
                                                        } else {
                                                            console.log("Amount added to receiver wallet successfully");
                                                        }
                                                    })
                                                    .catch((error) => responses.sendError(error.message, res));
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                            UserModel.getwalletdetails({user_id : receiver_user_id})
                                            .then((receiverWalletData) => {
                                                if(receiverWalletData == 0) {
                                                    console.log("No receiver wallet found");
                                                } else {
                                                    console.log("receiver wallet available");
                                                    console.log(receiverWalletData[0].left_amount);
                                                    console.log(req.body.amount);
                                                    let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                                    console.log(receiverWalletamount);
                                                    UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                                    .then((receiverWalletUpdate) => {
                                                        console.log("comming");
                                                        if(receiverWalletUpdate == 0) {
                                                            console.log("No update found in receiver wallet");
                                                        } else {
                                                            console.log("Amount added to receiver wallet successfully");
                                                        }
                                                    })
                                                    .catch((error) => responses.sendError(error.message, res));
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                     let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,insert_transection_details, "transection successful");
                                  console.log(receiver_user_id);
                                    UserModel.getwalletdetails({user_id : receiver_user_id})
                                    .then((receiverWalletData) => {
                                        if(receiverWalletData == 0) {
                                            console.log("No receiver wallet found");
                                        } else {
                                            console.log("receiver wallet available");
                                            console.log(receiverWalletData[0].left_amount);
                                            console.log(req.body.amount);
                                            let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                            console.log(receiverWalletamount);
                                            UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                            .then((receiverWalletUpdate) => {
                                                console.log("comming");
                                                if(receiverWalletUpdate == 0) {
                                                    console.log("No update found in receiver wallet");
                                                } else {
                                                    console.log("Amount added to receiver wallet successfully");
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));      
                }
            })
            .catch((error) => responses.sendError(error.message, res));            
        } else {
        console.log("normal transection code is running");
        let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                let service_tax = ((amount*service_charge)/100);
                let gst = ((amount*sgst)/100);
                console.log(service_tax+gst);
                let amount1 = amount+service_tax+gst;
                console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount");
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let wallet_id = walletdata[0].id;
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 1,note };
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            console.log("success");
                            responses.success(res,transectiondata[0], "Transection successful");
                            console.log(walletdata[0].left_amount);
                            let left_amount = walletdata[0].left_amount - (amount);
                            console.log(left_amount);
                            UserModel.walletupdate({left_amount}, {user_id})
                            .then((walletupdatedata)=>{
                                if(walletupdatedata == 0) {
                                    responses.invalidCredential(res, "Wallet not updated");
                                } else {
                                    console.log(receiver_user_id);
                                    console.log("wallet update successfully");
                                    UserModel.getwalletdetails({user_id : receiver_user_id})
                                    .then((receiverWalletData) => {
                                        if(receiverWalletData == 0) {
                                            console.log("No receiver wallet found");
                                        } else {
                                            console.log("receiver wallet available");
                                            console.log(receiverWalletData[0].left_amount);
                                            console.log(req.body.amount);
                                            let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                            console.log(receiverWalletamount);
                                            UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                            .then((receiverWalletUpdate) => {
                                                console.log("comming");
                                                if(receiverWalletUpdate == 0) {
                                                    console.log("No update found in receiver wallet");
                                                } else {
                                                    let sql = "Delete from `userrequest` where `requestId` = ?";
                                                    connection.query(sql,[requestId],(err, result) => {
                                                        if(err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log("request money requestId deleted");
                                                        }
                                                    })
                                                    console.log("Amount added to receiver wallet successfully");
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet  amount is greater but after adding taxes is became higher than wallet " + amount1, amount);
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                            UserModel.getwalletdetails({user_id : receiver_user_id})
                                            .then((receiverWalletData) => {
                                                if(receiverWalletData == 0) {
                                                    console.log("No receiver wallet found");
                                                } else {
                                                    console.log("receiver wallet available");
                                                    console.log(receiverWalletData[0].left_amount);
                                                    console.log(req.body.amount);
                                                    let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                                    console.log(receiverWalletamount);
                                                    UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                                    .then((receiverWalletUpdate) => {
                                                        console.log("comming");
                                                        if(receiverWalletUpdate == 0) {
                                                            console.log("No update found in receiver wallet");
                                                        } else {
                                                            console.log("Amount added to receiver wallet successfully");
                                                        }
                                                    })
                                                    .catch((error) => responses.sendError(error.message, res));
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let less_amount = (amount - walletdata[0].left_amount);
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = new Date();
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    UserModel.walletupdate({left_amount : 0}, {user_id})
                                    .then((walletupdatedata) => {
                                        if(walletupdatedata == 0) {
                                            responses.invalidCredential(res, "wallet not updated");
                                        } else {
                                            responses.success(res, insert_transection_details, "wallet update");
                                            console.log(receiver_user_id);
                                            console.log("wallet update successfully");
                                            UserModel.getwalletdetails({user_id : receiver_user_id})
                                            .then((receiverWalletData) => {
                                                if(receiverWalletData == 0) {
                                                    console.log("No receiver wallet found");
                                                } else {
                                                    console.log("receiver wallet available");
                                                    console.log(receiverWalletData[0].left_amount);
                                                    console.log(req.body.amount);
                                                    let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                                    console.log(receiverWalletamount);
                                                    UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                                    .then((receiverWalletUpdate) => {
                                                        console.log("comming");
                                                        if(receiverWalletUpdate == 0) {
                                                            console.log("No update found in receiver wallet");
                                                        } else {
                                                            console.log("Amount added to receiver wallet successfully");
                                                        }
                                                    })
                                                    .catch((error) => responses.sendError(error.message, res));
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                     let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = new Date();
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,insert_transection_details, "transection successful");
                                  console.log(receiver_user_id);
                                    UserModel.getwalletdetails({user_id : receiver_user_id})
                                    .then((receiverWalletData) => {
                                        if(receiverWalletData == 0) {
                                            console.log("No receiver wallet found");
                                        } else {
                                            console.log("receiver wallet available");
                                            console.log(receiverWalletData[0].left_amount);
                                            console.log(req.body.amount);
                                            let receiverWalletamount = receiverWalletData[0].left_amount+(req.body.amount);
                                            console.log(receiverWalletamount);
                                            UserModel.walletupdate({left_amount : receiverWalletamount}, {user_id : receiver_user_id})
                                            .then((receiverWalletUpdate) => {
                                                console.log("comming");
                                                if(receiverWalletUpdate == 0) {
                                                    console.log("No update found in receiver wallet");
                                                } else {
                                                    console.log("Amount added to receiver wallet successfully");
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res));
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    }
    }
   })
   .catch((error) => responses.sendError(error.message, res)); 
}


/*-----------------------------------------------------------------------------------------------------------------------------------------
                                                            Get_Summary
------------------------------------------------------------------------------------------------------------------------------------------*/

exports.getSummary = (req,res) => {
   let {sender_access_token} = req.headers;
   let {receiver_user_id ,company_name, amount, currency_type, key, tranjection_type, offerId, discountPercentage} = req.body;
   let send_amount = amount;
   let service_charge = 10;
   let sgst = 5;
   UserModel.selectQuery({access_token : sender_access_token})
   .then((userResult) =>{
    if(userResult == 0) {
        responses.authenticationErrorResponse(res);
    } else {
        if(tranjection_type == "utility") {
        let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    let amount1 = amount+service_tax+gst;
                    console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount" + amount,amount1);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let wallet_deduct_amount = total_amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let card_received_amount;
                    let time =  Math.round((new Date()).getTime() / 1000);
                    console.log("your time is" + time);
                    let wallet_id = walletdata[0].id;
                     let insert_transection_details = {transection_id, sender_id, company_name : company_name, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0 , send_amount};
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            responses.success(res, _.merge(insert_transection_details,{service_tax,gst, total_amount,wallet_deduct_amount, card_received_amount:0}),"Transection successful");
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet amount is greater than send amount But after adding taxes wallet amount became less" + amount,amount1);
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name : company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));

                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name : company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata)=>{
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card")
                        } else {
                            let card_number = carddata[0].card_number;
                            let lastFOURDigits = card_number%10000;
                            console.log("lastdigit" + lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                             let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_deduct_amount;
                    let insert_transection_details = {transection_id, sender_id, company_name : company_name, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,_.merge(insert_transection_details, {service_tax, gst, total_amount, wallet_deduct_amount :0, cardnumber}), "transection successful");
                        }
                    })
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    } else if (tranjection_type == "offer") {
        let manKeys = ["discountPercentage", "offerId"];
        let manValues = {discountPercentage, offerId}
          commFunc.checkKeyExist(req.body, manKeys)
        .then(function(result) {
            if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
            } else {
        console.log("offerId is============"+offerId)
        console.log("discountPercentage======="+discountPercentage);
        console.log("normal transection calling");
        let discount = (amount*discountPercentage)/100
        amount = amount - ((amount*discountPercentage)/100);
        console.log(amount);
        let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    let amount1 = amount+service_tax+gst;
                    console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount" + amount,amount1);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let wallet_deduct_amount = total_amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let card_received_amount;
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_id = walletdata[0].id;
                    total_amount = Number.parseFloat(amount).toFixed(2);
                    amount = Number.parseFloat(amount).toFixed(2);
                    wallet_deduct_amount = Number.parseFloat(amount).toFixed(2);
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0, send_amount, offerId, discount };
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            responses.success(res, _.merge(insert_transection_details,{service_tax,gst, total_amount,wallet_deduct_amount, card_received_amount:0,offerId , discount}),"Transection successful");
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet amount is greater than send amount But after adding taxes wallet amount became less" + amount,amount1);
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));

                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0 , send_amount}
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata)=>{
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card")
                        } else {
                            let card_number = carddata[0].card_number;
                            let lastFOURDigits = card_number%10000;
                            console.log("lastdigit" + lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                             let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_deduct_amount;
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,_.merge(insert_transection_details, {service_tax, gst, total_amount, wallet_deduct_amount :0, cardnumber}), "transection successful");
                        }
                    })
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
            }
        })
         .catch((error) => responses.sendError(error.message, res));
       
    } else {
        console.log("normal calling");
        let user_id = userResult[0].id;
        console.log(user_id);
        UserModel.getwalletdetails({user_id})
        .then((walletdata) =>{
            if(walletdata == 0 ) {
                console.log("no data")
                responses.invalidCredential(res,"no wallet found");
            } else {
                console.log(walletdata);
                console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    let amount1 = amount+service_tax+gst;
                    console.log(amount1);
                if((key == 1) && walletdata[0].left_amount > amount ){
                    if(walletdata[0].left_amount > amount1) {
                    console.log("wallet amount is greater than send amount" + amount,amount1);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    console.log(service_tax+gst);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let wallet_deduct_amount = total_amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let card_received_amount;
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_id = walletdata[0].id;
                    total_amount = Number.parseFloat(amount).toFixed(2);
                    amount = Number.parseFloat(amount).toFixed(2);
                    wallet_deduct_amount = Number.parseFloat(amount).toFixed(2);
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0, send_amount };
                    UserModel.transectiondetails(insert_transection_details)
                    .then ((transectiondata) =>{
                        if(transectiondata == 0) {
                            userResponse.invalidCredential(res, "Transection failed");
                        } else {
                            responses.success(res, _.merge(insert_transection_details,{service_tax,gst, total_amount,wallet_deduct_amount, card_received_amount:0}),"Transection successful");
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("wallet amount is greater than send amount But after adding taxes wallet amount became less" + amount,amount1);
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));

                }
                } else if((key == 1) && walletdata[0].left_amount < amount) {
                    console.log("send amount is greater");
                    console.log(walletdata[0].left_amount);
                    let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let less_amount = (amount - walletdata[0].left_amount);
                    let wallet_deduct_amount = total_amount - less_amount;
                    console.log("less_amount" + less_amount);
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata) => {
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card");
                        } else {
                            let card_id = carddata[0].card_id;
                            let card_number = carddata[0].card_number;
                            console.log(card_number);
                            let lastFOURDigits = card_number % 10000;
                            console.log("lastdigit"+lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0 , send_amount}
                            UserModel.transectiondetails(insert_transection_details)
                            .then((transectiondata) =>{
                                if(transectiondata == 0) {
                                    responses.invalidCredential(res,"Transection failed");
                                } else {
                                    responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,cardnumber}),"Transection successful");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    console.log("deduct from card");
                    let {card_id} = req.body;
                    UserModel.getcarddetails({card_id})
                    .then((carddata)=>{
                        if(carddata == 0) {
                            responses.invalidCredential(res, "Invalid card")
                        } else {
                            let card_number = carddata[0].card_number;
                            let lastFOURDigits = card_number%10000;
                            console.log("lastdigit" + lastFOURDigits);
                            let cardnumber = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
                            console.log(cardnumber);
                             let service_tax = ((amount*service_charge)/100);
                    let gst = ((amount*sgst)/100);
                    amount = amount+service_tax+gst;
                    let total_amount = amount;
                    let transection_id = md5(new Date());
                    let sender_id = userResult[0].id;
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_deduct_amount;
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,_.merge(insert_transection_details, {service_tax, gst, total_amount, wallet_deduct_amount :0, cardnumber}), "transection successful");
                        }
                    })
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    }
}
   })
   .catch((error) => responses.sendError(error.message, res)); 
}


//--------------------------------------------------------GET USER DETAILS--------------------------------------------------------------------


exports.getUserDetails = (req, res) => {
    let {access_token} = req.headers;
    let{user_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res);
        } else {
           UserModel.selectQuery({id:user_id})
           .then((userdata) => {
            if(userdata == 0) {
                responses.invalidCredential(res,"Invalid user_id");
            } else {
                responses.success(res, userdata[0]);
            }
           })
           .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}



/*-------------------------------------------------------------------------------------------------------------------------------
                                                            profilePicture
---------------------------------------------------------------------------------------------------------------------------------*/
// exports.createProfile = (req , res) => {
//     let { business_name , mobile_number ,address , profile_image } = req.body;
//     let {access_token} = req.headers;
//     let manKeys = ["business_name" , "mobile_number" ,"address"];
//     let manValues = { business_name , mobile_number ,address };
//     let condition = {access_token};
//     commFunc.checkKeyExist(manValues, manKeys)
//             .then(result => result.length ? responses.parameterMissing(res, result[0]) : '' )
//             .then(result => {
//             console.log(result)
//             UserModel.selectQuery(condition)
//             .then(userResult => userResult.length >0 ? userResult : responses.userNotExist(res))
//             .then(userResult => {
//                 if(mobile_number.length <10){
//                     responses.invalidmobilenumber(res);
//                 } else {
//                 for(let i=0; i< req.files.length ;i++) {
//                     let profile_image = `/user/${req.files[i].filename}`;
//                     let user_id = userResult[0].user_id;
//                     console.log(user_id)
//                     let updateData = {business_name , mobile_number ,address , profile_image ,is_profile_create : 1};
//                     let condition = {user_id};
//                     UserModel.updateQuery(updateData , condition)
//                         .then((userResponse) => {responses.success(res , userResponse);})
//                         .catch((error) => responses.sendError(error.message, res));
//                     }
//                 }

//             })
//             .catch((error) => responses.sendError(error.message, res));
//         })
//     .catch((error) => responses.sendError(error.message, res));
// };

//----------------------------------------------------updateProfileImage-----------------------------------------------------------
exports.updateProfileImage = (req , res) => {
    let {access_token} = req.headers;
    let {profile_image} = req.body;
    console.log(access_token);
    UserModel.selectQuery({access_token})
    .then((userdata) => {
        if(userdata == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            let user_id = userdata[0].id;
               console.log(req.files.length);
               if(req.files.length > 0) {
                 for(let i=0; i< req.files.length ;i++)
                profile_image = `/user/${req.files[i].filename}`;
                let updateData = {profile_image};
                UserModel.updateQuery(updateData,{id : user_id})
                .then((userResponse) => {responses.success(res , userResponse)})
                .catch((error) => responses.sendError(error.message, res));

               }
            }
    })
    .catch((error) => responses.sendError(error.message, res));
}

//---------------------------------------------------------deleteProfileImage-------------------------------------------------------

exports.deleteProfileImage = (req,res) => {
    let {access_token} = req.headers;
    let {user_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            let user_id = userResult[0].id;
                let updateData = {profile_image : " "}
                UserModel.updateQuery(updateData, {id : user_id})
                .then((userResponse) =>{
                    if(userResponse == 0) {
                        responses.invalidCredential(res, "Profile image not removed");
                    } else {
                        responses.success(res, userResponse);
                    }
                })
                .catch((error) => responses.sendError(error.message, res));
            }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------
                    userEditProfile
--------------------------------------------------------------------------*/

exports.EditProfile = (req, res) => {
    let {access_token} = req.headers;
    let {profile_image, address} = req.body;
    UserModel.selectQuery({access_token})
    .then((userData) => {
        if(userData == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            console.log(req.files.length);
            if(req.files.length>0) {
                for(let i =0 ; i < req.files.length ; i++)
                profile_image = `/user/${req.files[i].filename}`;
                let updateData = {profile_image, address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {
                    if(userResponse == 0) {
                        responses.invalidCredential(res, "Profile not updated");
                    } else {
                        responses.success(res , userResponse);
                    }

                })
                .catch((error) => responses.sendError(error.message, res));
            } else {
                let updateData = {address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {
                    if(userResponse == 0) {
                        responses.invalidCredential(res, "Profile not updated");
                    } else {
                        responses.success(res , userResponse);
                    }

                })
                .catch((error) => responses.sendError(error.message, res));
            }
        }
    
    })
    .catch((error) => responses.sendError(error.message, res));
}

//--------------------------------------------------------------requestMoneySummary--------------------------------------------------------

exports.getRequestSummary = (req,res) => {
   let {access_token} = req.headers;
   let {requestUserId, amount, currencyType, notes} = req.body;
   UserModel.selectQuery({access_token})
   .then((userResult) => {
    if(userResult == 0) {
        responses.authenticationErrorResponse(res,"INVALID_ACCESS_TOKEN");
    } else {

        let userId = userResult[0].id;
        let name = userResult[0].first_name;
        let requestId = md5(new Date());
        let date = Math.round((new Date()).getTime() / 1000);
        let requestData = {requestId, userId, name, requestUserId, amount, currencyType, date, notes};
        UserModel.requestDetails(requestData)
        .then((userrequest) => {
            if(userrequest == 0) {
                responses.invalidCredential(res, "Request fail");
            } else {
                responses.success(res, userrequest[0], "Request successfully sent");
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    }
   })
   .catch((error) => responses.sendError(error.message, res));
}


/*----------------------------------------------------------------------------------------------------------------------------------
                                                        SendRequest
---------------------------------------------------------------------------------------------------------------------------------*/

exports.sendRequest = (req, res) => {
    let {requestId, notes} = req.body;
    UserModel.getRequestDetails({requestId})
    .then((requestdata) => {
        if(requestdata == 0) {
            responses.invalidCredential(res, "Invalid requestId");
        } else {
            UserModel.requestDetailsUpdate({request_status : 1, notes}, {requestId})
            .then((requestupdate) => {
                if(requestupdate == 0) {
                    console.log("comming to error section");
                    responses.invalidCredential(res, "Request not sent");
                } else { console.log("comming to success section");
                     responses.success(res, requestupdate[0], "Request sent successfully")
                }
            })
            .catch((error) => responses.sendError(error.message, res));
            //responses.success(res, requestdata[0], "Request sent successfully");
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------------------------------------------------------------
                                                        merchantAddBankDetails
---------------------------------------------------------------------------------------------------------------------------------*/

exports.merchantAddBankDetails = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((merchantresult) => {
        if(merchantresult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else if (merchantresult[0].user_type === 0) {
            responses.invalidCredential(res, "Invalid user");
        } else {
            console.log("merchant successfully add bank details");
            let id = md5(new Date());
            let user_id = merchantresult[0].id;
            let {bank_name, account_number, account_type, iban_code, swift_code, routing_number} = req.body;
            let bankdata = {id, user_id, bank_name, account_number,account_type, iban_code, swift_code, routing_number};
            let manKeys = ["bank_name", "account_number", "account_type", "iban_code", "swift_code", "routing_number"];
            commFunc.checkKeyExist(req.body, manKeys)
            .then(function(result) {
                if(result.length > 0) {
            responses.parameterMissing(res, result[0])
                } else {
                    UserModel.insertbankdetails(bankdata)
                    .then ((bankresult) => {
                        if(bankresult == 0) {
                            responses.invalidCredential(res, "Unable to add bank details");
                        } else {
                            responses.success(res, bankresult[0]);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
} 

/*---------------------------------------------------------------------------------------------------------------------
                                                            merchantEditProfile
----------------------------------------------------------------------------------------------------------------------*/

// exports.merchantEditProfile = (req, res) => {
//     let {access_token} = req.headers;
//     let {profile_image, businessRegNum, email_id, country_code, mobile_number, address} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((merchantData) => {
//         if(merchantData == 0) {
//             responses.authenticationErrorResponse(res, "invalid access_token");
//         } else if(merchantData[0].user_type === 0) {
//             console.log("invalid user");
//             responses.invalidCredential(res, "Invalid user");
//         } else {
//             UserModel.selectQuery({email_id})
//             .then((userdata) => {
//                 if(userdata.length > 0) {
//                     responses.invalidCredential(res, "email_id already registered");
//                 } else {
//                     UserModel.selectQuery({mobile_number})
//                     .then((userResponse) => {
//                         if(userResponse.length > 0) {
//                             responses.invalidCredential(res, "MOBILE_ALREADY_EXISTS");
//                         } else {
//                                  console.log("success");
//                                 console.log(req.files.length);
//                                if(req.files.length > 0) {
//                                 for(let i=0; i< req.files.length ;i++)
//                                 profile_image = `/user/${req.files[i].filename}`;
//                                 let updateData = {profile_image, businessRegNum, email_id, country_code, mobile_number, address}
//                                 UserModel.updateQuery(updateData,{access_token : access_token})
//                                 .then((userResponse) => {responses.success(res , userResponse)})
//                                 .catch((error) => responses.sendError(error.message, res));
//                                }
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 }
//             })
//             .catch((error) => responses.sendError(error.message, res));
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }

exports.merchantEditProfile = (req, res) => {
    let {access_token} = req.headers;
    let {profile_image, businessRegNum, email_id, country_code, mobile_number, address} = req.body;
    UserModel.selectQuery({access_token})
    .then((merchantData) => {
        if(merchantData == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else if(merchantData[0].user_type === 0) {
            responses.invalidCredential(res, "Invalid user");
        } else {
            console.log(req.files.length);
            if(req.files.length>0) {
                for(let i =0 ; i < req.files.length ; i++)
                profile_image = `/user/${req.files[i].filename}`;
                let updateData = {profile_image, businessRegNum, address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {
                    if(userResponse == 0) {
                        responses.invalidCredential(res, "Profile not updated");
                    } else {
                        responses.success(res , userResponse);
                    }

                })
                .catch((error) => responses.sendError(error.message, res));
            } else {
                let updateData = {businessRegNum, address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {
                    if(userResponse == 0) {
                        responses.invalidCredential(res, "Profile not updated");
                    } else {
                        responses.success(res , userResponse);
                    }

                })
                .catch((error) => responses.sendError(error.message, res));
            }
        }
    
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------------------------------------------------
                                                    merchantCreateProfile
------------------------------------------------------------------------------------------------------------------------*/

exports.merchantCreateProfile = (req, res) => {
    let {access_token} = req.headers;
    let {profile_image, businessRegNum, address} = req.body;
    UserModel.selectQuery({access_token})
    .then((merchantData) => {
        if(merchantData == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else if(merchantData[0].user_type === 0) {
            console.log("invalid user");
            responses.invalidCredential(res, "Invalid user");
        } else {
            console.log("success");
            console.log(req.files.length);
            if(req.files.length > 0) {
            for(let i=0; i< req.files.length ;i++)
            profile_image = `/user/${req.files[i].filename}`;
            let updateData = {profile_image, businessRegNum, address, is_merchant_profile_created : 1}
            UserModel.updateQuery(updateData,{access_token : access_token})
            .then((userResponse) => {responses.success(res , userResponse)})
            .catch((error) => responses.sendError(error.message, res));
            } else {
                 let updateData = {businessRegNum, address, is_merchant_profile_created : 1}
                    UserModel.updateQuery(updateData,{access_token : access_token})
                    .then((userResponse) => { responses.success(res, userResponse)})
                     .catch((error) => responses.sendError(error.message, res));
            }
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*----------------------------------------------------------------------------------------------------------------------
                                                    merchantGetBankDetails
-----------------------------------------------------------------------------------------------------------------------*/

exports.getBankDetails = (req, res) => {
    let newAccountNumber = [];
    let {access_token} = req.headers;
    let {id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) =>{
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else if (userResult[0].id != id) {
            responses.invalidCredential(res, "invalid user_id");
        } else {
            UserModel.getBankDetails({user_id : id})
            .then((bankdata) =>{
                if(bankdata == 0) {
                    responses.invalidCredential(res, "no bank data found");
                } else {
                    for(let i = 0 ; i<bankdata.length; i++) {
                        console.log(newAccountNumber.push("XXXX-XXXX-XXXX-"+(bankdata[i].account_number)%10000));
                    }
                    console.log(newAccountNumber.push(bankdata));
                    console.log(newAccountNumber);
                    responses.success(res, newAccountNumber);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*------------------------------------------------------------------------------------------------------------------
                                                merchantEditBankDetails
------------------------------------------------------------------------------------------------------------------*/

exports.merchantEditBankDetails = (req, res) => {
    let {access_token} = req.headers;
    let {bank_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) =>{
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            UserModel.getBankDetails({id : bank_id})
            .then((bankdata) => {
                if(bankdata == 0) {
                    responses.invalidCredential(res, "no bank data found");
                } else {
                    let id = bank_id;
                    let {bank_name, account_number, account_type, iban_code, swift_code, routing_number} = req.body;
                    let bankdata = {id, bank_name, account_number,account_type, iban_code, swift_code, routing_number};
                    UserModel.updateBankDetails((bankdata), {id})
                    .then((updateBankData) => {
                        if(updateBankData == 0) {
                            responses.invalidCredential(res, "Unable to update bank details");
                        } else {
                            responses.success(res, updateBankData[0]);
                        }
                    })                 
                    //responses.success(res, bankdata[0]);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*------------------------------------------------------------------------------------------------------------------
                                                merchantDeleteBankDetails
------------------------------------------------------------------------------------------------------------------*/

exports.merchantDeleteBankDetails = (req, res) => {
    let {access_token} = req.headers;
    let {id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) =>{
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            UserModel.getBankDetails({id})
            .then((bankdata) => {
                if(bankdata == 0) {
                    responses.invalidCredential(res, "no bank data found");
                } else {
                    UserModel.deleteBankDetails({id})
                    .then((bankdeleted) => {
                        if(bankdeleted == 0) {
                            responses.invalidCredential(res, "Bank data not deleted");
                        } else {
                            responses.success(res, "Bank details deleted successfully");
                        }
                    })
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------------------------------------------
                                                showItemList
------------------------------------------------------------------------------------------------------------------*/

exports.showItemList = (req, res) => {
    UserModel.getitemlist()
    .then((itemresult) => {
        if(itemresult == 0) {
            responses.invalidCredential(res, "no item found");
        } else {
            responses.success(res, itemresult);
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*--------------------------------------------------------------------------------------------------------------------
                                        merchantGenerateBill
--------------------------------------------------------------------------------------------------------------------*/
// import connection from '../Modules/connection.js';
// exports.generateBill = (req, res) => {
//     let {access_token} = req.headers;
//     let {customer_name, mobile_number, item_id} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.authenticationErrorResponse(res, "invalid access_token");
//         } else {
//             //console.log(item_id);
//             //for(let i = 0 ;i<item_id.length ; i++) 
//                 console.log(item_id);
//                 let sql = "select sum(item_price) as total_amount from `item_list` where `item_id` in (?)";
//                 connection.query(sql, [item_id],(err, result) => {
//                     if(err) {
//                         console.log(err);
//                     } else {
//                         let amount = Object.values(result[0])
//                         let service_tax =  ((amount*10)/100);
//                         console.log(service_tax);
//                         let discount = ((amount*5)/100);
//                         console.log(discount);

//                         console.log(result[0]);
//                         responses.success(res, _.merge(result[0],{service_tax, discount}));
//                     }
//                 })
//         }
//     })
// }

import connection from '../Modules/connection.js';
exports.generateBill = (req, res) => {
    let {access_token} = req.headers;
    let {item_list} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            let itemListArr = [];
            let total_amount_price = 0;
                async.eachSeries(item_list, get_item_price, (results)=> {
                console.log(total_amount_price);
                let tax = ((total_amount_price * 10) / 100)
                let discount = ((total_amount_price * 5) / 100)
                let actual_cost = (total_amount_price + tax) - discount;
                responses.success(res, {itemListArr,total_amount_price, tax, discount, actual_cost});
                itemListArr = [];
            });

            function get_item_price(items, callback) {
                let sql = "select item_price, item_name from `item_list` where `item_id`=?";
                connection.query(sql, [items.item_id],(err, result) => {
                    if(err) {
                        callback();
                    } else {
                        let total_amount = parseInt(result[0].item_price) * parseInt(items.total_quantity);
                       total_amount_price  = total_amount_price+total_amount;
                        let data = {
                            item_name : result[0].item_name,
                            total_amount: total_amount,
                            total_quantity: items.total_quantity,
                            item_id: items.item_id,
                            item_price: result[0].item_price
                        };
                        itemListArr.push(data);
                        callback();
                    }
                })
            }
        }
    })
}

// /*-----------------------------------------------------------------------------------------------------------------
//                                                 sendQrCode
// ------------------------------------------------------------------------------------------------------------------*/

// exports.sendQrCode = (req, res) => {
//     let {access_token} = req.headers;
//     let {email_id} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.authenticationErrorResponse(res, "INVALID_ACCESS_TOKEN");
//         } else if(userResult[0].user_type === 0) {
//             responses.invalidCredential(res);
//         } else {
//              console.log("success");
//             console.log(req.files.length);
//             if(req.files.length > 0) {
//             for(let i=0; i< req.files.length ;i++)
//             profile_image = `/user/${req.files[i].filename}`;
//             let updateData = {profile_image, businessRegNum, address, is_merchant_profile_created : 1}
//             UserModel.updateQuery(updateData,{access_token : access_token})
//             .then((userResponse) => {responses.success(res , userResponse)})
//             .catch((error) => responses.sendError(error.message, res));
//             }
//         }
//     })
// }

/*--------------------------------------------------------------------------------------------------------------------
                                            generateInvoice
---------------------------------------------------------------------------------------------------------------------*/

// exports.generateInvoice = (req, res) => {
//     let {access_token} = req.headers;
//     let list_item = [];
//     let {customer_name, contact_details, item_id, total_amount} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.authenticationErrorResponse(res, "INVALID_ACCESS_TOKEN");
//         } else {
//             let merchant_id = userResult[0].id;
//             let sql = "select `item_id`, `item_name`, `item_price` from item_list where `item_id` in (?) ";
//             connection.query(sql, [item_id],(err, result) => {
//                 if(err) {
//                     console.log(err);
//                 } else {
//                     console.log(result);
//                     for(let i = 0 ;i < result.length ; i++) {
//                     //console.log(Object.values(result[i]));
//                     //console.log(list_item.push(Object.values(result[i])));
//                     console.log(list_item.push(result[i]));
                    
//                 }  
//                 console.log(list_item);
//                     let invoice_number = commFunc.generateRandomString();
//                     console.log(invoice_number);
//                     //let date = new Date();
//                     let date = Math.round(new Date().getTime() / 1000);
//                     let invoiceData = {invoice_number : invoice_number, merchant_id, customer_name, contact_details, item_list : JSON.stringify(list_item), date : date, total_amount};
//                     console.log(invoiceData);
//                     //responses.success(res, invoiceData);
//                     UserModel.invoiceDetails(invoiceData)
//                     .then((invoiceresult) => {
//                         if(invoiceresult == 0) {
//                             responses.invalidCredential(res, "invoice not generated");
//                         } else {
//                             responses.success(res, invoiceresult[0], "invoice generated");
//                         }
//                     })
//                 }
//             })
//         }
//     })
// } 

exports.generateInvoice = (req, res) => {
    let {access_token} = req.headers;
    let list_item = [];
    let {customer_name, contact_details, total_amount, tax, discount, actual_cost, itemListArr} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "INVALID_ACCESS_TOKEN");
        } else {
            let merchant_id = userResult[0].id;
            let date = Math.round(new Date().getTime() / 1000);
            let invoice_number = commFunc.generateRandomString();
            let month = commFunc.unixTimeConversion(date);
            let invoiceData = {invoice_number : invoice_number, merchant_id, customer_name, contact_details, item_list : JSON.stringify(itemListArr), date : date  , total_amount, tax, discount, actual_cost, month};
            console.log(invoiceData);
            UserModel.invoiceDetails(invoiceData)
            .then((invoiceresult) => {
                if(invoiceresult == 0) {
                    responses.invalidCredential(res, "No invoice generated");
                } else {
                    responses.success(res, invoiceresult[0], "invoice generated");
                }
            })
        }
    })
}


/*-------------------------------------------------------------------------------------------------
                                    sendQrCode
--------------------------------------------------------------------------------------------------*/

exports.sendQrCode = (req, res) => {
    let {access_token} = req.headers;
    let{user_id, receiver_id, qrCode} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            userResponsen.authenticationErrorResponse(res, "invalid access_token");
        } else {
             responses.success(res, receiver_id);
            console.log(req.files.length);
            if(req.files.length > 0) {
            for(let i=0; i< req.files.length ;i++)
                qrCode = `/user/${req.files[i].filename}`;
                console.log(qrCode);
                for(let i =0; i<receiver_id.length ;i++) {
                    console.log("receiver_id length =="+receiver_id.length);
                    let sql = "insert into `qrcodetbl` (receiver_id, qrCode,user_id) values (?,?,?)";
                    connection.query(sql, [receiver_id[i],qrCode, user_id],(err, result) => {
                        if(err){
                            console.log(err);
                        } else {
                            // console.log("your id is" + receiver_id[i]);
                            // console.log("your image is"+ qrCode);
                            // //responses.success(res, "image sent");
                            // let sql = "update `qrcodetbl` set qrCode = ?, user_id = ? where receiver_id = ?";
                            // connection.query(sql,[qrCode,user_id,receiver_id[i]],(err, result) => {
                            //     if(err) {
                            //         console.log(err);
                            //     } else {
                            //         // responses.success(res,qrCode);
                            //         console.log("success");
                            //     }
                            // })
                        }
                    })
                }
            }

        }
    })

}


/*--------------------------------------------------------------------------------------------
                                    showAllUser
---------------------------------------------------------------------------------------------*/

exports.showAllUser = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.invalidCredential(res, "Invalid access_token");
        } else {
            let sql = "select id,first_name, mobile_number from `user_tbl` where user_type not in (1)";
            connection.query(sql,(err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    responses.success(res, result);
                }
            })
        }
    })
     .catch((error) => responses.sendError(error.message, res));
}

/*------------------------------------------------------------------------
                    getInvoiceDetails
------------------------------------------------------------------------*/

exports.getInvoiceDetails = (req, res) => {
    let {invoice_number} = req.body;
    //console.log(JSON.stringify(invoice_number));
    let sql = "select * from `invoice_tbl` where `invoice_number` = ?";
    connection.query(sql, [invoice_number],(err, result) => {
        if(err) {
            console.log(err);
        } else if (result == 0) {
            responses.invalidCredential(res, "NO data found");
        } else {
            //let data = JSON.stringify(result[0].item_list);
            //console.log(data);
            let item_list = JSON.parse(result[0].item_list);
            console.log(item_list);
            let invoice_number = result[0].invoice_number;
            let total_amount = result[0].total_amount;
            let customer_name = result[0].customer_name;
            let contact_details = result[0].contact_details;
            let tax = result[0].tax;
            let discount = result[0].discount;
            let actual_cost = result[0].actual_cost;
            responses.success(res, _.merge({item_list,invoice_number,customer_name,total_amount,contact_details,tax,discount,actual_cost}));
            console.log(result);
        }
    })
}

/*--------------------------------------------------------------
                        getAllInvoiceDetails
--------------------------------------------------------------*/

// exports.getAllInvoiceDetails = (req, res) => {
//     let june = [];
//     let july = [];
//     let {access_token} = req.headers;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             responses.authenticationErrorResponse(res, "Invalid access_token");
//         } else {
//                     let merchant_id = userResult[0].id;
//                     console.log(merchant_id);
//                      let sql = "select customer_name, date, actual_cost, invoice_number, month from `invoice_tbl` WHERE `merchant_id` = ? order BY date";
//                     connection.query(sql,[merchant_id],(err, result) =>{
//                      if(err) {
//                     console.log(err);
//                     } else if(result == 0) {
//                     responses.success(res, "No data found");
//                     } else {
//                     let date = commFunc.unixTimeConversion(result[0].date);
//                     console.log(date);
//                     result.forEach(function(element) {
//                         if(element.month == '06') {
//                             let data = {
//                                 invoice_number : element.invoice_number,
//                                 actual_cost : element.actual_cost
//                             }
//                             june.push(data);
//                         }
//                         if(element.month == '07') {
//                             let data = {
//                                 invoice_number : element.invoice_number,
//                                 actual_cost : element.actual_cost   
//                             }
//                             july.push(data);
//                         }
//                     })
//                     console.log(june)
//                     console.log(july)
//                     // var moment = require('moment');
//                     // let groupedResults = _.groupBy(result, (result) => moment(result['Date'], 'DD/MM/YYYY').startOf('isoWeek'));
//                     //console.log(groupedResults);
//                     // let data = result.map(element=>_.merge(element,{item_list :JSON.parse(element.item_list)}))
//                      responses.success(res,{june, july});
//                     }
//             })
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }

exports.getAllInvoiceDetails = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
                    let merchant_id = userResult[0].id;
                    UserModel.getinvoicelist({merchant_id})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.success(res,"No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr = _.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
    .catch((error) => responses.sendError(error.message, res));
}

/*------------------------------------------------------------------------------
                        searchInvoice
------------------------------------------------------------------------------*/

exports.searchInvoice = (req, res) => {
    let {access_token} = req.headers;
    let {customer_name} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
                    let merchant_id = userResult[0].id;
                    UserModel.searchinvoice({merchant_id, customer_name})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.invalidCredential(res, "No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr =_.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                }
            })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------------
                                    invoiceSorting
------------------------------------------------------------------------------------*/

exports.getSortedInvoiceDetails = (req, res) => {
    let {access_token} = req.headers;
    let {sortedBy} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
                    let merchant_id = userResult[0].id;
                    if (sortedBy == 1) {
                    UserModel.getinvoicelisthighamount({merchant_id})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.success(res,"No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr =_.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else if (sortedBy == 2) {
                    UserModel.getinvoicelistlowamount({merchant_id})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.success(res,"No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr =_.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else if(sortedBy == 3) {
                    UserModel.getinvoicelist({merchant_id})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.success(res,"No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr =_.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                } else {
                    UserModel.getinvoicelistnewtoold({merchant_id})
                    .then((invoicedata) => {
                        if(invoicedata == 0) {
                            responses.success(res,"No data found");
                        } else {
                            let resData = _.groupBy(invoicedata, 'display_header');
                            let arr =_.map(resData,(value,key)=>({month:key,data:value}))
                            responses.success(res,arr);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            }
            })
    .catch((error) => responses.sendError(error.message, res));
}


/*------------------------------------------------------
                    getPushNotification
------------------------------------------------------*/

exports.getPushNotification = (req, res) => {
    let {access_token, device_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            if(userResult[0].device_token != device_token ) {
                responses.invalidCredential(res, "Invalid device_token");
            } else {
                let device_token = userResult[0].device_token;
                commFunc.sendNotification(device_token);
                responses.success(res, userResult[0]);
            }
        }
    })
}

/*---------------------------------------------------------------
                    getRequestDetails
----------------------------------------------------------------*/

exports.getRequestDetails = (req, res) => {
    console.log("working");
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            console.log(userResult[0].id);
            let requestUserId = userResult[0].id;
            let sql = "select requestId, userId, name, amount, date, currencyType, type from `userrequest` where requestUserId = ?";
            connection.query(sql, [requestUserId], (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(result);
                    responses.success(res, result,"Your total no of requests");
                }
            })
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*---------------------------------------------------------------------
                            receiveMoneyDetails
----------------------------------------------------------------------*/

exports.receiveMoneyDetails = (req, res) =>{
    let {access_token} = req.headers;
    let arr = [];
    let arr1 = [];
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if (userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            let receiver_id = userResult[0].id;
            console.log("receiver_id" + receiver_id);
            UserModel.paymentData({receiver_id})
            .then((paymentData) =>{
                if(paymentData == 0) {
                    responses.success(res, "No data found");
                } else {
                    let sql = "select `sender_id`, `transection_id` from `payment_tbl` WHERE `receiver_id` = ?"
                    connection.query(sql,[receiver_id], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result[0].sender_id);

                            let id = result[0].sender_id;
                            console.log("id is==========="+id);
                            for(let i = 0 ;i<result.length ;i++) {
                                console.log(arr.push(result[i].sender_id))
                                console.log(arr1.push(result[i].transection_id))
                            }
                            console.log(arr);
                            console.log(arr1);
                            let sql = "select user_tbl.first_name, user_tbl.profile_image,user_tbl.email_id,user_tbl.mobile_number, payment_tbl.amount,payment_tbl.time FROM payment_tbl JOIN user_tbl ON user_tbl.id = payment_tbl.sender_id where payment_tbl.transection_id in (?) and payment_tbl.sender_id in (?) and status = 1 order by payment_tbl.time desc";
                            connection.query(sql,[arr1,arr],(err, result) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    result.forEach(function (element){
                                        element.type = "Receive";
                                    })
                                    responses.success(res, result);
                                    console.log(result);
                                }
                            })  
                        }
                    })
                }
            })
            .catch((error) => responses.sendError(error.message, res));            
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


/*-------------------------------------------------------------------------
                                sendMoneyDetails
--------------------------------------------------------------------------*/

exports.sendMoneyDetails = (req, res) => {
    let arr = [];
    let arr1 = [];
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if (userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
             let sender_id = userResult[0].id;
            console.log(sender_id);
            UserModel.paymentData({sender_id})
            .then((paymentresult) =>{
                if(paymentresult == 0) {
                    responses.success(res, "No data found");
                } else {
                         let sql = "select `receiver_id`, `transection_id` from `payment_tbl` WHERE `sender_id` = ?"
                        connection.query(sql,[sender_id], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result[0].receiver_id);
                            let id = result[0].receiver_id;
                            console.log("id is==========="+id);
                            for(let i = 0 ;i<result.length ;i++) {
                                console.log(arr.push(result[i].receiver_id))
                                console.log(arr1.push(result[i].transection_id))
                            }
                            console.log(arr);
                            console.log(arr1);
                            let sql = "select user_tbl.first_name, user_tbl.profile_image, user_tbl.email_id, user_tbl.mobile_number, payment_tbl.amount, payment_tbl.time, payment_tbl.payment_for FROM payment_tbl JOIN user_tbl ON user_tbl.id = payment_tbl.receiver_id where payment_tbl.transection_id in (?) and payment_tbl.receiver_id in (?)";
                            connection.query(sql,[arr1,arr],(err, result) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                     result.forEach(function (element){
                                        element.type = "Send";
                                    })
                                    //responses.success(res,result);
                                    //console.log(result);
                                    let sql = "select company_name , amount, time, status, payment_for as payment_for from `payment_tbl` WHERE `sender_id` = ? and payment_for = 1";
                                    connection.query(sql,[sender_id], (err, result1) => {
                                        if(err) {
                                            console.log(err);
                                        } else {
                                            //console.log(result);
                                            result1.forEach((element) => {
                                                 element.type = "Send";
                                            })
                                            let allresult = result.concat(result1)
                                            responses.success(res, allresult);
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------------------
                            allActivityDetails
------------------------------------------------------------------------------------------*/

exports.allActivityDetails = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            let receiver_id = userResult[0].id;
            let sender_id = userResult[0].id;
            UserModel.paymentData1({receiver_id, sender_id})
            .then((paymentresult) => {
                if(paymentresult == 0) {
                    responses.success(res, paymentresult, "No data found");
                } else {
                  let sql = " select * from (select user_tbl.first_name, user_tbl.profile_image, user_tbl.email_id, user_tbl.mobile_number, payment_tbl.transection_id, payment_tbl.time, payment_tbl.send_amount, payment_tbl.status, payment_tbl.company_name, payment_tbl.sender_id  FROM payment_tbl left JOIN user_tbl ON(user_tbl.id = payment_tbl.receiver_id) WHERE sender_id = ? UNION select user_tbl.first_name, user_tbl.profile_image, user_tbl.email_id, user_tbl.mobile_number, payment_tbl.transection_id, payment_tbl.time, payment_tbl.send_amount, payment_tbl.status, payment_tbl.company_name, payment_tbl.sender_id  FROM payment_tbl JOIN user_tbl ON(user_tbl.id = payment_tbl.sender_id) WHERE receiver_id = ?)as tblname order by time desc"
                   connection.query(sql,[sender_id, receiver_id],(err, result) => {
                    if(err) {
                        console.log(err)
                    } else {
                        result.forEach((element) =>{
                            if(element.sender_id == sender_id){
                                element.type = "Send"
                            } else {
                                element.type = "Receive"
                            }
                        })
                        responses.success(res, result)
                    }
                   })
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------
                        addLoyalityPrograms
---------------------------------------------------------------------------*/


exports.addLoyalityPrograms = (req, res) => {
    let {loyalityProgramName, loyalityProgramImage} = req.body;
    if(req.files.length > 0) {
     for(let i=0; i< req.files.length ;i++)
    loyalityProgramImage = `/user/${req.files[i].filename}`;
    let loyalitydata = {loyalityProgramName, loyalityProgramImage}
    loyalityModel.insertQuery(loyalitydata)
    .then((loyalityresult) =>{
        if(loyalityresult == 0) {
            responses.invalidCredential(res, "Loyality card details not added");
        } else {
            responses.success(res,"Loyality program inserted" )
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

}

/*---------------------------------------------------------------------
                            getAllLoyalityProgramDetails
---------------------------------------------------------------------*/

exports.getAllLoyalityProgramDetails = (req, res) =>{
    loyalityModel.getLoyalityPrograms()
    .then((loyalityprogramdata) => {
        if(loyalityprogramdata == 0 ) {
            responses.invalidCredential(res, "No loyality program found");
        } else {
            responses.success(res, loyalityprogramdata);
        } 
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------
                        addLoyalityCardDetails
----------------------------------------------------------------------------*/

exports.addLoyalityCardDetails = (req, res) => {
    let {access_token} = req.headers;
    let {id, loyalityCardNumber, month, year, cvv} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            loyalityModel.getLoyalityProgramsDetails({id})
            .then((loyalityprogramdata) => {
                if(loyalityprogramdata == 0) {
                    responses.invalidCredential(res, "No loyality program found");
                } else {
                    let user_id = userResult[0].id;
                    console.log("add loyality card");
                    let loyalityCardId = md5(new Date());
                    let loyalityProgramName = loyalityprogramdata[0].loyalityProgramName;
                    let loyalityProgramImage = loyalityprogramdata[0].loyalityProgramImage;
                    let loyalityCardDetails = {loyalityCardId, user_id, loyalityCardProgramType : id, loyalityProgramName, loyalityProgramImage, loyalityCardNumber, month, year, cvv}
                    loyalityModel.insertloyalitycardQuery(loyalityCardDetails)
                    .then((loyalityCardData) => {
                        if(loyalityCardData == 0) {
                            responses.invalidCredential(res, "Unable to add loyalitycard");
                        } else {
                            responses.success(res, loyalityCardData[0]);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-------------------------------------------------------------------------------------
                            loyalityCradList
-------------------------------------------------------------------------------------*/

exports.loyalityCradList = (req, res) =>{
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            let user_id = userResult[0].id;
            loyalityModel.getLoyalityCardList({user_id})
            .then((loyalitycarddata) => {
                if(loyalitycarddata == 0) {
                    responses.success(res,loyalitycarddata, "No loyality card added");
                } else {
                    responses.success(res, loyalitycarddata);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------------------
                                        editLoyalityCardDetails
--------------------------------------------------------------------------------------*/

exports.editLoyalityCardDetails = (req, res) => {
    let {loyalityCardId, loyalityCardNumber, month, year, cvv} = req.body;
    let updateData = {loyalityCardNumber, month, year, cvv}
    loyalityModel.updateLoyalityCardDetails(updateData, {loyalityCardId})
    .then((updateResult) => {
        if(updateResult == 0) {
            responses.invalidCredential(res, "loyality card not updated");
        } else {
            responses.success(res, updateResult);
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-------------------------------------------------------------------------------------
                                    deleteLoyalityCard
-------------------------------------------------------------------------------------*/

exports.deleteLoyalityCard = (req, res) => {
    let {loyalityCardId} = req.body;
    loyalityModel.deleteLoyalityCardDetails({loyalityCardId})
    .then((loyalitycardresult) => {
        if(loyalitycardresult == 0) {
            responses.invalidCredential(res, "Loyality card not deleted");
        } else {
            responses.success(res, "Loyality card successfully removed");
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------
                            searchLoyalityProgram
-----------------------------------------------------------------------------*/

exports.searchLoyalityProgram = (req, res) => {
    let {loyalityProgramName} = req.body;
    loyalityModel.getLoyalityProgramsDetails({loyalityProgramName})
    .then((loyalityProgram) => {
        if(loyalityProgram == 0) {
            responses.invalidCredential(res, "Invalid loyality card details");
        } else {
            responses.success(res,loyalityProgram);
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}



/*---------------------------------------------------------------------------
                            addMoneyInWallet
----------------------------------------------------------------------------*/

exports.addMoneyInWallet = (req, res) => {
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res)
            } else {
                let user_id = userResult[0].id;
                let {card_name, card_number, mm, yy, cvv, prefrence, amount} = req.body;
                let card_id = md5(new Date());
                let card_added_on = Math.round((new Date()).getTime() / 1000);
                let card_data = {card_id, user_id, card_name, card_number, mm, yy, cvv, card_added_on, prefrence};
                UserModel.addcarddetails(card_data)
                .then((carddata) => {
                if(carddata == 0) {
                    responses.invalidCredential(res, "Unable to add card details");
                } else {
                    UserModel.getwalletdetails({user_id})
                    .then((walletdetails) => {
                        if(walletdetails == 0) {
                            responses.invalidCredential(res, "No wallet found");
                        } else {
                            let left_amount = walletdetails[0].left_amount;
                            let new_amount = left_amount + amount;
                            UserModel.walletupdate({left_amount : new_amount},{user_id})
                            .then((updatedwalletdetails) => {
                                if(updatedwalletdetails == 0) {
                                    responses.invalidCredential(res, "wallet not updated");
                                } else {
                                    responses.success(res, {new_amount});
                                    console.log(uniqid('tra-'));
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
     .catch((error) => responses.sendError(error.message, res));
}

// exports.addMoneyInWallet = (req, res) => {
//     let {access_token} = req.headers;
//     let {amount} = req.body;
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) { 
//             responses.authenticationErrorResponse(res, "invalid access_token");
//         } else {
//             // let mobile_number = userResult[0].country_code.concat(userResult[0].mobile_number);
//             // console.log(mobile_number);
//             let user_id = userResult[0].id;
//             UserModel.getwalletdetails({user_id})
//             .then((walletdetails) => {
//                 if(walletdetails == 0) {
//                     responses.invalidCredential(res, "No wallet found");
//                 } else {
//                     let left_amount = walletdetails[0].left_amount;
//                     let new_amount = left_amount + amount;
//                     UserModel.walletupdate({left_amount : new_amount},{user_id})
//                     .then((updatedwalletdetails) => {
//                         if(updatedwalletdetails == 0) {
//                             responses.invalidCredential(res, "wallet not updated");
//                         } else {
//                             responses.success(res, {new_amount});
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 }
//             })
//             .catch((error) => responses.sendError(error.message, res));
//         }
//     })
//     .catch((error) => responses.sendError(error.message, res));
// }


/*--------------------------------------------------------------------------
                        addOffers
---------------------------------------------------------------------------*/


exports.addOffers = (req, res) => {
    let {offerImage, offerContent, discountPercentage} = req.body;
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
/*-------------------------------------------------------------------------
                            showOfferList
--------------------------------------------------------------------------*/

exports.showOfferList = (req,res) => {
    let sql = "select * from `offer_tbl`";
    connection.query(sql, (err, result) => {
        if(err) {
        responses.invalidCredential(res, "error in execution");
    } else {
        responses.success(res, result);
    }
    })
}


/*---------------------------------------------------------------------------------
                            searchMerchant
---------------------------------------------------------------------------------*/

exports.searchMerchant = (req, res) => {
    let{mobile_number, email_id, first_name} = req.body;
    UserModel.searchUserdata({email_id, mobile_number, first_name})
    .then((userResult) =>{
        if(userResult == 0) {
            if(mobile_number) { 
                responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
            } else if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
            } else {
                responses.invalidCredential(res, constant.responseMessages.INVALID_NAME);
            }
        } else if (userResult[0].user_type === 0) {
            responses.invalidCredential(res, "Invalid user");
        } else {
            responses.success(res, userResult[0], "User Data");
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-------------------------------------------------------------------------
                            showCardList
-------------------------------------------------------------------------*/

exports.getcarddetails = (req,res) => {
    let user_id = req.user.id;
    UserModel.getcarddetails({user_id})
    .then((carddetails) => {
        if(carddetails == 0) {
            responses.invalidCredential(res, "No card found");
        } else {
            responses.success(res, carddetails)
        }
    })
    .catch((error) => responses.sendError(error.message, res));
} 


/*-------------------------------------------------
                changePin
--------------------------------------------------*/

exports.changePin = (req, res) => {
    let { access_token } = req.headers;
    let { old_pin, new_pin } = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.authenticationErrorResponse(res);
        } else if(userResult[0].pin != old_pin) {
            responses.invalidCredential(res, "Invalid pin");
        } else {
            let user_id = userResult[0].id;
            UserModel.updateQuery({pin : new_pin}, { id : user_id })
            .then((updateResult) => {
                if(updateResult.length == 0) {
                    responses.invalidCredential(res, "Unable to update PIN");
                } else {
                    responses.success(res,updateResult);
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*-----------------------------------------------------
                    editCardDetails
------------------------------------------------------*/

exports.editCardDetails = (req, res) => {
    let {access_token} = req.headers;
    let {card_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userData) => {
        if(userData.length == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            UserModel.getcarddetails({card_id})
            .then((cardData) => {
                if(cardData.length == 0) {
                    responses.invalidCredential(res, "No card Found")
                } else {
                    let {card_name, card_number, mm, yy, cvv} = req.body;
                    let updateData = {card_name, card_number, mm, yy, cvv};
                    UserModel.editCard(updateData,{card_id})
                    .then((updateCardData) =>{
                        if(updateCardData.length == 0) {
                            responses.invalidCredential(res, "Unable to update card details");
                        } else {
                            responses.success(res, updateCardData);
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    }) 
    .catch((error) => responses.sendError(error.message, res));
}

/*---------------------------------------------------------
                    deleteCard
----------------------------------------------------------*/

exports.deleteCard = (req, res) => {
    let {access_token} = req.headers;
    let {card_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            UserModel.getcarddetails({card_id})
            .then((cardData) => {
                if(cardData.length == 0) {
                    responses.invalidCredential(res, "No card found");
                } else {
                    UserModel.deletecarddetails({card_id})
                    .then((deletedData) => {
                        if(deletedData.length == 0) {
                            responses.invalidCredential(res, "Unable to delete card");
                        } else {
                            responses.success(res, "Card deleted successfully");
                        }
                    })
                .catch((error) => responses.sendError(error.message, res));
                }
            })
            .catch((error) => responses.sendError(error.message, res));
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------
                    cardSetPreference
--------------------------------------------------------*/

exports.setDefaultCard = (req, res) => {
    let {access_token} = req.headers;
    let {card_id, bank_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userData) => {
        let user_id = userData[0].id;
        if(userData.length == 0) {
            responses.authenticationErrorResponse(res);
        } else {
            if(card_id) {
            UserModel.getcarddetails({card_id})
            .then((cardData) => {
                if(cardData.length == 0) {
                    responses.invalidCredential(res, "No card Found")
                } else {
                    UserModel.editCard({isPreferred : 0}, {user_id})
                    .then((cardData) =>{
                        if(cardData.length == 0) {
                            responses.authenticationErrorResponse(res, "Unable to update");
                        } else {
                            //responses.success(res,"Card added as default");
                            UserModel.editCard({isPreferred : 1}, {card_id})
                            .then((cardDetails)=>{
                                if(cardDetails.length == 0) {
                                    responses.success(res, "Unable to set default card")
                                } else {
                                    UserModel.setDefaultPayment({isPreferred : 0}, {user_id})
                                    .then((bankdata) => {
                                        if(bankdata.length == 0) {
                                            console.log(bankdata);
                                            responses.success(res, "Card successfully set as default")
                                        } else {
                                            UserModel.updateQuery({isAutoPayActive : 1}, {id : user_id})
                                            .then((updateAutoPay) => {
                                                if(updateAutoPay.length == 0) {
                                                    responses.invalidCredential(res, "Unable to avtive auto pay");
                                                } else {
                                                     responses.success(res, "Card successfully set as default for autopay");         
                                                }
                                            })
                                           .catch((error) => responses.sendError(error.message, res)); 
                                        }
                                    })
                                    .catch((error) => responses.sendError(error.message, res)); 
                                    //responses.success(res, "Card successfully set as default");
                                }
                            })
                            .catch((error) => responses.sendError(error.message, res)); 
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res)); 
                }
            })
            .catch((error) => responses.sendError(error.message, res));   
            } else {
                console.log("bank details prefrence is calling");
                UserModel.setDefaultPayment({isPreferred : 0},  {user_id})
                .then((bankResult) => {
                    if(bankResult.length == 0) {
                        responses.invalidCredential(res, "Unable to update");
                    } else {
                        UserModel.setDefaultPayment({isPreferred : 1}, {id : bank_id})
                        .then((prefferedBankData) => {
                            if(prefferedBankData.length == 0) {
                                responses.invalidCredential(res, "Unable to set set default bank");
                            } else {
                                UserModel.editCard({isPreferred : 0}, {user_id})
                                .then((preffereCardRemove) => {
                                    if(preffereCardRemove.length == 0) {
                                        responses.invalidCredential(res, "Unable to remove isPreferred card");
                                    } else {
                                        UserModel.updateQuery({isAutoPayActive : 1}, {id : user_id})
                                            .then((updateAutoPay) => {
                                                if(updateAutoPay.length == 0) {
                                                    responses.invalidCredential(res, "Unable to avtive auto pay");
                                                } else {
                                                     responses.success(res, "bank successfully set as default for autopay");         
                                                }
                                            })
                                            .catch((error) => responses.sendError(error.message, res)); 
                                    }
                                })
                                 .catch((error) => responses.sendError(error.message, res)); 
                            }
                        })
                         .catch((error) => responses.sendError(error.message, res)); 
                    }
                })
                 .catch((error) => responses.sendError(error.message, res)); 

            }
        }
    }) 
    .catch((error) => responses.sendError(error.message, res));
}
