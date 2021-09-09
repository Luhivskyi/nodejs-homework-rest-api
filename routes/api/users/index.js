/* eslint-disable semi */
const express = require('express');
const router = express.Router();
// const validate = require('./validation');
const guard = require('../../../helpers/guard');
const { validateUpdateSub } = require('../../../helpers/validation');
const userController = require('../../../controllers/users');
const multer = require('../../../helpers/multer');
router

  .post('/registration', userController.reg)
  .post('/login', userController.login)
  .post('/logout', guard, userController.logout)
  .get('/current', guard, userController.currentUser)
  .patch('/', guard, validateUpdateSub, userController.updateSub)
  .patch(
    '/avatars',
    guard,
    multer.single('avatar'),
    userController.updateAvatar,
  );

module.exports = router;
