const bcrypt = require('bcryptjs');
const repo = require('./repository');

module.exports = {
  register: async (crendentials) => {
    const { username, name, password } = crendentials;
    return repo.create({
      username,
      name,
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
  login: async (credentials) => {
    const user = this.verifyUserName(credentials);
    if (this.verifyPassword({ password: user.password, passwordEncrypt: 'encrypt' })) {
      throw new Error('Password invalid');
    }
    return user;
  },
  getToken: async (credentials) => repo.findById(credentials),
  updateToken: async (credentials, operation) => repo.findByIdAndUpdate(credentials, operation),
  verifyUserName: async (crendentials) => repo.findByUsername(crendentials),
  verifyPassword: async ({ password, passwordEncrypt }) => password === passwordEncrypt,
};
