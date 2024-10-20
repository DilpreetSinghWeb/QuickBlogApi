const { body } = require("express-validator");
let validator = [
    body("name")
      .isString()
      .withMessage("name must be a string")
      .notEmpty()
      .withMessage("name must not be empty")
      .isLength({ min: 3, max: 22 })
      .withMessage("The length must b 8 to 22 char long"),
    body("email")
      .isString()
      .withMessage("email must be a string")
      .notEmpty()
      .withMessage("email must not be empty")
      .isEmail()
      .withMessage("Email should be a valid email address"),
    body("password")
      .isString()
      .withMessage("password must be a string")
      .notEmpty()
      .withMessage("password must not be empty")
      .isStrongPassword()
      .withMessage("Password must be a strong password"),
  ];



let passwordValidator = [
    body("email")
      .isString()
      .withMessage("email must be a string")
      .notEmpty()
      .withMessage("email must not be empty")
      .isEmail()
      .withMessage("Email should be a valid email address"),
    body("password")
      .isString()
      .withMessage("password must be a string")
      .notEmpty()
      .withMessage("password must not be empty")
      .isStrongPassword()
      .withMessage("Password must be a strong password"),
  ];

module.exports = {validator,passwordValidator};