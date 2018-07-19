import connection from '../Modules/connection.js';
import responses from '../Modules/responses';
import constant from '../Modules/constant';
import comfunc from '../Modules/commonFunction.js';

let insertUtilityQuery = (values) => {
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `utility_tbl` SET ?";
		connection.query(sql, [values], (err, result) => {
			if (err) {reject(err);}
			else {
				let sql = "SELECT * FROM `utility_tbl` WHERE id=?";
				connection.query(sql, [values.id], (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			}
		});
	});
}

export default {
	insertUtilityQuery
}
