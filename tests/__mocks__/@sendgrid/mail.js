const { send } = require("@sendgrid/mail")

/**
 * This is an example of mocking sendgrid module
 * that avoids sending actualy emails
 * We are mocking 2 functions of that npm module
 */
module.exports = {
    setApiKey() {

    },
    send() {

    }
}