const express = require('express');
const router = express.Router();


const {check_is_Active, check_is_admin, check_is_consultant, check_is_consultant_and_admin} = require ('../middlewares/check-auth');
const userController = require('../controllers/userController');

//route to add phone to NIN
router.post('/register', userController.add_new_user);
router.post('/customer/register', userController.add_new_customer);
router.patch('/customer/update', check_is_Active, userController.update_user_information);
router.patch('/customer/update/password', check_is_Active, userController.update_user_password);

router.patch('/role/update', check_is_admin, userController.admin_update_user_role);

router.post('/login', userController.login_user);
router.get('/logout', check_is_Active, userController.logout_user);
router.post('/product/category/add', check_is_admin, userController.add_product_category);
router.post('/product/add', check_is_admin, userController.add_product_to_category);
router.patch('/product/update', check_is_admin, userController.update_product);
router.get('/product/all/:page', userController.all_product_statistic);
router.get('/category/all/:page', userController.all_categories);
router.get('/consultants/all/:page',check_is_Active, userController.all_consultants);
router.patch('/category/update',check_is_Active, userController.update_category);
router.get('/my/orders/all/:page',check_is_Active, userController.all_my_orders);
router.post('/orders/save',check_is_Active, userController.save_new_orders);
router.post('/location/add',check_is_Active, userController.save_location);
router.get('/location/all/:page',check_is_Active, userController.all_locations);

router.post('/wishlist/add',check_is_Active, userController.add_to_wish_list);
router.delete('/wishlist/remove',check_is_Active, userController.remove_from_wish_list);
router.get('/wishlist/all/:page',check_is_Active, userController.all_my_wishlist);
router.patch('/search',check_is_admin, userController.search_user);
router.patch('/products/search',check_is_admin, userController.search_products);
router.patch('/product/filter', userController.testing_fetches);
router.delete('/products/delete/:inventoryId', check_is_admin, userController.delete_a_products);
router.get('/open/product/:inventoryId', userController.open_a_product);
//route to verify the NIN Phone


//chats

router.get('/chat/consultants/:toUserId/:isConsultant', check_is_Active, userController.chat_consultants);
router.post('/chat/add',check_is_Active, userController.add_chat);
router.get('/chat/my/:userId/:page',check_is_Active, userController.fetch_users_messages);
router.get('/mockup', userController.record_for_insert);

module.exports = router;