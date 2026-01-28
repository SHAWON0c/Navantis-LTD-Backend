const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getAreaAndZonalManagers
} = require('../controllers/users/user.controller');



// 2️⃣ User routes
router.get('/', getAllUsers);           
router.post('/', createUser);  
router.get("/managers", getAreaAndZonalManagers); 


module.exports = router;
