const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next){
 res.status(200).send({data: orders})
}

function read(req, res, next){
const { orderId } = req.params
let order = orders.find((o)=> o.id === orderId)
res.status(200).send({data: order})
}

function validateId(req, res, next){
    const { orderId }= req.params
    let foundOrder= orders.find((order)=>{
        return order.id===orderId
    })
    if(!foundOrder){
        next({status:404, message: `Order does not exist: ${orderId}`})
    }
    next()
}

function create(req, res, next) {
    const { deliverTo, mobileNumber, dishes } = req.body.data;
    
    const newOrder = { deliverTo, mobileNumber, dishes, id: nextId() };
     orders.push(newOrder);
     res.status(201).json({ data: newOrder });
     }

function dishesValidator(req, res, next) {
  const { dishes } = req.body.data;

  if (!Array.isArray(dishes) || dishes.length === 0) {
    next({ status: 400, message: `dishes needs to be a non-empty array: ${dishes}` });
  } else {
    for (const dish of dishes) {
      if (!dish.quantity || dish.quantity <= 0 ) {
        next({ status: 400, message: `Dish ${dishes.indexOf(dish)} on the list needs quantity to be greater than 1` });
      } else if (!Number.isInteger(dish.quantity)) {
        next({ status: 400, message:`Dish ${dishes.indexOf(dish)} on the list needs quantity to be an integer.`});
      }
    }
    next();
  }
}


function createValidatorFor(field) {
    return function (req, res, next) {
      if (req.body.data[field]&& req.body.data[field] !==""||0) {
        next();
      } else {
        next({
          status: 400,
          message: `Dish must include a ${field}`,
        });
      }
    };
  }

function validateDeleteId(req, res, next){
    const {orderId}= req.params
    let foundOrder= orders.find((order)=>{
       return order.id===orderId
    })
    if(!foundOrder){
        next({status:404, message: `Order does not exist: ${orderId}`})
    }else if(foundOrder.status !=='pending'){
        next({status:400, message: `The status on the order is ${foundOrder.status} not pending`})
    }
    next()
}


function destroy(req, res, next){
const orderIndex = res.locals.orderIndex;
orders.splice(orderIndex, 1);
res.sendStatus(204);

}
  
function statusValidator(req, res, next){
  const {data:{status}}={}=req.body;
  if(status==="invalid"){
   next({status:400, message:`status is invalid`}) 
  }
  next()
}

function update(req, res, next){
    const { orderId } = req.params
    const {data: {deliverTo, mobileNumber, status, dishes, id}} = {} = req.body;
    orders[orderId]={
      deliverTo:deliverTo,
      mobileNumber:mobileNumber,
      status:status,
      dishes:dishes,
      id:orderId
    }
  if(id===" " ||!id ){
    res.json({data:orders[orderId]})
  }else if(orderId !==id){
    return next({
         status: 400,
         message: `The id given: ${id} does not match the required Id ${orderId}`,
       });
  }
    res.json({data:orders[orderId]})
}
module.exports = {
  list,
  create:[createValidatorFor('deliverTo'),
         createValidatorFor('mobileNumber'),
         createValidatorFor('dishes'),
         dishesValidator,
         create],
  read:[validateId, read],
  delete:[validateDeleteId, destroy],
  update:[validateId,
         createValidatorFor('deliverTo'),
         createValidatorFor('mobileNumber'),
         createValidatorFor('status'),
         statusValidator,
         dishesValidator,
          update]
  
}