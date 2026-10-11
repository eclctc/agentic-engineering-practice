const express = require('express');
const tagsService = require('../services/tags');
const { requireNonEmptyString } = require('../middleware/validate');

const tagsRouter = express.Router();

tagsRouter.get('/', (req, res) => {
  res.json(tagsService.listTags());
});

tagsRouter.post('/', requireNonEmptyString('name'), (req, res) => {
  res.status(201).json(tagsService.createTag(req.body.name));
});

module.exports = { tagsRouter };
