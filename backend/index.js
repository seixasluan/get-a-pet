const express = require('express');
const cors = require('cors');

const app = express();

// configurar middlewares
app.use(express.json());

// CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// pasta publica para images
app.use(express.static('public'));

// rotas
const UsersRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');
app.use('/users', UsersRoutes);
app.use('/pets', PetRoutes);

app.listen(5000);