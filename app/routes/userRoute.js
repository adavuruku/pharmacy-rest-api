const express = require('express');
const router = express.Router();


const {check_is_Active, check_is_admin, check_is_consultant, check_is_consultant_and_admin} = require ('../middlewares/check-auth');
const userController = require('../controllers/userController');

//route to add phone to NIN
router.post('/register', userController.add_new_user);
router.post('/customer/register', userController.add_new_customer);
router.post('/login', userController.login_user);
router.post('/product/category/add', check_is_admin, userController.add_product_category);
router.post('/category/product/add', check_is_admin, userController.add_product_to_category);
router.patch('/category/product/update', check_is_admin, userController.update_product);
router.get('/product/all/:page',check_is_Active, userController.all_product_statistic);
router.get('/category/all/:page',check_is_Active, userController.all_categories);
router.get('/consultants/all/:page',check_is_Active, userController.all_consultants);
router.patch('/category/update',check_is_Active, userController.update_category);
router.get('/my/orders/all/:page',check_is_Active, userController.all_my_orders);
router.post('/orders/save',check_is_Active, userController.save_new_orders);
router.post('/location/add',check_is_Active, userController.save_location);
router.get('/location/all/:page',check_is_Active, userController.all_locations);


//route to verify the NIN Phone
// router.post('/verify/code', ninController.verify_phone_link_code);

module.exports = router;