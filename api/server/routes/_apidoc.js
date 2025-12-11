/**
 * @apiDefine LoginRequired
 * @apiHeader {string} X-Access-Token JWT access token (get this after signing in)
 * @apiError (Error 403 - Login Required) {string} status Response status.
 * @apiError (Error 403 - Login Required) {string} message="Sign in is required for this action. Please sign in first." Message to display to user.
 * @apiError (Error 403 - Login Required) {string} message_code="2-user-013" Message code of message for developer use.
 * @apiError (Error 403 - Login Required) {Object} data Response data.
 * @apiErrorExample {json} Error 403 Response:
 * {
 *      "status": "error",
 *      "message": "Sorry, you do not have permissions to access this.",
 *      "message_code": "2-generic-002"
 * }
 */

/**
 * @apiDefine ServerError
 * @apiError (Error 5xx) {string} status Response status.
 * @apiError (Error 5xx) {string} message Message to display to user.
 * @apiError (Error 5xx) {string} message_code Message code of message for developer use.
 * @apiError (Error 5xx) {Object} data Response data.
 * @apiErrorExample {json} Error 500 Response:
 * {
 *      "status": "error",
 *      "message": "Sorry, failed to process request. Please try again.",
 *      "message_code": "2-generic-001"
 * }
 */

/**
 * @apiDefine ServerSuccess
 * @apiSuccess {string} status Response status.
 * @apiSuccess {string} message Message to display to user.
 * @apiSuccess {string} message_code Message code of message for developer use.
 * @apiSuccess {Object} data Response data.
 * @apiSuccessExample {json} Success 200 Response:
 * {
 *      "status": "ok",
 *      "message": "Processed request successfully.",
 *      "message_code": "1-generic-001",
 *      "data": {},
 * }
 */
