const express = require('express');
const router = express.Router();

const PetController = require('../controllers/PetController');

//middlewares
const verifyToken = require('../helpers/verify-token');
const { imageUpload } = require('../helpers/image-upload');

// posts
router.post('/create', verifyToken, imageUpload.array('images'), PetController.create);

// gets
router.get('/', PetController.getAll);
router.get('/mypets', verifyToken, PetController.getAllUserPets);
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions);
router.get('/:id', PetController.getPetById);

// deletes
router.delete('/:id', verifyToken, PetController.removePetById);

// patches
router.patch('/:id', verifyToken, imageUpload.array('images'), PetController.updatePet);
router.patch('/schedule/:id', verifyToken, PetController.schedule);
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption);

module.exports = router;