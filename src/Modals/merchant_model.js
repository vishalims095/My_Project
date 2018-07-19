import connection from '../Modules/connection.js';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import comfunc from '../Modules/commonFunction.js';
let insertQuery = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `tbl_merchant` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				// message.sendOtp
				// email.sendMail
				//comfunc.sendmail("hii","vishallsharma07@gmail.com")
				//comfunc.sendotp();
				let sql = "SELECT * FROM `tbl_merchant` WHERE id=?";
				connection.query(sql, [values.id], (err, result) => {
					let {password, ...output} = result[0];
					err ? reject(err) : resolve(output);
				});
			}
		});
	});
}

let selectQuery = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `tbl_merchant` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};

let selectQuery1 = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `security_questions_merchant_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};


let insertbankdetails = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql ="INSERT INTO `bank_details_merchant_tbl` set ?";
		connection.query(sql, [values], (err, result) => {
			if(err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `bank_details_merchant_tbl` WHERE user_id=?";
				connection.query(sql,[values.user_id], (err, result) => {
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
	// let sql =  `SELECT * FROM tbl_merchant WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM tbl_merchant WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};



let sequritydetailsinsert = (values) => {
console.log('---------------------------here we are -----------------------------------------------')
	return new Promise((resolve, reject) => {
		let sql = "insert INTO `security_questions_merchant_tbl` set ?";
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
		let sql = "SELECT * FROM `tbl_merchant` WHERE ?";
		connection.query(sql, [condition1], (err, result) => {
			err ? reject(err) : resolve(result);
		});
	});
};

let updateQuery = (values, condition) => {
	console.log(values);
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `tbl_merchant` SET ? WHERE  ?";
		connection.query(sql, [values, condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `tbl_merchant` WHERE ?";
				connection.query(sql, [condition], (err, result) => {
					let {password, ...output} = result[0];
					err ? reject(err) : resolve(output);
				});
			}
		});
	});
};

let updateUserData = (data, condition) =>{
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `tbl_merchant` set ? where ? ";
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
	// let sql =  `SELECT * FROM tbl_merchant WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM `admin_tbl` WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};

let updateQuery1 = (values, condition) => {
	return new Promise((resolve, reject) => {
		let sql = "UPDATE `admin_tbl` SET ? WHERE  ?";
		connection.query(sql, [values, condition], (err, result) => {
			if (err) {
				reject(err);
			} else {
				let sql = "SELECT * FROM `admin_tbl` WHERE ?";
				connection.query(sql, [condition], (err, result) => {
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
		let sql = "SELECT * FROM `security_questions_merchant_tbl` WHERE ?";
		connection.query(sql, [values], (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};


let searchUserdata = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "select * from `tbl_merchant` WHERE `email_id` = ? OR `mobile_number` = ? OR `first_name` = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			err ? reject(err) : resolve(result);
			console.log(result);
		});
	}) 
}

// let getAllUserData = (values) => {
// 	return new Promise((resolve, reject) => {
// 	var sql = "SELECT tbl_merchant.first_name , products.name AS favorite FROM users JOIN products ON users.favorite_product = products.id";
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
				resolve(result);
			}
		})
	})
}

export default {
	insertQuery,
	selectQuery,
	insertbankdetails,
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
	transectiondetails
	}