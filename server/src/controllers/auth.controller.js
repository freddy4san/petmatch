const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const authResult = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      data: authResult,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const authResult = await authService.loginUser(req.body);

    return res.status(200).json({
      success: true,
      data: authResult,
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await authService.updateCurrentUser(req.user.userId, req.body);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  me,
  updateMe,
  register,
  login,
};
