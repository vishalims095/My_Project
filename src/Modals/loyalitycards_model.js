import connection from '../Modules/connection.js';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import comfunc from '../Modules/commonFunction.js';

let insertQuery = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `loyalityorogram_tbl` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				resolve(result);
			}
		});
	});
}

let insertloyalitycardQuery = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `loyalitycard_tbl` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				let sql = "SELECT * FROM `loyalitycard_tbl` WHERE loyalityCardId = ?";
				connection.query(sql, [values.loyalityCardId], (err, result) => {
					if(err) {
						reject(err)
					} else {
						resolve(result);
					}
				})
			}
		});
	});
}

let getLoyalityPrograms = () => {
	return new Promise((resolve, reject) => {
		let sql = "select * from `loyalityorogram_tbl`";
		connection.query(sql, (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getLoyalityProgramsDetails = (condition) => {
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "select * from `loyalityorogram_tbl` where ?";
		connection.query(sql,[condition], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let getLoyalityCardList = (condition) => {
	console.log(condition);
	return new Promise((resolve, reject) => {
		let sql = "select * from `loyalitycard_tbl` where ?";
		connection.query(sql,[condition], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let updateLoyalityCardDetails = (values, condition) => {
	return new Promise ((resolve, reject) => {
		let sql = "Update `loyalitycard_tbl` set ? WHERE ?";
		connection.query(sql,[values,condition],(err, result) => {
			if(err) {
				reject(err);
			} else {
				let sql = "select * from `loyalitycard_tbl` where loyalityCardNumber = ?";
				connection.query(sql,[values.loyalityCardNumber],(err, result) => {
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

let deleteLoyalityCardDetails = (condition) => {
	return new Promise((resolve, reject) => {
		let sql = "Delete from `loyalitycard_tbl` WHERE ?";
		connection.query(sql, [condition], (err, result) => {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		})
	})
}

let insertOffer = (values) => {
	console.log(values);
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `offer_tbl` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				resolve(result);
			}
		});
	});
}

export default {
	insertQuery,
	getLoyalityPrograms,
	getLoyalityProgramsDetails,
	insertloyalitycardQuery,
	getLoyalityCardList,
	updateLoyalityCardDetails,
	deleteLoyalityCardDetails,
	insertOffer
	}