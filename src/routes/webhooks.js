const express = require('express');

const webhooksRouter = express.Router();

// TODO: process webhook payload
webhooksRouter.post('/task-update', (req, res) => {
  console.log('[WEBHOOK] Received:', req.body);
  res.json({ received: true });
});

module.exports = { webhooksRouter };
