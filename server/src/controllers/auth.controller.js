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

module.exports = {
  register,
  login,
};
