const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


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

function validateId(req, res, next){
    const {dishId}= req.params
    let foundDish= dishes.find((dish)=>{
        return dish.id===dishId
    })
    if(!foundDish){
        next({status:404, message: `Dish does not exist: ${dishId}`})
    }
    next()
}
function validateDeleteId(req, res, next){
    const {dishId}= req.params
    let foundDish= dishes.find((dish)=>{
        dish.id===dishId
    })
    if(!foundDish){
        next({status:405, message: `Dish does not exist: ${dishId}`})
    }
    next()
}


function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
     if (Number(price)<0) {
       return next({
         status: 400,
         message: "Dish must have a price that is in integer greater than 0",
       });
     }else{
    const newDish = { name, description, price, image_url, id: nextId() };
     dishes.push(newDish);
     res.status(201).json({ data: newDish });
     }
     
   }
function read(req, res, next){
const { dishId } = req.params
let dish = dishes.find((d)=> d.id === dishId)
res.status(200).send({data: dish})
}

function list(req, res, next){
 res.status(200).send({data: dishes})
}

function update(req, res, next){
    const { dishId } = req.params
    const {data: {name, description, price, image_url, id}} = {} = req.body;
  
    dishes[dishId]={
      name:name,
      description:description,
      price:price,
      image_url:image_url,
      id:dishId
    }
  if(id===" " ||!id ){
    res.json({data:dishes[dishId]})
  }else if(dishId !==id){
    return next({
         status: 400,
         message: `The id given: ${id} does not match the required Id ${dishId}`,
       });
  }
    res.json({data:dishes[dishId]})
}

function destroy(req, res, next){
const dishIndex = res.locals.dishIndex;
dishes.splice(dishIndex, 1);
res.sendStatus(204);

}

function priceValidator(req, res, next){
  const {data: {price}} = {} = req.body
  if(typeof price !=='number'){
    next({status:400, message:`price: ${price} is not a number.`})
  }else if(price<0){
    next({status:400, message:`price: ${price} needs to be larger than 0.`})
  }
  next()
}


module.exports={
    list,
    update:[validateId,
    
    createValidatorFor("name"),
    createValidatorFor("description"),
    createValidatorFor("image_url"),
    createValidatorFor("price"),
    priceValidator,
    update],
    create:[createValidatorFor("name"),
     createValidatorFor("description"),
      createValidatorFor("image_url"),
       createValidatorFor("price"),
       create
    ],
    read:[validateId, read],
    delete:[validateDeleteId, destroy]
}