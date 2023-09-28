const Pet = require('../models/Pet');

// helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require('../helpers/get-user-by-token');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class PetController {
  // criando um pet
  static async create(req, res) {
    const { name, age, weight, color } = req.body;

    const images = req.files;

    const available = true;

    // validações
    if (!name) {
      res.status(422).json({message: 'O nome é obrigatório'});
      return;
    }

    if (!age) {
      res.status(422).json({message: 'A idade é obrigatório!'});
      return;
    }

    if (!weight) {
      res.status(422).json({message: 'O peso é obrigatório!'});
      return;
    }

    if (!color) {
      res.status(422).json({message: 'A cor é obrigatória!'});
      return;
    }

    if (images.length === 0)   {
      res.status(422).json({message: 'A imagem é obrigatória!'});
      return;
    }

    // busca o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    // criando um pet
    const pet = new Pet ({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(201).json({message: 'Pet criado com sucesso!', newPet});
    } catch (err) {
      res.status(500).json({message: err})
    }
  }

  // lista todos os pets em ordem de mais recentes primeiro
  static async getAll(req, res) {
    const pets = await Pet.find().sort('-createdAt');

    res.status(200).json({pets: pets});
  }

  static async getAllUserPets(req, res) {
    // busca o usuário pelo token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({'user._id': user._id}).sort('-createdAt');

    res.status(200).json({ pets });
  }

  static async getAllUserAdoptions(req, res) {
    // busca o usuário pelo token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt');

    res.status(200).json({ pets });
  }

  static async getPetById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      res.status(422).json({
        message: 'ID inválido!'
      });
      return;
    }

    const pet = await Pet.findOne({_id: id});

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' });
    }

    res.status(200).json({pet: pet});
  }

  static async removePetById(req, res) {
    // pega o id pela requisição e verifica se é um id válido
    const id = req.params.id;
    
    if (! ObjectId.isValid(id)) {
      res.status(422).json({
        message: 'ID inválido!'
      });
      return;
    }

    // verifica se o pet existe
    const pet = await Pet.findOne({_id: id});

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' });
      return;
    }

    // verifica se o usuário que está logado é o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ 
        message: 'Houve um problema em processar sua solicitação, tente novamente mais tarde!'
      });
      return;
    }

    await Pet.findByIdAndRemove(id);
    res.status(200).json({
      message: 'Pet removido com sucesso!'
    });
  }

  // atualiza pet
  static async updatePet(req, res) {
    const id = req.params.id;

    const { name, age, weight, color } = req.body;

    const images = req.files;

    const available = true;

    const updatedData = {}

    // verifica se o pet existe
    const pet = await Pet.findOne({_id: id});

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' });
      return;
    }

    // verifica se o usuário que está logado é o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ 
        message: 'Houve um problema em processar sua solicitação, tente novamente mais tarde!'
      });
      return;
    }

    // validações
    if (!name) {
      res.status(422).json({message: 'O nome é obrigatório'});
      return;
    } else {
      updatedData.name = name;
    }

    if (!age) {
      res.status(422).json({message: 'A idade é obrigatório!'});
      return;
    } else {
      updatedData.age = age;
    }

    if (!weight) {
      res.status(422).json({message: 'O peso é obrigatório!'});
      return;
    } else {
      updatedData.weight = weight;
    }

    if (!color) {
      res.status(422).json({message: 'A cor é obrigatória!'});
      return;
    } else {
      updatedData.color = color;
    }

    if (images.length > 0) {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findByIdAndUpdate(id, updatedData);
    res.status(200).json({ message: 'Pet atualizado com sucesso!'});
  }

  // marcar a visita ao pet escolhido 
  static async schedule(req, res) {
    const id = req.params.id;

    // verifica se o pet existe
    const pet = await Pet.findOne({ _id: id});

    if (!pet) {
      res.status(404).json({message: 'Pet não encontrado!'});
      return;
    }

    // verifica se o usuário é o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) { 
      res.status(422).json({message: 'Você não pode agendar uma visita com seu próprio pet!'});
      return;
    }

    // verifica se o usuário ja agendou uma visita
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({message: 'Você já agendou uma visita para este pet'});
        return;
      }
    }

    // adiciona usuario ao pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id);

    res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`
    });

  }

  // concluir a adoção / visita
  static async concludeAdoption(req, res) {
    const id = req.params.id;

    // verifica se o pet existe
    const pet = await Pet.findOne({ _id: id});

    if (!pet) {
      res.status(404).json({message: 'Pet não encontrado!'});
      return;
    }
 
    // verifica se o usuário que está logado é o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ 
        message: 'Houve um problema em processar sua solicitação, tente novamente mais tarde!'
      });
      return;
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: 'Parabéns, o ciclo de adoção foi finalizado com sucesso!'
    });
  }
}