import commFunc from '../Modules/commonFunction';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import UserModel from '../Modals/user_model';
import loyalityModel from '../Modals/loyalitycards_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";

import validator from 'validator';

exports.signup = (req, res) => {
    let {
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
        user_type,
        bank_name,
        account_name,
        account_number,
        account_type,
        iban_code,
        swift_code,
        routing_number,
        question1_id,
        question2_id,
        question1_answer,
        question2_answer
    } = req.body;
    let manKeys = ["email_id", "password", "country_code", "mobile_number", "first_name", "last_name", "device_token", "device_type", "latitude", "longitude", "location", "user_type", "bank_name", "account_name","account_number", "account_type", "iban_code", "swift_code", "routing_number", "question1_id", "question2_id", "question1_answer", "question2_answer"];
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
                                location,
                                user_type,
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
                                                    responses.success(res, _.merge(insert_sequrity_details, insert_bank_data, insertData))
                                                    let id = insertData.id;
                                                    console.log(id);
                                                    let walletdata = {user_id : id, amount : 5000 , left_amount : 5000 , added_on : "15/jan/2015", currency_type : "AED"};
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
                    } else if(userResult[0].is_varified === 0 ){
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
/*-------------------------------------------------------------------------------------------------------------------*/
                                                //Merchant Login



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






/*-------------------------------------------------------------------------------------------------------------------*/

/*----------------------------------------------------
                varifyotp
------------------------------------------------------*/

exports.verifyOtp = (req,res)=>{
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
            console.log(access_token);
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

exports.setpin = (req,res)=>{
    let {pin} = req.body;
    let {access_token} = req.headers;
    let manKeys = ["pin"];
   commFunc.checkKeyExist(req.body, manKeys)
        .then(result => {
        if(result.length){
            responses.parameterMissing(res, result[0])  
        }else{
                UserModel.LoginQuery({access_token})
                .then(userResult =>{
                 if(userResult.length == 0 ) {
                    responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    } else {
                  UserModel.updateQuery({is_pin_set:1,pin}, {access_token}).then((userResponse) => {
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
                    responses.authenticationErrorResponse(res);
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
                    //responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN)
                    responses.authenticationErrorResponse(res);
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
                    //responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
                    responses.authenticationErrorResponse(res);
                } else  {
                    console.log("================"+access_token);
                    let user_id = userResult[0].id;
                    UserModel.getSecurityDetails({user_id})
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
            responses.authenticationErrorResponse(res);
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
    let {mobile_number, email_id, key} = req.body;
    UserModel.LoginQuery2({mobile_number, email_id})
    .then((userResult) => {
        if(userResult.length == 0) {
            if(key == 1) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
            } else {
            responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
        }
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
        } else {
            if(varification_code != userResult[0].varification_code) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_VARIFICATION_CODE);
            }  else {
                responses.success(res, "OTP verified successfully");
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
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
            //responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
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
                    if(userResponse == 0) {
                        responses.success(res, 'User not exist');
                    }
                } else {
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
                   //responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN); 
                   responses.authenticationErrorResponse(res);
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


/*-------------------------------------------------------------------------------------------------------
                                            Search_user
--------------------------------------------------------------------------------------------------------*/

exports.searchUser = (req, res) => {
    let{mobile_number, email_id, first_name, userId} = req.body;
    UserModel.searchUserdata({email_id, mobile_number, first_name, id : userId})
    .then((userResult) =>{
        if(userResult == 0) {
            if(mobile_number) { 
                responses.invalidCredential(res, constant.responseMessages.INVALID_MOBILE_NUMBER);
            } else if (email_id) {
                responses.invalidCredential(res, constant.responseMessages.INVALID_EMAIL_ID);
            } else if(first_name){
                responses.invalidCredential(res, constant.responseMessages.INVALID_NAME);
            } else {
                 responses.invalidCredential(res, "Invalid user_id");
            }
        } else {
            responses.success(res, userResult, "User Data");
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


//-----------------------------Get wallet details---------------------------------------------

exports.getwalletdetails = (req, res) => {
    let {access_token} = req.headers;
    let {send_amount, reciver_currency_type} = req.body;
    let currency_Symbol = "د.إ";
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
           // responses.invalidCredential(res, constant.responseMessages.INVALID_ACCESS_TOKEN);
           responses.authenticationErrorResponse(res);
        } else {
            let user_id = userResult[0].id;
            UserModel.getwalletdetails({user_id})
            .then((walletdata) => {
                if(walletdata == 0) {
                    responses.invalidCredential(res,"Invalid user_id");
                } else {
                    responses.success(res, _.merge(req.body,walletdata[0],{currency_Symbol}));
                }
            }) 
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}


 /*--------------------------------------------------------------------------------------------------------------------------------------
                                                        Get_user_details
----------------------------------------------------------------------------------------------------------------------------------------*/

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



/*--------------------------------------------------------------------------------------------------------------------------------------
                                                        Add_card_details
---------------------------------------------------------------------------------------------------------------------------------------*/


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
                    responses.success(res,carddata[0], "card added successfully");
                }
            })

        }
    })
     .catch((error) => responses.sendError(error.message, res));
}


// /*-------------------------------------------------------------------------------------------------------------------------------------
//                                                         Get_summery_data
// --------------------------------------------------------------------------------------------------------------------------------------*/

// exports.getSummary = (req,res) => {
//    let {access_token} = req.headers;
//    let {receiver_user_id, amount, currency_type, key, service_charge, sgst} = req.body;
//    UserModel.selectQuery({access_token})
//    .then((userResult) =>{
//     if(userResult == 0) {
//         responses.authenticationErrorResponse(res);
//     } else {
//         let user_id = userResult[0].id;
//         console.log(user_id);
//         UserModel.getwalletdetails({user_id})
//         .then((walletdata) =>{
//             if(walletdata == 0 ) {
//                 console.log("no data")
//                 responses.invalidCredential(res,"no wallet found");
//             } else {
//                 console.log(walletdata);
//                 console.log(walletdata[0].left_amount);
//                 if((key == 1) && walletdata[0].left_amount > amount ){
//                     console.log("wallet amount is greater than send amount");
//                     let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     console.log(service_tax+gst);
//                     amount = amount+service_tax+gst;
//                     let total_amount = amount;
//                     let wallet_deduct_amount = total_amount;
//                     let transection_id = md5(new Date());
//                     let sender_id = userResult[0].id;
//                     let card_received_amount;
//                     let time = new Date();
//                     let wallet_id = walletdata[0].id;
//                      let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0 };
//                     UserModel.transectiondetails(insert_transection_details)
//                     .then ((transectiondata) =>{
//                         if(transectiondata == 0) {
//                             userResponse.invalidCredential(res, "Transection failed");
//                         } else {
//                             responses.success(res, _.merge(insert_transection_details,{service_tax,gst, total_amount,wallet_deduct_amount, card_received_amount:0}),"Transection successful");
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 } else if((key == 1) && walletdata[0].left_amount < amount) {
//                     console.log("send amount is greater");
//                     console.log(walletdata[0].left_amount);
//                     let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     amount = amount+service_tax+gst;
//                     let total_amount = amount;
//                     let less_amount = (amount - walletdata[0].left_amount);
//                     let wallet_deduct_amount = total_amount - less_amount;
//                     console.log("less_amount" + less_amount);
//                     let {card_id} = req.body;
//                     UserModel.getcarddetails({card_id})
//                     .then((carddata) => {
//                         if(carddata == 0) {
//                             responses.invalidCredential(res, "Invalid card");
//                         } else {
//                             let card_id = carddata[0].card_id;
//                             let card_number = carddata[0].card_number;
//                             console.log(card_number);
//                             let lastFOURDigits = card_number % 10000;
//                             console.log("lastdigit"+lastFOURDigits);
//                             let formatted_card_number = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
//                             console.log(formatted_card_number);
//                             console.log(card_id);
//                             let transection_id = md5(new Date());
//                             let sender_id = userResult[0].id;
//                             let time = new Date();
//                             let wallet_id = walletdata[0].id;
//                             let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0 }
//                             UserModel.transectiondetails(insert_transection_details)
//                             .then((transectiondata) =>{
//                                 if(transectiondata == 0) {
//                                     responses.invalidCredential(res,"Transection failed");
//                                 } else {
//                                     responses.success(res, _.merge(insert_transection_details,{service_tax,gst,total_amount,wallet_deduct_amount,formatted_card_number}),"Transection successful");
//                                 }
//                             })
//                             .catch((error) => responses.sendError(error.message, res));
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 } else {
//                           console.log("deduct from card");
//                     let {card_id} = req.body;
//                     UserModel.getcarddetails({card_id})
//                     .then((carddata)=>{
//                         if(carddata == 0) {
//                             responses.invalidCredential(res, "Invalid card")
//                         } else {
//                             let card_number = carddata[0].card_number;
//                             let lastFOURDigits = card_number%10000;
//                             console.log("lastdigit" + lastFOURDigits);
//                             let formatted_card_number = ("XXXX-XXXX-XXXX-" + lastFOURDigits);
//                             console.log(formatted_card_number);
//                              let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     amount = amount+service_tax+gst;
//                     let total_amount = amount;
//                     let transection_id = md5(new Date());
//                     let sender_id = userResult[0].id;
//                     let time = new Date();
//                     let wallet_deduct_amount;
//                     let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0}
//                     UserModel.transectiondetails(insert_transection_details)
//                     .then((transectiondata) => {
//                         if(transectiondata == 0) {
//                             responses.invalidCredential(res,"Transection failed");
//                         } else {
//                             responses.success(res,_.merge(insert_transection_details, {service_tax, gst, total_amount, wallet_deduct_amount :0, formatted_card_number}), "transection successful");
//                         }
//                     })
//                         }
//                     })
//                 }
//             }
//         })
//         .catch((error) => responses.sendError(error.message, res));
//     }
//    })
//    .catch((error) => responses.sendError(error.message, res)); 
// }
// // ---------------------------------------sendmoney--------------------------------------------------------------------------


// exports.SendMoney = (req,res) => {
//    let {access_token} = req.headers;
//    let {receiver_user_id, amount, currency_type, key, service_charge, sgst} = req.body;
//    UserModel.selectQuery({access_token})
//    .then((userResult) =>{
//     if(userResult == 0) {
//         responses.authenticationErrorResponse(res);
//     } else {
//         let user_id = userResult[0].id;
//         console.log(user_id);
//         UserModel.getwalletdetails({user_id})
//         .then((walletdata) =>{
//             if(walletdata == 0 ) {
//                 console.log("no data")
//                 responses.invalidCredential(res,"no wallet found");
//             } else {
//                 console.log(walletdata);
//                 console.log(walletdata[0].left_amount);
//                 if((key == 1) && walletdata[0].left_amount > amount ){
//                     console.log("wallet amount is greater than send amount");
//                     let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     console.log(service_tax+gst);
//                     amount = amount+service_tax+gst;
//                     let transection_id = md5(new Date());
//                     let sender_id = userResult[0].id;
//                     let time = new Date();
//                     let wallet_id = walletdata[0].id;
//                      let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 1 };
//                     UserModel.transectiondetails(insert_transection_details)
//                     .then ((transectiondata) =>{
//                         if(transectiondata == 0) {
//                             userResponse.invalidCredential(res, "Transection failed");
//                         } else {
//                             console.log("success");
//                             responses.success(res,transectiondata, "Transection successful");
//                             console.log(walletdata[0].left_amount);
//                             let left_amount = walletdata[0].left_amount - (amount);
//                             console.log(left_amount);
//                             UserModel.walletupdate({left_amount}, {user_id})
//                             .then((walletupdatedata)=>{
//                                 if(walletupdatedata == 0) {
//                                     responses.invalidCredential(res, "Wallet not updated");
//                                 } else {
//                                     console.log("wallet update successfully");
//                                 }
//                             })
//                             .catch((error) => responses.sendError(error.message, res));
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 } else if((key == 1) && walletdata[0].left_amount < amount) {
//                     console.log("send amount is greater");
//                     console.log(walletdata[0].left_amount);
//                     let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     amount = amount+service_tax+gst;
//                     let less_amount = (amount - walletdata[0].left_amount);
//                     console.log("less_amount" + less_amount);
//                     let {card_id} = req.body;
//                     UserModel.getcarddetails({card_id})
//                     .then((carddata) => {
//                         if(carddata == 0) {
//                             responses.invalidCredential(res, "Invalid card");
//                         } else {
//                             let card_id = carddata[0].card_id;
//                             console.log(card_id);
//                             let transection_id = md5(new Date());
//                             let sender_id = userResult[0].id;
//                             let time = new Date();
//                             let wallet_id = walletdata[0].id;
//                             let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 }
//                             UserModel.transectiondetails(insert_transection_details)
//                             .then((transectiondata) =>{
//                                 if(transectiondata == 0) {
//                                     responses.invalidCredential(res,"Transection failed");
//                                 } else {
//                                     UserModel.walletupdate({left_amount : 0}, {user_id})
//                                     .then((walletupdatedata) => {
//                                         if(walletupdatedata == 0) {
//                                             responses.invalidCredential(res, "wallet not updated");
//                                         } else {
//                                             responses.success(res, insert_transection_details, "wallet update");
//                                         }
//                                     })
//                                     .catch((error) => responses.sendError(error.message, res));
//                                 }
//                             })
//                             .catch((error) => responses.sendError(error.message, res));
//                         }
//                     })
//                     .catch((error) => responses.sendError(error.message, res));
//                 } else {
//                     console.log("deduct from card");
//                     let {card_id} = req.body;
//                      let service_tax = ((amount*service_charge)/100);
//                     let gst = ((amount*sgst)/100);
//                     amount = amount+service_tax+gst;
//                     let transection_id = md5(new Date());
//                     let sender_id = userResult[0].id;
//                     let time = new Date();
//                     let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1}
//                     UserModel.transectiondetails(insert_transection_details)
//                     .then((transectiondata) => {
//                         if(transectiondata == 0) {
//                             responses.invalidCredential(res,"Transection failed");
//                         } else {
//                             responses.success(res,insert_transection_details, "transection successful");
//                         }
//                     })
//                 }
//             }
//         })
//         .catch((error) => responses.sendError(error.message, res));
//     }
//    })
//    .catch((error) => responses.sendError(error.message, res)); 
// }



/*----------------------------------------------------------------------------------
                                sendMoney
-----------------------------------------------------------------------------------*/

exports.SendMoney = (req,res) => {
   let {access_token} = req.headers;
   let {receiver_user_id, amount, currency_type, key, transection_type, company_name, requestId} = req.body;
   let send_amount = amount;
   let service_charge = 10;
   let sgst = 5;
   UserModel.selectQuery({access_token})
   .then((userResult) =>{
    if(userResult == 0) {
        responses.authenticationErrorResponse(res);
    } else {
        if(transection_type == "utility") {
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
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_id = walletdata[0].id;
                    let insert_transection_details = {transection_id, sender_id, company_name, amount, time, currency_type, service_charge,sgst, wallet_id, status : 1, send_amount};
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
                                    console.log("wallet update successfully");
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
                            responses.invalidCredential(res, "Please add some amount");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1, send_amount }
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
                } else if((key == 1) && ((walletdata[0].left_amount < amount) || (walletdata[0].left_amount == amount))) {
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
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1, send_amount }
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
                    let time = Math.round((new Date()).getTime() / 1000);
                    let insert_transection_details = {transection_id, sender_id, company_name, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,insert_transection_details, "transection successful");
                            console.log(receiver_user_id);
                            console.log("wallet update successfully");
                        }
                    })
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    } else {
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
                    let time = Math.round((new Date()).getTime() / 1000);
                    let wallet_id = walletdata[0].id;
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 1, send_amount};
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
                                    console.log("wallet update successfully");
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
                                                    //for requestid delete
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
                            responses.invalidCredential(res, "Please add some amount");
                        } else {
                            let card_id = carddata[0].card_id;
                            console.log(card_id);
                            let transection_id = md5(new Date());
                            let sender_id = userResult[0].id;
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1, send_amount }
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
                                                            // for request id delete
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
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
                } else if((key == 1) && ((walletdata[0].left_amount < amount) || (walletdata[0].left_amount == amount))) {
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
                            let time = Math.round((new Date()).getTime() / 1000);
                            let wallet_id = walletdata[0].id;
                            let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status :1 , send_amount}
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
                                                                //for requestid delete
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
                    let time = Math.round((new Date()).getTime() / 1000);
                    let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, status :1, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,insert_transection_details, "transection successful");

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
                                                    //for requestid delete

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
   let {access_token} = req.headers;
   let {receiver_user_id, amount, currency_type,key, company_name, transection_type} = req.body;
   let send_amount = amount;
   let service_charge = 10;
   let sgst = 5;
   UserModel.selectQuery({access_token})
   .then((userResult) =>{
    if(userResult == 0) {
        responses.authenticationErrorResponse(res);
    } else {
        if(transection_type == "utility") {
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
                     let insert_transection_details = {transection_id, sender_id, company_name, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0, send_amount  };
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
                            responses.invalidCredential(res, "Insufficient amount in wallet please add some extra amount");
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
                            let insert_transection_details = {transection_id, sender_id, company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
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
                } else if((key == 1) && ((walletdata[0].left_amount < amount) || (walletdata[0].left_amount == amount))) {
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
                            responses.invalidCredential(res, "Insufficient amount in wallet please add some extra amount");
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
                            let insert_transection_details = {transection_id, sender_id, company_name,amount :(amount - less_amount), card_received_amount : less_amount, time, currency_type, service_charge, sgst, card_id, wallet_id, status: 0, send_amount }
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
                    let insert_transection_details = {transection_id, sender_id, company_name, amount : 0, card_received_amount : amount, time, currency_type,service_charge, sgst, card_id, wallet_id :0, send_amount}
                    UserModel.transectiondetails(insert_transection_details)
                    .then((transectiondata) => {
                        if(transectiondata == 0) {
                            responses.invalidCredential(res,"Transection failed");
                        } else {
                            responses.success(res,_.merge(insert_transection_details, {service_tax, gst, total_amount, wallet_deduct_amount :0, cardnumber}), "transection successful");
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

        } else {
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
                     let insert_transection_details = {transection_id, sender_id, receiver_id : receiver_user_id, amount, time, currency_type, service_charge,sgst, wallet_id, status : 0 , send_amount};
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
                            responses.invalidCredential(res, "Insufficient amount in wallet please add some extra amount");
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

                }
                } else if((key == 1) && ((walletdata[0].left_amount < amount) || (walletdata[0].left_amount == amount))) {
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
                            responses.invalidCredential(res, "Insufficient amount in wallet please add some extra amount");
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
                    .catch((error) => responses.sendError(error.message, res));
                        }
                    })
                    .catch((error) => responses.sendError(error.message, res));
                }
            }
        })
        .catch((error) => responses.sendError(error.message, res));
    }
    }
})
   .catch((error) => responses.sendError(error.message, res)); 
}



/*----------------------------------------------------------------------------------------------------------------------
                                                getRequestSummary
-----------------------------------------------------------------------------------------------------------------------*/


exports.getRequestSummary = (req,res) => {
   let {access_token} = req.headers;
   let {requestUserId, amount, currencyType} = req.body;
   UserModel.selectQuery({access_token})
   .then((userResult) => {
    if(userResult == 0) {
        responses.authenticationErrorResponse(res,"INVALID_ACCESS_TOKEN");
    } else {
        let userId = userResult[0].id;
        let name = userResult[0].first_name;
        let requestId = md5(new Date());
        let date = Math.round((new Date()).getTime() / 1000);
        let requestData = {requestId, userId, name, requestUserId, amount, currencyType, date};
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


/*-------------------------------------------------------------------------------------------------------------------------------
                                                addMerchantBankDetails
--------------------------------------------------------------------------------------------------------------------------------*/

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


/*-------------------------------------------------------------------------------------------------------------------
                                                    updateUserProfileImage
--------------------------------------------------------------------------------------------------------------------*/

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


/*-------------------------------------------------------------------------------------------------------------------
                                            deleteProfileImage
---------------------------------------------------------------------------------------------------------------------*/

exports.deleteProfileImage = (req,res) => {
    let {access_token} = req.headers;
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
                    EditProfile
--------------------------------------------------------------------------*/

exports.editProfile = (req, res) => {
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
                let updateData = {profile_image, location : address}
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
                let updateData = {location : address}
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
            console.log(updateData);
            console.log(req.body);
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


/*---------------------------------------------------------------------------------------------------------------------
                                                            merchantEditProfile
----------------------------------------------------------------------------------------------------------------------*/

exports.merchantEditProfile = (req, res) => {
    let {access_token} = req.headers;
    let {profile_image, first_name, businessRegNum, address} = req.body;
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
                let updateData = {profile_image, first_name, businessRegNum, address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {responses.success(res , userResponse)})
                .catch((error) => responses.sendError(error.message, res));
             } else {
                let updateData = {first_name, businessRegNum, address}
                UserModel.updateQuery(updateData,{access_token : access_token})
                .then((userResponse) => {responses.success(res , userResponse)})
                .catch((error) => responses.sendError(error.message, res));
             }      
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}



/*----------------------------------------------------------------------------------------------------------------------
                                                    merchantGetBankDetails
-----------------------------------------------------------------------------------------------------------------------*/

exports.merchantGetBankDetails = (req, res) => {
    let {access_token} = req.headers;
    let {id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) =>{
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else if (userResult[0].id != id) {
            responses.invalidCredential(res, "invalid user_id");
        } else {
            UserModel.getBankdetails({user_id : id})
            .then((bankdata) =>{
                if(bankdata == 0) {
                    responses.invalidCredential(res, "no bank data found");
                } else {
                    responses.success(res, bankdata);
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
            UserModel.getBankdetails({id : bank_id})
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
            UserModel.getBankdetails({id})
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
import connection from '../Modules/connection.js';
exports.generateBill = (req, res) => {
    let {access_token} = req.headers;
    let {customer_name, mobile_number, item_id} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            //console.log(item_id);
            for(let i = 0 ;i<item_id.length ; i++) 
                console.log(item_id);
                let sql = "select sum(item_price) as total_amount from `item_list` where `item_id` in (?)";
                connection.query(sql, [item_id],(err, result) => {
                    if(err) {
                        console.log(err);
                    } else {
                       let amount = Object.values(result[0])
                        let service_tax =  ((amount*10)/100);
                        console.log(service_tax);
                        let discount = ((amount*5)/100);
                        console.log(discount);

                        console.log(result[0]);
                        responses.success(res, _.merge(result[0],{service_tax, discount}));
                    }
                })
        }
    })
}


/*--------------------------------------------------------------------------------------------------------------------
                                            generateInvoice
---------------------------------------------------------------------------------------------------------------------*/
exports.generateInvoice = (req, res) => {
    let {access_token} = req.headers;
    let list_item = [];
    let {customer_name, mobile_number, item_id, total_amount} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "INVALID_ACCESS_TOKEN");
        } else {
            let merchant_id = userResult[0].id;
            let sql = "select `item_id`, `item_name`, `item_price` from item_list where `item_id` in (?) ";
            connection.query(sql, [item_id],(err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(result);
                    for(let i = 0 ;i < result.length ; i++) {
                    //console.log(Object.values(result[i]));
                    //console.log(list_item.push(Object.values(result[i])));
                    console.log(list_item.push(result[i]));
                    
                }  
                console.log(list_item);
                    let invoice_number = commFunc.generateRandomString();
                    console.log(invoice_number);
                    //let date = new Date();
                    let date = Math.round(new Date().getTime() / 1000);
                    let invoiceData = {invoice_number : invoice_number, merchant_id, customer_name, mobile_number, item_list : JSON.stringify(list_item), date : date, total_amount};
                    console.log(invoiceData);
                    //responses.success(res, invoiceData);
                    UserModel.invoiceDetails(invoiceData)
                    .then((invoiceresult) => {
                        if(invoiceresult == 0) {
                            responses.invalidCredential(res, "invoice not generated");
                        } else {
                            responses.success(res, invoiceresult[0], "invoice generated");
                        }
                    })
                }
            })
        }
    })
}

/*--------------------------------------------------------------
                        getAllInvoiceDetails
--------------------------------------------------------------*/

exports.getAllInvoiceDetails = (req, res) => {
    //let list = [];
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
                    let merchant_id = userResult[0].id;
                    console.log(merchant_id);
                     let sql = "select * from `invoice_tbl` WHERE `merchant_id` = ?";
                    connection.query(sql,[merchant_id],(err, result) =>{
                     if(err) {
                    console.log(err);
                    } else if(result == 0) {
                    responses.invalidCredential(res, "No data found");
                    } else {
                    let data = result.map(element=>_.merge(element,{item_list :JSON.parse(element.item_list)}))
                    responses.success(res,data);
                    }
            })
        }
    })
    .catch((error) => responses.sendError(error.message, res));
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
    let sql = "select * from `invoice_tbl` where `invoice_number` = ?";
    connection.query(sql, [invoice_number],(err, result) => {
        if(err) {
            console.log(err);
        } else if (result == 0) {
            responses.invalidCredential(res, "NO data found");
        } else {
            //let data = JSON.stringify(result[0].item_list);
            //console.log(data);
            console.log(result[0].item_list);
            let item_list = JSON.parse(result[0].item_list);
            console.log(item_list);
            let invoice_number = result[0].invoice_number;
            let total_amount = result[0].total_amount;
            let customer_name = result[0].customer_name;
            let mobile_number = result[0].mobile_number;
            responses.success(res, _.merge({item_list,invoice_number,customer_name,total_amount,mobile_number}));
            console.log(result);
        }
    })
}


/*-------------------------------------------------------------------------------------------------
                                    sendQrCode
--------------------------------------------------------------------------------------------------*/

// exports.sendQrCode = (req, res) => {
//     let {access_token} = req.headers;
//     let{user_id, receiver_id, qrCode} = req.body;
//     let listOfUsers = [];
//     UserModel.selectQuery({access_token})
//     .then((userResult) => {
//         if(userResult == 0) {
//             userResponsen.authenticationErrorResponse(res, "invalid access_token");
//         } else {
//             console.log(req.files.length);
//             if(req.files.length > 0) {
//             for(let i=0; i< req.files.length ;i++)
//                 qrCode = `/user/${req.files[i].filename}`;
//                 console.log(qrCode);
//                 for(let i =0; i<receiver_id.length ;i++) {
//                     console.log(receiver_id.length);
//                     let sql = "insert into `qrcodetbl` (receiver_id) values (?)";
//                     //var values = [[receiver_id]]
//                     connection.query(sql, [receiver_id[i]],(err, result) => {
//                         if(err){
//                             console.log(err);
//                         } else {
//                             console.log("your id is" + receiver_id[i]);
//                             console.log("your image is"+ qrCode);
//                             //responses.success(res, "image sent");
//                             let sql = "update `qrcodetbl` set qrCode = ?, user_id = ? where receiver_id = ?";
//                             connection.query(sql,[qrCode,user_id,receiver_id[i]],(err, result) => {
//                                 if(err) {
//                                     console.log(err);
//                                 } else {
//                                     //responses.success(res,qrCode);
//                                     console.log("success");
//                                     //responses.success(res, result[0]);
//                                 }
//                             })
//                         }
//                     })
//                 }
//             }

//         }
//     })

// }



exports.sendQrCode = (req, res) => {
    let {access_token} = req.headers;
    let{user_id, receiver_id, qrCode} = req.body;
    let listOfUsers = [];
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
                    console.log(receiver_id.length);
                    let sql = "insert into `qrcodetbl` (receiver_id, qrCode,user_id) values (?,?,?)";
                    connection.query(sql, [receiver_id[i],qrCode, user_id],(err, result) => {
                        if(err){
                            console.log(err);
                        } else {
                            console.log("QR code sent successfully");
                        }
                    })
                }
            }

        }
    })
}


/*---------------------------------------------------------------
                    getRequestDetails
----------------------------------------------------------------*/

exports.getNotificationList = (req, res) => {
    console.log("working");
    let {access_token} = req.headers;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "invalid access_token");
        } else {
            console.log(userResult[0].id);
            let requestUserId = userResult[0].id;
            let sql = "select requestId, userId, name, amount, date, type, currencyType from `userrequest` where requestUserId = ? ORDER by `date` DESC";
            connection.query(sql, [requestUserId], (err, result) => {
                if(err) {
                    console.log(err);
                } else if (result == 0) {
                    responses.success(res, result, "No data found");
                } else {
                    console.log(result);
                    responses.success(res, result, "Total requests");
                }
            })
        }
    })
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
            console.log(loyalityCardId);
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
            responses.invalidCredential(res, "Invalid loyality program details");
        } else {
            responses.success(res,loyalityProgram);
        }
    })
    .catch((error) => responses.sendError(error.message, res));
}