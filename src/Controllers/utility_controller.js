import commFunc from '../Modules/commonFunction';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import UserModel from '../Modals/user_model';
import UtilityModel from '../Modals/utility_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";
import currencySymbol from 'currency-symbol';
import getSymbolFromCurrency from 'currency-symbol-map'



/*------------------------------------------------------------------------------
							utilityDetailsInsert
------------------------------------------------------------------------------*/

exports.payUtilityBill = (req, res) => {
	let {access_token} = req.headers;
	let {customer_id, company_name, amount, utility_type, state, apartment, building_name, apartment_number, country_code, mobile_number} = req.body;
	UserModel.selectQuery({access_token})
	.then((userResult) => {
		if(userResult == 0) {
			responses.authenticationErrorResponse(res, "Invalid access_token");
		} else {
            if(utility_type == 1 || utility_type == 4 || utility_type == 5 || utility_type == 6 || utility_type == 7 || utility_type ==8) {
            let manKeys = ["customer_id", "company_name", "amount"];
            commFunc.checkKeyExist(req.body, manKeys)
            .then(function(result) {
                if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
                } else {
                    console.log("utility 1 4 5 6 7 8 calling");    
                    let id = md5(new Date());
                    let user_id = userResult[0].id;
                    let utility_data = { id , user_id, customer_id : customer_id, company_name, amount, utility_type}
                    UtilityModel.insertUtilityQuery(utility_data)
                    .then((utilityInsertData) => {
                        if(utilityInsertData == 0) {
                            res.invalidCredential(res, "Utility details not inserted");
                        } else {
                            responses.success(res, utilityInsertData[0]);
                        }
                    })
                    .catch(error =>responses.sendError(error.message, res));
                }
            })
            .catch(error =>responses.sendError(error.message, res));
    		} else if(utility_type == 2) {
                let manKeys = ["state","customer_id", "company_name", "amount"];
                commFunc.checkKeyExist(req.body, manKeys)
                .then(function(result) {
                    if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
                } else {
                    console.log("utility 2 calling");
                    let id = md5(new Date());
                    let user_id = userResult[0].id;
                    let utility_data = { id, state, user_id, customer_id : customer_id, company_name, amount, utility_type}
                    UtilityModel.insertUtilityQuery(utility_data)
                    .then((utilityInsertData) => {
                        if(utilityInsertData == 0) {
                            res.invalidCredential(res, "Utility details not inserted");
                        } else {
                            responses.success(res, utilityInsertData[0]);
                        }
                    })
                     .catch(error =>responses.sendError(error.message, res));
                    }
                })
                .catch(error =>responses.sendError(error.message, res));
             } else if(utility_type == 3) {
                 let manKeys = ["state", "apartment", "building_name", "apartment_number","customer_id", "company_name", "amount"];
                commFunc.checkKeyExist(req.body, manKeys)
                .then(function(result) {
                    if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
                } else {
                    console.log("utility 3 calling");
                    let id = md5(new Date());
                    let user_id = userResult[0].id;
                    let utility_data = { id, state, apartment, building_name, apartment_number,  user_id, customer_id : customer_id, company_name, amount, utility_type}
                    UtilityModel.insertUtilityQuery(utility_data)
                    .then((utilityInsertData) => {
                        if(utilityInsertData == 0) {
                            res.invalidCredential(res, "Utility details not inserted");
                        } else {
                            responses.success(res, utilityInsertData[0]);
                        }
                    })
                     .catch(error =>responses.sendError(error.message, res));    
                }
                })
                 .catch(error =>responses.sendError(error.message, res));       
             } else if(utility_type == 9 || utility_type == 10) {
                let manKeys = ["country_code", "mobile_number","company_name", "amount"];
                commFunc.checkKeyExist(req.body, manKeys)
                .then(function(result) {
                    if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
                } else {
                     console.log("utility 9   10 calling");
                    let id = md5(new Date());
                    let user_id = userResult[0].id;
                    let utility_data = { id , country_code, mobile_number, company_name, amount, utility_type}
                    UtilityModel.insertUtilityQuery(utility_data)
                    .then((utilityInsertData) => {
                        if(utilityInsertData == 0) {
                            res.invalidCredential(res, "Utility details not inserted");
                        } else {
                            responses.success(res, utilityInsertData[0]);
                        }
                    })
                     .catch(error =>responses.sendError(error.message, res));
                }
                })
                .catch(error =>responses.sendError(error.message, res));
             } else {
                responses.invalidCredential(res, "Invalid utility_type");
             }
        }
	})
    .catch(error =>responses.sendError(error.message, res));

}

/*-----------------------------------------------------------------------------
                            payElectricityMeterBill
------------------------------------------------------------------------------*/

exports.payElectricityMeterBill = (req, res) => {
    let {access_token} = req.headers;
    let {state, receiver_user_id, company_name, amount, utility_type} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            let id = md5(new Date());
            let user_id = userResult[0].id;
            let utility_data = { id, state, user_id, customer_id : receiver_user_id, company_name, amount, utility_type}
            UtilityModel.insertUtilityQuery(utility_data)
            .then((utilityInsertData) => {
                if(utilityInsertData == 0) {
                    res.invalidCredential(res, "Utility details not inserted");
                } else {
                    responses.success(res, utilityInsertData[0]);
                }
            })
             .catch(error =>responses.sendError(error.message, res));
        }
    })
     .catch(error =>responses.sendError(error.message, res));
}

/*-----------------------------------------------------------------------------
                            payElectricityApartmentBill
------------------------------------------------------------------------------*/

exports.payElectricityApartmentBill = (req, res) => {
    let {access_token} = req.headers;
    let {state, apartment, building_name, apartment_number, receiver_user_id, company_name, amount, utility_type} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            let id = md5(new Date());
            let user_id = userResult[0].id;
            let utility_data = { id, state, apartment, building_name, apartment_number,  user_id, customer_id : receiver_user_id, company_name, amount, utility_type}
            UtilityModel.insertUtilityQuery(utility_data)
            .then((utilityInsertData) => {
                if(utilityInsertData == 0) {
                    res.invalidCredential(res, "Utility details not inserted");
                } else {
                    responses.success(res, utilityInsertData[0]);
                }
            })
             .catch(error =>responses.sendError(error.message, res));
        }
    })
     .catch(error =>responses.sendError(error.message, res));
}


/*------------------------------------------------------------------------------
                             payMobileBill
------------------------------------------------------------------------------*/

exports.payMobileBill = (req, res) => {
    let {access_token} = req.headers;
    let {country_code, mobile_number, company_name, amount, utility_type} = req.body;
    UserModel.selectQuery({access_token})
    .then((userResult) => {
        if(userResult == 0) {
            responses.authenticationErrorResponse(res, "Invalid access_token");
        } else {
            let id = md5(new Date());
            let user_id = userResult[0].id;
            let utility_data = { id , user_id, country_code, mobile_number, company_name, amount, utility_type}
            UtilityModel.insertUtilityQuery(utility_data)
            .then((utilityInsertData) => {
                if(utilityInsertData == 0) {
                    res.invalidCredential(res, "Utility details not inserted");
                } else {
                    responses.success(res, utilityInsertData[0]);
                }
            })
             .catch(error =>responses.sendError(error.message, res));
        }
    })
     .catch(error =>responses.sendError(error.message, res));
}
