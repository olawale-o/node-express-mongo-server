const bcrypt = require('bcryptjs');
const repo = require('./repository');
const AppError = require('../common/app-error');

const verifyUserName = async (crendentials) => repo.findByUsernameOrEmail(crendentials);
const verifyPassword = async ({ password, passwordEncrypt }) => (
  bcrypt.compareSync(password, passwordEncrypt)
);

module.exports = {
  register: async (crendentials) => {
    const {
      username, name, password, email,
    } = crendentials;
    return repo.create({
      username,
      name,
      email,
      online: false,
      avatar: 'profile',
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
  login: async (credentials) => {
    const user = await verifyUserName(credentials);
    if (!user) {
      throw new AppError(422, 'Invalid credentials');
    }
    if (!(await
    verifyPassword({ password: credentials.password, passwordEncrypt: user.password })
    )) {
      throw new AppError(422, 'Invalid credentials');
    }
    return user;
  },
  findUserBy: async (credentials) => repo.findUserBy(credentials),
  getToken: async (credentials) => repo.findById(credentials),
  updateToken: async (credentials, operation) => repo.findByIdAndUpdate(credentials, operation),
  getOtherUsers: async (options) => repo.findAllUsers(options),
  updateProfile: async (credentials, operation, options) => (
    repo.findByIdAndUpdate(credentials, operation, options)
  ),
  verifyRefereshToken: async (credentials) => {
    const foundUser = await repo.findUserBy(credentials);
    if (!foundUser) {
      return new AppError(401, 'Unauthorized');
    }
    return foundUser;
  },
};
