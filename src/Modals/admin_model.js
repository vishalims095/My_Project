import connection from '../Modules/connection.js';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import comfunc from '../Modules/commonFunction.js';
let LoginQuery = (values) => {
	return new Promise((resolve, reject) => {
	// let sql =  `SELECT * FROM user_tbl WHERE mobile_number ="${values.mobile_number}" OR email_id="${values.mobile_number}"`;
	let sql =  "SELECT * FROM `admin_tbl` WHERE mobile_number = ? OR email_id = ?";
		connection.query(sql, Object.values(values), (err, result) => {
			console.log(err);
			err ? reject(err) : resolve(result);
		});
	});
};

let updateQuery = (values, condition) => {
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

let getadmindata = (values) => {
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

let transectionData = () => {
	console.log("comming to admin model");
	return new Promise((resolve, reject) => {
		let sql = "select transection_id, amount, receiver_id from `payment_tbl` where status = 1 ";
		connection.query(sql,(err,result) => {
			if(err) {
				reject(err)
			} else {
				console.log(result);
				resolve(result);
			}
		})

	})
}
let gettransectiondata = () => {
	return new Promise((resolve, reject) => {
		let sql = "select transection_id, amount, sender_id from `payment_tbl` WHERE status = 1";
		connection.query(sql,(err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

export default {
	LoginQuery,
	updateQuery,
	getadmindata,
	updateQuery2,
	transectionData,
	gettransectiondata
}