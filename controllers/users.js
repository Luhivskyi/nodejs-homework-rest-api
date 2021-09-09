/* eslint-disable semi */
const jwt = require('jsonwebtoken');
const Users = require('../model/users');
const fs = require('fs/promises');
const path = require('path');
const { HttpCode } = require('../helpers/constants');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;
const UploadAvatarService = require('../helpers/local-upload');

const reg = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findByEmail(email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'Error',
        code: HttpCode.CONFLICT,
        data: 'Conflict',
        message: 'User with this email is already exist',
      });
    }

    const newUser = await Users.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'Success',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    const isValidPassword = await user.validPassword(password);

    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'Error',
        code: HttpCode.UNAUTHORIZED,
        data: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }
    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
    await Users.updateToken(id, token);

    return res.status(HttpCode.OK).json({
      status: 'Success',
      code: HttpCode.OK,
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, _next) => {
  const userId = req.user.id;
  await Users.updateToken(userId, null);
  return res.status(HttpCode.NO_CONTENT).json();
};
const currentUser = async (req, res, next) => {
  try {
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        user: {
          email: req.user.email,
          subscription: req.user.subscription,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};
const updateSub = async (req, res, next) => {
  const { id } = req.user;
  const { subscription } = req.body;
  try {
    await Users.updateSubUser(id, subscription);
    const user = await Users.findById(id);
    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const uploads = new UploadAvatarService('avatars');
    const avatarUrl = await uploads.saveAvatar({ idUser: id, file: req.file });
    console.log(
      '🚀 ~ file: users.js ~ line 121 ~ updateAvatar ~ avatarUrl',
      req.user.avatarURL,
    );

    try {
      await fs.unlink(path.join('public', req.user.avatarURL));
      console.log(
        "🚀 ~ file: users.js ~ line 125 ~ updateAvatar ~ 'public', req.user.avatarURL",
        'public',
        req.user.avatarURL,
      );
    } catch (e) {
      console.log(
        '🚀 ~ file: users.js ~ line 127 ~ updateAvatar ~ error',
        e.message,
      );
    }

    await Users.updateAvatar(id, avatarUrl);
    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: { avatarUrl },
    });
  } catch (e) {
    next(e);
  }
};
module.exports = { reg, login, logout, currentUser, updateSub, updateAvatar };
