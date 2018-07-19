import connection from './connection';
import responses from './responses';

exports.requiresLogin = (req, res, next) => {
    let { access_token } = req.headers;
    if (access_token) {
        let sql = "SELECT * FROM `user_tbl` WHERE `access_token`=?";
        connection.query(sql, [access_token], (err, result) => {
            if (err) {
                next(responses.sendError(err.message, res));
            } else if (result.length == 0) {
                next(responses.authenticationErrorResponse(res));
            } else {
                req.user = result[0];
                next();
            }
        });
    } else {
        next(responses.parameterMissingResponse(res));
    }
}