import connection from '../Modules/connection.js';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import comfunc from '../Modules/commonFunction.js';
let insertQuery = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `user_tbl` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				// message.sendOtp
				// email.sendMail
				//comfunc.sendmail("hii","vishallsharma07@gmail.com")
				//comfunc.sendotp();
				let sql = "SELECT * FROM `user_tbl` WHERE id=?";
				connection.query(sql, [values.id], (err, result) => {
					let {password, ...output} = result[0];
					err ? reject(err) : resolve(output);
				});
			}
		});
	});
}

let selectQuery = (values) => {
	//console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `user_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};

let selectQuery1 = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `security_questions_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};


let insertbankdetails = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql ="INSERT INTO `bank_details_tbl` set ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `bank_details_tbl` WHERE id =?";
				connection.query(sql,[values.id], (err, result) => {
					if(err) {
						reject(err);
					} else {
						console.log(result[0].id);
						resolve(result);
					}
				});
			}
		})
	})
}

let sendOtp = (values) => {
	console.log(values);
	comfunc.sendotp(values);

}

let LoginQuery1 = (values) => {
	return new Promise((resolve, reject) => {
	// let sql =  `SELECT * FROM user_tbl WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM user_tbl WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};

//new login apr/4
import _ from "lodash";
let LoginQuery5 = (values) => {
	return new Promise((resolve, reject) => {
	// let sql =  `SELECT * FROM user_tbl WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM user_tbl WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			if (err) {
				reject(err);
			} else {
				let user_id = result[0].id;
				let sql = "select * from bank_details_tbl WHERE user_id = ?";
				connection.query(sql,[user_id],(err, bankresult) => {
					if(err) {
						reject(err);
					} else  {
						// console.log(result);
						// resolve(_.merge(result[0],bankresult[0]));
						let sql = "select * from security_questions_tbl where user_id = ?";
						connection.query(sql, [user_id], (err, securityresult) => {
							if(err) {
								reject(err);
							} else {
								console.log(result[0]);
								console.log(bankresult[0]);
								console.log(securityresult[0]);
								resolve(_.merge(result[0],bankresult[0],securityresult[0]));
							}
						})
					}
				})			
			}
		});
	});
};


let sequritydetailsinsert = (values) => {
console.log('---------------------------here we are -----------------------------------------------')
	return new Promise((resolve, reject) => {
		let sql = "insert INTO `security_questions_tbl` set ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
					resolve(result);
			}
		}) 
	})
}


let LoginQuery = (condition1) => {
	return new Promise((resolve, reject) => {
		console.log(condition1 )
		let sql = "SELECT * FROM `user_tbl` WHERE ?";
		connection.query(sql, [condition1], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};

let updateQuery = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `user_tbl` SET ? WHERE  ?";
		connection.query(sql, [values, condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `user_tbl` WHERE ?";
				connection.query(sql, [condition], (err, result) => {
					let {password, ...output} = result[0];
					err ? reject(err) : resolve(output);
				});
			}
		});
	});
};

let updateQuery2 = (condition, values) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `user_tbl` SET ? WHERE  ?";
		connection.query(sql, [values,condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `user_tbl` WHERE ?";
				connection.query(sql, [condition], (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			}
		});
	});
};

let updateUserData = (data, condition) =>{
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `user_tbl` set ? where ? ";
		connection.query(sql, [data, condition], (err, result) => {
			if(err) {
				reject(err);
			} else {
				console.log(result);
				resolve(result);
			}
		})
	})
}

let LoginQuery2 = (values) => {
	return new Promise((resolve, reject) => {
	// let sql =  `SELECT * FROM user_tbl WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM `admin_tbl` WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};

let updateQuery1 = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `admin_tbl` SET ? WHERE  ?";
		connection.query(sql, [values, condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `admin_tbl` WHERE ?";
				connection.query(sql, [condition], (err, result) => {
					console.log(result);
					let {password, ...output} = result[0];
					err ? reject(err) : resolve(output);
				});
			}
		});
	});
};

let getSecurityDetails = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `security_questions_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};


let searchUserdata = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "select * from `user_tbl` WHERE `email_id` = ? OR `mobile_number` = ? OR `first_name` = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			err ? reject(err) : resolve(result);
			//console.log(result);
		});
	}) 
}

// let getAllUserData = (values) => {
// 	return new Promise((resolve, reject) => {
// 	var sql = "SELECT user_tbl.first_name , products.name AS favorite FROM users JOIN products ON users.favorite_product = products.id";
// 	})
// }

let transectiondetails = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "insert into `payment_tbl` set ?";
		connection.query(sql,[values],(err, result) => {
			if(err) {
				reject(err);
			} else {
				//resolve(result);
					let sql = "SELECT * FROM `payment_tbl` WHERE transection_id=?";
				connection.query(sql,[values.transection_id], (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			}
		})
	})
}
let getbankdetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `bank_details_tbl` where ?";
		connection.query(sql,[values],(err, result) =>{
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let insertwalletdetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "insert into `wallet` set ?";
		connection.query(sql, [values] , (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getwalletdetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `wallet` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};


let walletupdate = (values, condition) => {
	return new Promise((resolve, reject) => {
		console.log(values);
		console.log(condition);
		let sql = "UPDATE `wallet` SET ? WHERE  ?";
		connection.query(sql, [values, condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
};

let getcarddetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `card_details_tbl` WHERE ? and prefrence = 1";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
}
let addcarddetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql ="INSERT INTO `card_details_tbl` set ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				// let sql = "SELECT * FROM `card_details_tbl` WHERE user_id=?";
				// connection.query(sql,[values.user_id], (err, result) => {
				// 	if(err) {
				// 		reject(err);
				// 	} else {
				// 		console.log(result[0].id);
				// 		resolve(result);
				// 	}
				// });
				resolve(result);
			}
		})
	})	
}

let requestDetails = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "insert into `userrequest` set ?";
		connection.query(sql,[values],(err, result) => {
			if(err) {
				reject(err);
			} else {
				//resolve(result);
					let sql = "SELECT * FROM `userrequest` WHERE requestId=?";
				connection.query(sql,[values.requestId], (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			}
		})
	})
}

let getRequestDetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `userrequest` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let requestDetailsUpdate = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "update `userrequest` set ? WHERE ?";
		connection.query(sql,[values, condition],(err, result) => {
			if(err) {
				reject(err);
			} else {
				//resolve(result);

					let sql = "SELECT * FROM `userrequest` WHERE requestId=?";
				connection.query(sql,[condition.requestId], (err, result) => {
					if(err) {
						reject(err);
					} else {
						console.log(result);
						resolve(result);
					}
				});
			}
		})
	})
}


let getadmindata = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "select * from `admin_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getuserdata = () => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `user_tbl`";
		connection.query(sql,(err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getuserBarCode = () => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `user_tbl` WHERE user_type = 0";
		connection.query(sql,(err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getmerchantBarCode = () => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `user_tbl` WHERE user_type = 1";
		connection.query(sql,(err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}


let getBankDetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `bank_details_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result)
			}
		})
	})
}

let updateBankDetails = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `bank_details_tbl` set ? WHERE ?";
		connection.query(sql, [values, condition], (err, result) => {
			if(err) {
				reject(err)
			} else {
				let sql = "select * from `bank_details_tbl` WHERE id = ?";
				connection.query(sql,[values.id], (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				})
			}
		})
	})
}

let itemlist = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `item_list` where ?";
		connection.query(sql, [values], (err, result) => {
			if(err) { 
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getitemlist = () => {
		return new Promise((resolve, reject) => {
		let sql = "select * from `item_list`";
		connection.query(sql, (err, result) => {
			if(err) { 
				reject(err);
			} else {
				resolve(result);
			}
		})
	})	
}

let invoiceDetails = (values) => {
	//console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "insert into `invoice_tbl` set ?";
		connection.query(sql,[values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				let sql = "select * from `invoice_tbl` where invoice_number = ?";
				connection.query(sql , [values.invoice_number], (err,result) =>{
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				})

			}
		})
	})
}
let deleteBankDetails = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "Delete from bank_details_tbl where ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let paymentData = (condition) => {
	return new Promise ((resolve, reject) => {
		let sql = "select * from `payment_tbl` WHERE ?";
		connection.query(sql, [condition], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let paymentData1 = (condition) => {
	return new Promise ((resolve, reject) => {
		let sql = "select * from `payment_tbl` WHERE receiver_id = ? OR sender_id = ?";
		connection.query(sql, Object.values(condition), (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}


let paymentData2 = (condition) => {
	return new Promise ((resolve, reject) => {
		let sql = "select * from `payment_tbl` WHERE receiver_id = ? OR sender_id = ?";
		connection.query(sql, Object.values(condition), (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let searchinvoice = (values) => {
	return new Promise((resolve, reject) => { 
		let sql = `
				SELECT 
					date_format(curdate(), '%Y') year,
					CONCAT(date_format(FROM_UNIXTIME(date), '%M') , ' ', date_format(curdate(), '%Y')) display_header, 
					date_format(FROM_UNIXTIME(date), '%M') month_name,
					date_format(FROM_UNIXTIME(date), '%a') date_name,
					date_format(FROM_UNIXTIME(date), '%d') date,
					month(FROM_UNIXTIME(date)) month,
					invoice_number,customer_name,contact_details, date, actual_cost

				FROM invoice_tbl 
				WHERE  merchant_id = ? AND customer_name LIKE CONCAT('%', ? ,'%')
				ORDER BY FROM_UNIXTIME(date) ASC
				`;
		connection.query(sql, Object.values(values), (err, result) => {
			err ? reject(err) : resolve(result);//console.log(result)
		});
	});
};

let getinvoicelist = (values) => {
	return new Promise((resolve, reject) => { 
		let sql = `
				SELECT 
					date_format(curdate(), '%Y') year,
					CONCAT(date_format(FROM_UNIXTIME(date), '%M') , ' ', date_format(curdate(), '%Y')) display_header, 
					date_format(FROM_UNIXTIME(date), '%M') month_name,
					date_format(FROM_UNIXTIME(date), '%a') date_name,
					date_format(FROM_UNIXTIME(date), '%d') date,
					month(FROM_UNIXTIME(date)) month,
					invoice_number,customer_name,contact_details, date, actual_cost

				FROM invoice_tbl 
				WHERE  ?
				ORDER BY FROM_UNIXTIME(date) ASC
				`;
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);//console.log(result)
		});
	});
};

let getinvoicelistnewtoold = (values) => {
	return new Promise((resolve, reject) => { 
		let sql = `
				SELECT 
					date_format(curdate(), '%Y') year,
					CONCAT(date_format(FROM_UNIXTIME(date), '%M') , ' ', date_format(curdate(), '%Y')) display_header, 
					date_format(FROM_UNIXTIME(date), '%M') month_name,
					date_format(FROM_UNIXTIME(date), '%a') date_name,
					date_format(FROM_UNIXTIME(date), '%d') date,
					month(FROM_UNIXTIME(date)) month,
					invoice_number,customer_name,contact_details, date, actual_cost

				FROM invoice_tbl 
				WHERE  ?
				ORDER BY FROM_UNIXTIME(date) DESC
				`;
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);//console.log(result)
		});
	});
};


let getinvoicelistlowamount = (values) => {
	return new Promise((resolve, reject) => { 
		let sql = `
				SELECT 
					date_format(curdate(), '%Y') year,
					CONCAT(date_format(FROM_UNIXTIME(date), '%M') , ' ', date_format(curdate(), '%Y')) display_header, 
					date_format(FROM_UNIXTIME(date), '%M') month_name,
					date_format(FROM_UNIXTIME(date), '%a') date_name,
					date_format(FROM_UNIXTIME(date), '%d') date,
					month(FROM_UNIXTIME(date)) month,
					invoice_number,customer_name,contact_details, date, actual_cost

				FROM invoice_tbl 
				WHERE  ?
				ORDER BY actual_cost ASC
				`;
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);//console.log(result)
		});
	});
};

let getinvoicelisthighamount = (values) => {
	return new Promise((resolve, reject) => { 
		let sql = `
				SELECT 
					date_format(curdate(), '%Y') year,
					CONCAT(date_format(FROM_UNIXTIME(date), '%M') , ' ', date_format(curdate(), '%Y')) display_header, 
					date_format(FROM_UNIXTIME(date), '%M') month_name,
					date_format(FROM_UNIXTIME(date), '%a') date_name,
					date_format(FROM_UNIXTIME(date), '%d') date,
					month(FROM_UNIXTIME(date)) month,
					invoice_number,customer_name,contact_details, date, actual_cost

				FROM invoice_tbl 
				WHERE  ?
				ORDER BY actual_cost DESC
				`;
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);//console.log(result)
		});
	});
};

let getinvoicedata = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "select * from `invoice_tbl` WHERE ? ";
		connection.query(sql,[values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result)
			}
		})
	})
}

let editCard = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "update `card_details_tbl` set ? where ?";
		connection.query(sql,[values, condition],(err,result) =>{
			if(err) {
				reject(err);
			} else {
				let sql = "select * from `card_details_tbl` where ?";
				connection.query(sql, [condition],(err, result) => {
					if(err) {
						reject(err)
					} else {
						resolve(result);
					}
				})
			}
		})
	})
}

let deletecarddetails = (values) => {
	return new Promise((resolve, result) => {
		let sql = "Delete from `card_details_tbl` where ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let addutility = (values) => {
	return new Promise ((resolve, reject) =>{
		let sql = "insert into `utilityList_tbl` set ?";
		connection.query(sql, [values],(err, result) =>{
			if(err) {
				reject(err)
			} else {
				resolve(result);
			}
		})
	})
}

let setDefaultPayment = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `bank_details_tbl` set ? WHERE ?";
		connection.query(sql, [values, condition], (err, result) => {
			if(err) {
				reject(err)
			} else {
				resolve(result);
			}
		})
	})
}

export default {
	setDefaultPayment,
	addutility,
	searchinvoice,
	getinvoicedata,
	getinvoicelisthighamount,
	getinvoicelistlowamount,
	getinvoicelistnewtoold,
	getinvoicelist,
	paymentData,
	paymentData1,
	paymentData2,
	invoiceDetails,
	insertwalletdetails,
	getitemlist,
	itemlist,
	updateBankDetails,
	getBankDetails,
	updateQuery2,
	requestDetailsUpdate,
	getuserdata,
	getuserBarCode,
	getmerchantBarCode,
	insertQuery,
	selectQuery,
	insertbankdetails,
	deleteBankDetails,
	sequritydetailsinsert,
	LoginQuery,
	updateQuery,
	sendOtp,
	updateUserData,
	LoginQuery1,
	selectQuery1,
	LoginQuery2,
	updateQuery1,
	getSecurityDetails,
	searchUserdata,
	transectiondetails,
	LoginQuery5,
	getwalletdetails,
	walletupdate,
	getcarddetails,
	addcarddetails,
	requestDetails,
	getRequestDetails,
	getadmindata,
	editCard,
	deletecarddetails
	}