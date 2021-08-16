/* eslint-disable semi */
const express = require('express');
const router = express.Router();
const validate = require('./validation');
const contactsController = require('../../../controllers/contacts');
const guard = require('../../../helpers/guard');

router
  .get('/', guard, contactsController.listContacts)
  .post('/', guard, validate.createContact, contactsController.addContact);

router
  .get('/:contactId', guard, contactsController.getContactById)
  .delete('/:contactId', guard, contactsController.removeContact)
  .patch(
    '/:contactId',
    guard,
    validate.updateContact,
    contactsController.updateContact,
  );

module.exports = router;
