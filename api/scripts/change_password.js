const models = require('../server/models');
const userHelper = require('../server/helpers/user');

const id = 'e7332252-6596-479c-87b5-4b7e0b1a9aba';
const password = 'IWdZ9s4C3t!';
const { hashed_password, password_salt } = userHelper.hashPassword(password);

models.user
  .update(
    {
      password: hashed_password,
      password_salt,
    },
    {
      where: {
        user_id: id,
      },
    },
  )
  .then((result) => {
    console.log(result);
    return process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
