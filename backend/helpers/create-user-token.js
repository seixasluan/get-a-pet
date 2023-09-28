const jwt = require('jsonwebtoken');

const createUserToken = async(user, req, res) => {

  // criando token
  const token = jwt.sign({
    name: user.name,
    id: user._id,
  }, "nossosecret");

  // retornando token]
  res.status(200).json({
    message: 'Você está autenticado',
    token,
    userId: user._id,
  });
}

module.exports = createUserToken;