const { body } = require('express-validator');

const userSignUpValidator = () => {
    return [
        body('name').isString().notEmpty().withMessage('Name is required and should be a string.'),
        body('email').isEmail().withMessage('Please provide a valid email address.'),
        body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long.'),
        // Add more validation rules as needed
    ];
};

module.exports = { userSignUpValidator };
