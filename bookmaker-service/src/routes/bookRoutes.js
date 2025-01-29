const express = require('express');
const router = express.Router();
const bookmakerController = require('../controller/bookController'); // Importer le controller

router.post('/create', bookmakerController.createBookmaker);

router.get('/', bookmakerController.getAllBookmakers);

router.get('/:user_id', bookmakerController.getBookmakerById);

router.delete('/:id', bookmakerController.deleteBookmaker);

router.put('/:id', bookmakerController.updateBookmaker);

module.exports = router;