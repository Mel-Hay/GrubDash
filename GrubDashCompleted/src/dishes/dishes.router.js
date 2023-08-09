const express = require("express");
const router = require("express").Router();
const dishesController = require('./dishes.controller')
// TODO: Implement the /dishes routes needed to make the tests pass

router.route('/')
.get(dishesController.list)
.post(dishesController.create)


router.route('/:dishId')
.put(dishesController.update)
.get(dishesController.read)
.delete(dishesController.delete)

module.exports = router;
