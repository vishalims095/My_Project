import user from '../Controllers/user_controller';
import utility from '../Controllers/utility_controller';
import auth from '../Modules/auth';
import multer from 'multer';
import md5 from 'md5';
import express from 'express'
import path from 'path';

exports.getRouter = (app) => {
app.route("/utility/payUtilityBill").post(utility.payUtilityBill);
//app.route("/utility/payElectricityMeterBill").post(utility.payElectricityMeterBill);
//app.route("/utility/payElectricityApartmentBill").post(utility.payElectricityApartmentBill);
//app.route("/utility/payMobileBill").post(utility.payMobileBill);	
}