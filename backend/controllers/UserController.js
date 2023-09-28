const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// helpers
const getToken = require('../helpers/get-token');
const createUserToken = require('../helpers/create-user-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;
    
    // validações
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório! '});
      return;
    }
    if (!email) {
      res.status(422).json({ message: 'O email é obrigatório! '});
      return;
    }
    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatório! '});
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: 'A confirmação da senha é obrigatório! '});
      return;
    }
    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório! '});
      return;
    }

    // conferir se password e confirmPassword coincidem
    if (password !== confirmPassword) {
      res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!"});
      return;
    }

    // verificar se usuário já existe
    const userExists = await User.findOne({email: email});
    if (userExists) {
      res.status(422).json({message: 'Este email já está em uso. Por favor utilize outro!'});
      return;
    }

    // criando a senha criptografada
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // criando usuário
    const user = new User ({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      
      await createUserToken( newUser, req, res);
    } catch (err) {
      res.status(500).json({ message: err});
    }
  }

  static async login (req, res) {
    const { email, password } = req.body;

    // validações
    if(!email) {
      res.status(422).json({message: 'O email é obrigatório!'});
      return;
    }

    if (!password) {
      res.status(422).json({message: 'A senha é obrigatória!'});
      return;
    }

    // verificar se o usuário existe
    const user = await User.findOne({email: email});
    if (!user) {
      res.status(422).json({message: 'Não há usuário cadastrado com este email!'});
      return;
    }

    // verifica se a senha coincide com a senha do banco de dados
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({message: 'Senha inválida!'});
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser
    // console.log(req.headers.authorization);

    if (req.headers.authorization) {
      
      const token = getToken(req);
      const decoded = jwt.verify(token, 'nossosecret');

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;

    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById (req, res) {

    const id = req.params.id;

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(422).json({
        message: 'Usuário não encontrado!',
      });
      return;
    }

    res.status(200).json({ user });

  }

  static async editUser(req, res) {
    
    const id = req.params.id;
    
    // verifica se usuário existe
    const token = getToken(req);
    const user = await getUserByToken(token);
    
    const { name, email, phone, password, confirmPassword } = req.body;
    
    let image = '';

    if (req.file) {
      user.image = req.file.filename;
    }

    //validações
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório! '});
      return;
    }

    user.name = name;

    if (!email) {
      res.status(422).json({ message: 'O email é obrigatório! '});
      return;
    }

    // verifica se email já está em uso
    const userExists = await User.findOne({email: email});

    if (user.email !== email && userExists) {
      res.status(422).json({
        message: 'Por favor, utilize outro email!',
      });
      return;
    }

    user.email = email;
    
    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório! '});
      return;
    }

    user.phone = phone;

    if (password != confirmPassword) {
      res.status(422).json({message: "As senhas não coincidem!"});
      return;
    } else if (password === confirmPassword && password != null) {
      // criando nova senha
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      // retorna os dados atualizados do user
      await User.findOneAndUpdate(
        {_id: user.id},
        {$set: user},
        {new: true},
      );

      res.status(200).json({message: 'Usuário atualizado com sucesso!'});
    } catch (err ){
      res.status(500).json({message: err});
    }
  }
}