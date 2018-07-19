import commFunc from '../Modules/commonFunction';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import MerchantModel from '../Modals/merchant_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";
exports.signup = (req, res) => {
    let { email_id, password, country_code, mobile_number, first_name, last_name, device_token, device_type, latitude, longitude, location, bank_name, account_name, iban_code, swift_code, routing_number, question1_id, question2_id, question1_answer, question2_answer } = req.body;
    let manKeys = ["email_id", "password", "country_code", "mobile_number", "first_name", "last_name", "device_token", "device_type", "latitude", "longitude", "location", "bank_name", "account_name", "iban_code", "swift_code", "routing_number", "question1_id", "question2_id", "question1_answer", "question2_answer"];
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
                MerchantModel.selectQuery({mobile_number})
                    .then(userResult => userResult.length > 0 ? null : userResult)
                    .then(userResult => {
                        if (userResult) {
                             MerchantModel.selectQuery({email_id})
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
                                location,
                                created_on,
                                is_varified:0
                            };
                            MerchantModel.insertQuery(insertData)
                                .then((userResponse) => {
                                    let id = md5(commFunc.generateRandomString());
                                    let user_id = userResponse.id;
                                    let insert_bank_data = {
                                        id,
                                        user_id,
                                        bank_name,
                                        account_name,
                                        iban_code,
                                        swift_code,
                                        routing_number
                                    };
                                    MerchantModel.insertbankdetails(insert_bank_data)
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
                                            MerchantModel.sequritydetailsinsert(insert_sequrity_details)
                                                .then((securityResult) => {
                                                    commFunc.sendmail(varification_code,email_id);
                                                    commFunc.sendotp(varification_code);
                                                    responses.success(res, _.merge(insert_sequrity_details, insert_bank_data, insertData))
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
            MerchantModel.LoginQuery1({mobile_number, email_id})
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
                    } else if(userResult[0].is_varified === 0 ){
                          responses.success(res, userResult[0],'please varify otp')
                           // responses.varifyotp(res);
                          //lresponses.invalidCredential(res, constant.responseMessages.PLEASE_VERIFY_OTP)

                    } else {
                    mobile_number=userResult[0].mobile_number;
                    MerchantModel.updateQuery(updateData, {mobile_number}).then((userResponse) => {
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
                MerchantModel.LoginQuery({access_token})
                .then(userResult => {
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else if (userResult[0].varification_code != varification_code){
                        responses.invalidCredential(res, "invalid verification code")
                    } else {
                  MerchantModel.updateQuery({is_varified:1}, {access_token}).then((userResponse) => {
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
                MerchantModel.LoginQuery({access_token})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else {
                  MerchantModel.updateQuery({is_pin_set:1,pin}, {access_token}).then((userResponse) => {
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
            MerchantModel.LoginQuery({access_token})
            .then(userResult => {
                if(userResult == 0) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
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
    MerchantModel.LoginQuery1({mobile_number, email_id})
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
            MerchantModel.updateQuery({varification_code : varification_code},{mobile_number})
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
                MerchantModel.LoginQuery({access_token})
                .then(userResult => {
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else if (userResult[0].varification_code != varification_code){
                        responses.invalidCredential(res, "invalid verification code")
                    } else {
                        let {password} = req.body;
                         password = md5(password);
                        MerchantModel.updateQuery({password : password}, {access_token}).then((userResponse) => {
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
            MerchantModel.selectQuery({access_token})
            .then(userResult => {
                if(userResult.length == 0) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
                } else  {
                    console.log("================"+access_token);
                    let user_id = userResult[0].id;
                    MerchantModel.selectQuery1({user_id})
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
                        MerchantModel.updateQuery({password : password}, {access_token}).then((userResponse) => {
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
    MerchantModel.LoginQuery({access_token})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
        } else {
            let mobile_number = userResult[0].mobile_number;
            console.log(mobile_number);
            MerchantModel.updateQuery({access_token :" "} , {mobile_number})
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
            MerchantModel.LoginQuery2({mobile_number, email_id})
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
                    MerchantModel.updateQuery1(updateData, {mobile_number}).then((userResponse) => {
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
    MerchantModel.LoginQuery2({mobile_number, email_id})
    .then((userResult) => {
        if(userResult.length == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
        } else {
            let varification_code = commFunc.generateRandomString();
            console.log(varification_code);
            mobile_number = userResult[0].mobile_number;
            MerchantModel.updateQuery1({varification_code : varification_code},{mobile_number})
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


exports.checkmerchantExists = (req, res) => {
  let {mobile_number, email_id} = req.body;
    MerchantModel.LoginQuery1({mobile_number, email_id})
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
    let {mobile_number, email_id} = req.body;
    MerchantModel.LoginQuery1({mobile_number, email_id})
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
            MerchantModel.updateQuery({varification_code : varification_code},{mobile_number})
            .then((userResponse) => {
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
    MerchantModel.LoginQuery1({mobile_number, email_id})
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
    MerchantModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
            if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            mobile_number = userResult[0].mobile_number;
            MerchantModel.updateQuery({password}, {mobile_number})
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
    MerchantModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            let user_id = userResult[0].id;
            MerchantModel.getSecurityDetails({user_id})
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
    MerchantModel.LoginQuery1({mobile_number, email_id})
    .then((userResult) =>{
        if(userResult.length == 0) {
             if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID)
            } else {
                 responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER)
            }
        } else {
            let user_id = userResult[0].id;
            MerchantModel.getSecurityDetails({user_id})
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


exports.isValidmerchant = (req, res) => {
    let{mobile_number, email_id} = req.body;
    MerchantModel.selectQuery({mobile_number})
    .then((userResult) => {
        if(userResult == 0){
            MerchantModel.selectQuery({email_id})
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

exports.searchmerchant = (req, res) => {
    let{mobile_number, email_id, first_name} = req.body;
    MerchantModel.searchUserdata({email_id, mobile_number, first_name})
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
            responses.success(res, userResult, "User Data");
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}

/*--------------------------------------------------------------------------------------------------------
                                            Change_mobilenumber
---------------------------------------------------------------------------------------------------------*/

exports.ChangeMobileNumber = (req,res) => {
    let {mobile_number, new_mobile_number} = req.body;
    let manKeys = ["mobile_number","new_mobile_number"]
    commFunc.checkKeyExist(req.body, manKeys)
    .then(function(result){
        if(result.length >0){
            responses.parameterMissing(res, result[0]);
        } else {
            MerchantModel.selectQuery({mobile_number})
            .then((userResult) => {
                if(userResult == 0) {
                   responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER); 
               } else {
                 mobile_number = userResult[0].mobile_number;
                MerchantModel.updateUserData({mobile_number : new_mobile_number} , {mobile_number})
                .then((userResponse) => {
                    responses.success(res ,'Mobile number successfully update');
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

exports.SendMoney = (req, res) => {
    let {access_token} = req.headers;
    let {mobile_number, email_id} = req.body;
    MerchantModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
        } else {
            MerchantModel.LoginQuery1({mobile_number, email_id})
            .then((userResponse) => {
                if(userResponse == 0) {
                    if(mobile_number) {
                        responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
                    } else {
                        responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
                    }
                } else {
                    let user_id1 = userResult[0].id;
                    let user_id2 = userResponse[0].id;
                    let transection_id = md5(new Date());
                    let time = new Date();
                    let {amount} = req.body;
                    let insert_transection_details = {transection_id, sender_id : user_id1, receiver_id : user_id2, amount,time};
                    MerchantModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            console.log("transection failed")
                        } else {
                            responses.success(res, "Transection successful");
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