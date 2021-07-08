const {Sequelize,Op, QueryTypes} = require('sequelize');
const { Validator } = require('node-input-validator')
const db = require('../../models');
const argon2 = require('argon2')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
// multipleStatements: true -> set this in config file if you want to run mutiple queries
const {users, products, categories} = require('./mockups')

const {UsersInformation,Conversation, InventoryCategory,WishList,Inventory,TransactionReceipt,Transaction,DeliveryLocation} = require('../../models/index');

let generateToken = (email,userId) =>{
    return jwt.sign({
        emailAddress:email,
        userId:userId
    },
    process.env.MY_HASH_SECRET);
}
var cloudinary = require('cloudinary').v2;



cloudinary.config = ({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
exports.add_new_user = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            firstName: "required|string|minLength:1",
            lastName: "required|string|minLength:1",
            email: "required|email",
            password: "required|string",
            phone: "required|phoneNumber",
            isAdmin: "required|boolean",
            isConsultant: "required|boolean"
        })
        const matched = await v.check()
        if(!matched){
            return res.status(412).json({
                message:'Invalid Data Input'
            });
        }else{
            let hashVerificationCode = await argon2.hash(req.body.password,process.env.MY_ARGON_SALT)
            let userId = uuidv4();
            let productUrl = null
            if(req.files?.userImage){
                let fileUpload = await cloudinary.uploader.upload(
                req.files.userImage.tempFilePath,
                { 
                    folder: "pharmacy-products/"
                })

                productUrl = fileUpload.secure_url
            }
            //create new user
            let userInformation = await UsersInformation.create(
            {
                firstName : req.body.firstName.trim(),
                profileImage : productUrl,
                lastName : req.body.lastName.trim(),
                email : req.body.email.trim(),
                phone : req.body.phone.trim(),
                userId:userId,
                password : hashVerificationCode,
                isConsultant : req.body.isConsultant,
                isAdmin : req.body.isAdmin
            });
            const tokenValue = generateToken(userInformation.email,userInformation.userId)
            return res.status(200).json({
                message:'Created',
                userInformation,tokenValue
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.add_new_customer = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            firstName: "required|string|minLength:1",
            lastName: "required|string|minLength:1",
            email: "required|email",
            password: "required|string",
            phone: "required|phoneNumber"
        })
        const matched = await v.check()
        console.log(req.body)
        if(!matched){
            return res.status(412).json({
                message:'Invalid Data Input'
            });
        }else{
            let hashVerificationCode = await argon2.hash(req.body.password,process.env.MY_ARGON_SALT)
            let userId = uuidv4();
            //create new user
            let userInformation = await UsersInformation.create(
            {
                firstName : req.body.firstName.trim(),
                lastName : req.body.lastName.trim(),
                email : req.body.email.trim(),
                phone : req.body.phone.trim(),
                userId:userId,
                password : hashVerificationCode
            });
            const tokenValue = generateToken(userInformation.email,userInformation.userId)
            return res.status(200).json({
                message:'Created',
                userInformation, tokenValue
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.update_user_information = async (req,res,next)=>{
    try {
        console.log(req.body)
        const v = new Validator(req.body, {
            firstName: "required|string",
            lastName: "required|string",
            phone: "required|string",
        })
        
        const matched = await v.check()
        if(matched){
           
            let userUrl = req.userInfo.profileImage
            if(req.files?.profileImage){
                let fileUpload = await cloudinary.uploader.upload(
                req.files.profileImage.tempFilePath,
                { 
                    folder: "pharmacy-products/"
                })

                userUrl = fileUpload.secure_url
            }
            let userInformation = await UsersInformation.update({ 
                firstName:req.body.firstName, lastName:req.body.lastName,
                phone:req.body.phone,profileImage:userUrl
                }, {where: {userId: req.userInfo.userId},returning: true})
            return res.status(200).json({
                message:'Successful',userInformation:userInformation[1][0]
            });
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.update_user_password = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            password: "required|string",
            currentPassword: "required|string"
        })
        
        const matched = await v.check()
        if(matched){
            let userExist = await UsersInformation.findOne({ where: {userId: req.userInfo.userId}})
            if(userExist){
                let hash = await argon2.verify(userExist.password, req.body.currentPassword)
                if(hash){
                    let hashVerificationCode = await argon2.hash(req.body.password,process.env.MY_ARGON_SALT)
                    let userInformation = await UsersInformation.update({ 
                        password:hashVerificationCode
                        }, {where: {userId: req.userInfo.userId},returning: true})
                    return res.status(200).json({
                        message:'Successful',userInformation:userInformation[1][0]
                    });
                }
            }
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.admin_update_user_role = async (req,res,next)=>{
    try {
        // console.log(req.body)
        const v = new Validator(req.body, {
            email: "required|string",
            userId: "required|string",
            status: "required|boolean",
            isAdmin: "required|boolean",
            isConsultant: "required|boolean",
        })
        
        const matched = await v.check()
        if(matched){
            let userInformation = await UsersInformation.update({ 
                status:req.body.status, isAdmin:req.body.isAdmin,isConsultant:req.body.isConsultant
                }, {where: {email: req.body.email, userId:req.body.userId},returning: true})
            return res.status(200).json({
                message:'Successful',userInformation:userInformation[1][0]
            });
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.login_user = async (req,res,next)=>{
    // console.log('>> ',process.env.MY_HASH_SECRET)
    try {
        const v = new Validator(req.body, {
            email: "required|email",
            password: "required|string",
        })
        const matched = await v.check()
        if(!matched){
            return res.status(412).json({
                message:'Invalid Data Input'
            });
        }else{
            let userExist = await UsersInformation.findOne({ where: {email: req.body.email.trim()}})
            if(userExist){
                let hash = await argon2.verify(userExist.password, req.body.password)
                if(hash && userExist.status){
                    const tokenValue = generateToken(userExist.email,userExist.userId)
                    return res.status(200).json({
                        message:'Created',
                        userInformation:userExist,tokenValue
                    });
                }
            }

            return res.status(422).json({
                message:'Fail'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.add_product_category = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            categoryName: "required|string|minLength:1",
        })
        const matched = await v.check()
        if(!matched){
            return res.status(412).json({
                message:'Invalid Data Input'
            });
        }else{
            let categoryId = uuidv4();
            //create new user
            let category = await InventoryCategory.create(
            {
                categoryName : req.body.categoryName.trim(),
                categoryId
            });
            return res.status(200).json({
                message:'Created',
                category
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.add_product_to_category = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            productName: "required|string|minLength:1",
            productMeasure: "required|string|minLength:1",
            productDescription: "required|string",
            productPrice: "required|decimal",
            productCategory: "required|string",
            productPercent: "required|decimal",
        })
        const v2 = new Validator(req.files, {
            productImage: "required|mime:jpg,png,jpeg|size:55500kb"
        })
        
        const matched = await v.check()
        const matched2 = await v2.check()
        if(matched && matched2){
            let fileUpload = await cloudinary.uploader.upload(
            req.files.productImage.tempFilePath,
            { 
                folder: "pharmacy-products/"
            })
            if(fileUpload){
                let inventoryId = uuidv4();
                //create new user
                let category = await Inventory.create(
                {
                    productName : req.body.productName.trim(),
                    productMeasure : req.body.productMeasure.trim(),
                    productDescription : req.body.productDescription.trim(),
                    productPrice : req.body.productPrice.trim(),
                    productImage : fileUpload.secure_url,
                    productPercent:req.body.productPercent,
                    productCategory : req.body.productCategory.trim(),
                    inventoryId
                });
                return res.status(200).json({
                    message:'Created',
                    product:category
                });
            }
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.update_product = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            productId: "required|string",
        })
        
        const matched = await v.check()
        if(matched){
            let productExist = await Inventory.findOne({ where: {inventoryId: req.body.productId.trim()}})
            // console.log(productExist.productImage)
            if(productExist){
                let productUrl = productExist.productImage
                if(req.files?.productImage){
                    let fileUpload = await cloudinary.uploader.upload(
                    req.files.productImage.tempFilePath,
                    { 
                        folder: "pharmacy-products/"
                    })

                    productUrl = fileUpload.secure_url
                }

                let productName = req.body.productName? req.body.productName.trim() : productExist.productName
                let productMeasure = req.body.productMeasure? req.body.productMeasure.trim() : productExist.productMeasure
                let productDescription = req.body.productDescription? req.body.productDescription.trim() : productExist.productDescription
                let productPrice = req.body.productPrice? req.body.productPrice.trim() : productExist.productPrice
                let productCategory = req.body.productCategory? req.body.productCategory.trim() : productExist.productCategory
                let productPercent = req.body.productPercent? req.body.productPercent.trim() : productExist.productPercent

                let updatedRecord = await Inventory.update({ 
                    productImage: productUrl,productName, productMeasure, productDescription, productPrice, productCategory,productPercent
                  }, {
                    where: {inventoryId: req.body.productId.trim()},
                    returning: true,
                    plain: true
                  })

                  return res.status(200).json({
                    message:'Successful'
                });
            }
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.update_category = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            categoryId: "required|string",
            categoryName: "required|string",
        })
        
        const matched = await v.check()
        if(matched){
            let productExist = await InventoryCategory.findOne({ where: {categoryId: req.body.categoryId.trim()}})
            if(productExist){
                let categoryName = req.body.categoryName? req.body.categoryName.trim() : productExist.categoryName

                let updatedRecord = await InventoryCategory.update({ 
                    categoryName
                  }, {where: {categoryId: req.body.categoryId.trim()},returning:true})

                  return res.status(200).json({
                    message:'Successful'
                });
            }
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.all_product_statistic = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 5
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await Inventory.findAll({
                limit:limit, offset:offset,
                where:{deleted:false},
                order:[['createdAt', 'DESC']],
                attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productDescription','productMeasure'],
                // include: [Inventory.Category]
                include: [
                    {
                        model: InventoryCategory,
                        as: "Category",
                        attributes: ['categoryId','categoryName']
                    }
                ]
            })
            // let j = company.map(e=>inventoryId)
            // console.log(page, company[0])
            return res.status(201).json({
                message:'Success',
                products:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

exports.open_a_product = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            inventoryId:"required|string"
        })
      
        const matched = await v.check()
        if(matched){
           
            const company = await Inventory.findOne({
                where:{inventoryId:req.params.inventoryId, deleted:false},
                attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productDescription','productMeasure'],
                include: [
                    {
                        model: InventoryCategory,
                        as: "Category",
                        attributes: ['categoryId','categoryName']
                    }
                ]
            })
            // console.log(company.Category.categoryId)
            if(company){
                const companyAll = await Inventory.findAll({
                    limit:4,
                    where:{productCategory:company.Category.categoryId},
                    attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productDescription','productMeasure'],
                    include: [
                        {
                            model: InventoryCategory,
                            as: "Category",
                            attributes: ['categoryId','categoryName']
                        }
                    ]
                })
                return res.status(200).json({
                    message:'Success',
                    related:companyAll,
                    product:company
                });
            }
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}
exports.all_categories = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await InventoryCategory.findAll({
                limit:limit, offset:offset,
                where:{},
                attributes: ['categoryId','categoryName']
            })
            // console.log(company)
            return res.status(200).json({
                message:'Success',
                categories:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

exports.all_consultants = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await UsersInformation.findAll({
                limit:limit, offset:offset,
                where:{isConsultant:true},
                attributes: ['userId','firstName', 'lastName', 'email', 'phone','profileImage']
            })
            return res.status(201).json({
                message:'Success',
                consultants:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}
exports.save_location = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            locationState: "required|string|minLength:1",
            locationAddress: "required|string|minLength:1",
            locationLocalGovt: "required|string|minLength:1",
        })
        const matched = await v.check()
        if(!matched){
            return res.status(412).json({
                message:'Invalid Data Input'
            });
        }else{
            let locationId = uuidv4();
            //create new user
            let location = await DeliveryLocation.create(
            {
                locationState : req.body.locationState.trim(),
                locationAddress : req.body.locationAddress.trim(),
                locationLocalGovt : req.body.locationLocalGovt.trim(),
                customerId : req.userInfo.userId,
                locationId
            });
            return res.status(200).json({
                message:'Created',
                location
            });
        }
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.all_locations = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await DeliveryLocation.findAll({
                limit:limit, offset:offset,
                where:{customerId:req.userInfo.userId},
                attributes: ['locationId','locationState', 'locationAddress', 'locationLocalGovt']
            })
            return res.status(200).json({
                message:'Success',
                locations:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}
exports.all_my_orders = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await TransactionReceipt.findAll({
                limit:limit, offset:offset,
                where:{customerId:req.userInfo.userId},
                attributes: ['receiptId','paymentType','createdAt'],
                include: [
                    {
                        model: DeliveryLocation,
                        as: "DeliveryLocation",
                        attributes: ['locationAddress','locationState', 'locationLocalGovt'],
                    },
                    {
                        model: Transaction,
                        as: "Items",
                        attributes: ['productId','quantity', 'unitPrice'],
                        include:{
                                model: Inventory,
                                as: "productInfo",
                                attributes: ['productName', 'productDescription','productMeasure'],
                                include:{
                                    model: InventoryCategory,
                                    as: "Category",
                                    attributes: ['categoryName'],
                                }
                        }
                    }
                ]
            })
            return res.status(200).json({
                message:'Success',
                orders:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

exports.save_new_orders = async (req,res,next)=>{
    const t = await db.sequelize.transaction();
    try {
        const v = new Validator(req.body, {
            orders:"required|array",
            locationId:"required|string", 
            paymentType:"required|string",
        })

        
        const matched = await v.check()
        console.log(v.errors)
        if(matched){
            //create receipt
            let receiptId = uuidv4();
            let receipt  = await TransactionReceipt.create({
                locationId:req.body.locationId.trim(),
                paymentType:req.body.paymentType.trim(),
                customerId:req.userInfo.userId,
                receiptId
            },{ transaction: t })
            let allOrders = req.body.orders
            //save all the orders
            // const captains = await Captain.bulkCreate([
            //     { name: 'Jack Sparrow' },
            //     { name: 'Davy Jones' }
            //   ]);
            for(let i = 0, j = allOrders.length; i < j; i++ ){
                let receipty  = await Transaction.create({
                    transactionReceipt:receipt.receiptId,
                    productId:allOrders[i].productId,
                    quantity:allOrders[i].quantity,
                    unitPrice:allOrders[i].unitPrice
                },{ transaction: t })
            }
            await t.commit();
            return res.status(200).json({
                message:'Success',
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

//wishlist
exports.add_to_wish_list = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            productId:"required|string"
        })
        const matched = await v.check()
        console.log(v.errors)
        if(matched){
            let wishExist = await WishList.findOne({ 
                    where: {
                        productId: req.body.productId.trim(), 
                        customerId : req.userInfo.userId
                    }
                }
            )
            if(!wishExist){
                let receipt  = await WishList.create({
                    productId: req.body.productId.trim(),
                    customerId:req.userInfo.userId
                })
                return res.status(200).json({
                    message:'Success',
                });
            }
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

exports.remove_from_wish_list = async (req,res,next)=>{
    try {
        // console.log(req.body)
        const v = new Validator(req.body, {
            wishId:"required|string"
        })
        const matched = await v.check()
        console.log(v.errors)
        if(matched){
            let deleteItem =  await WishList.destroy({
                where: {
                    id: req.body.wishId.trim(), 
                    customerId : req.userInfo.userId
                }
            });
            return res.status(200).json({
                message:'Success',
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}


exports.all_my_wishlist = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            page:"required|decimal"
        })
      
        const matched = await v.check()
        if(matched){
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await WishList.findAll({
                limit:limit, offset:offset,
                where:{customerId:req.userInfo.userId},
                attributes: ['id'],
                include:{
                        model: Inventory,
                        as: "productInfo",
                        attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productDescription','productMeasure'],
                        include:{
                            model: InventoryCategory,
                            as: "Category",
                            attributes: ['categoryName'],
                        }
                    }
            })
            return res.status(200).json({
                message:'Success',
                wishlist:company
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error.name
        });
    }
}

exports.search_user = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            search: "required|string",
        })
        const matched = await v.check()
        if(matched){
            let userExist = await UsersInformation.findAll({ where: {
                    [Op.or]: [
                        {email: { [Op.substring]:req.body.search.trim()}},
                        {firstName: { [Op.substring]:req.body.search.trim()}},
                        {lastName: { [Op.substring]:req.body.search.trim()}},
                        {phone: { [Op.substring]:req.body.search.trim()}},
                    ]
                }
            })
            return res.status(200).json({
                message:'Created',
                userInformation:userExist
            });
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}


exports.search_products = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            search: "required|string",
        })
        const matched = await v.check()
        if(matched){
            let userExist = await Inventory.findAll({ where: {
                    [Op.and]: [
                        {productName: { [Op.substring]:req.body.search.trim()}},
                        {deleted:false}
                    ]
                }, 
                attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productMeasure','productDescription'],
                include: [
                    {
                        model: InventoryCategory,
                        as: "Category",
                        attributes: ['categoryId','categoryName']
                    }
                ]
            })
            return res.status(200).json({
                message:'Created',
                products:userExist
            });
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.delete_a_products = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            inventoryId: "required|string",
        })
        const matched = await v.check()
        if(matched){
            let userExist = await Inventory.update({deleted:true},
                { where: {inventoryId:req.params.inventoryId.trim()},returning: true})

            return res.status(200).json({
                message:'Success',
                products:userExist[1][0]
            });
        }
        return res.status(422).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

//product fetching
exports.testing_fetches = async (req,res,next)=>{
    try {
        console.log(req.body)
        const v = new Validator(req.body, {
            filter: "required|object",
            page: "required|decimal",
        })
        const matched = await v.check()
        if(matched){
            let limit = 10
            let page = req.body.page
            let offset = (page - 1) * limit
            
            let condition = {}
            //t f
            if(req.body.filter.category != 'All' && req.body.filter.range == null ){
                condition =  {productCategory:req.body.filter.category}
            }
            // f t
            if(req.body.filter.category == 'All' && req.body.filter.range != null ){
                condition =  { 
                    productPrice:{
                        [Op.between]: [req.body.filter.range.start, req.body.filter.range.end]
                    }
                }
            }

            // t t
            if(req.body.filter.category != 'All' && req.body.filter.range != null ){
                console.log('e reach')
                condition =  {
                    [Op.and]: [
                     {productCategory:req.body.filter.category},
                     { 
                            productPrice:{
                                [Op.between]: [req.body.filter.range.start, req.body.filter.range.end]
                            }
                    } 
                    ]
                  }
            }
            
            console.log(condition)
            const products = await Inventory.findAll({
                limit:limit, offset:offset,
                where:condition,
                order:[['createdAt', 'DESC']],
                attributes: ['inventoryId','productName','productPrice', 'productImage','productPercent','productDescription','productMeasure'],
                include: [
                    {
                        model: InventoryCategory,
                        as: "Category",
                        attributes: ['categoryId','categoryName']
                    }
                ]
            })
            return res.status(200).json({
                message:'Success',products
            });
        }
        return res.status(406).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}



exports.record_for_insert = async (req,res,next)=>{
    // try {
        // let userExist = await UsersInformation.findAll({})
        //save all the orders
        // const captains = await UsersInformation.bulkCreate(users);

        const captains = await InventoryCategory.bulkCreate(categories);
        const captainsPro = await Inventory.bulkCreate(products);
        return res.status(200).json({
            message:'Success',users
        });
    // } catch (error) {
    //     return res.status(500).json({
    //         message:'Fail',
    //         error:error
    //     });
    // }
}

//chats
//fetch all consultant
exports.chat_consultants = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            toUserId: "required|string|minLength:1",
            isConsultant: "required|boolean",
        })
        const matched = await v.check()
        if(matched){
            let userExist = []
            if(req.body.isConsultant === false){
                //if user is not a consultant fetch only consultants for him -> he can only chat with consultants
                userExist = await db.sequelize.query(
                    'SELECT "online", "lastName","isConsultant", "firstName","phone","profileImage","userId", COUNT("content") as unreadMessage FROM "UsersInformations" U LEFT JOIN "Conversations" C ON U."userId" = C."fromUserId" AND "toUserRead" = false and  "toUserId"= :toUserId  WHERE "isConsultant" = true and "userId" <> :userId and "status" = true GROUP BY "userId" ORDER BY unreadMessage desc',
                    {
                        replacements: { toUserId: req.params.toUserId.trim(),userId: req.params.toUserId.trim() },
                        type: QueryTypes.SELECT
                    }
                );

            }else{

                //if user is a consultant fetch all users for him
                userExist = await db.sequelize.query(
                    'SELECT "online", "lastName","firstName","isConsultant","phone","profileImage","userId", COUNT("content") as unreadMessage FROM "UsersInformations" U LEFT JOIN "Conversations" C ON U."userId" = C."fromUserId" AND "toUserRead" = false and  "toUserId"= :toUserId  WHERE "userId" <> :userId and "status" = true GROUP BY "userId" ORDER BY unreadMessage desc',
                    {
                        replacements: { toUserId: req.params.toUserId.trim(),userId: req.params.toUserId.trim() },
                        type: QueryTypes.SELECT
                    }
                );
            }
            return res.status(200).json({
                message:'Created',
                userInformation:userExist
            });
        }
        return res.status(412).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}


//fetch all consultant
exports.fetch_users_messages = async (req,res,next)=>{
    try {
        const v = new Validator(req.params, {
            userId: "required|string|minLength:1",
            page: "required|decimal",
        })
        const matched = await v.check()
        if(matched){
            let limit = 5
            let page = req.params.page
            let offset = (page - 1) * limit
            // const chats = await Conversation.findAll({
            //     limit:limit, offset:offset,
            //     where:{
            //         [Op.or]: [
            //             {
            //                 [Op.and]:[
            //                     {toUserId:req.params.userId},
            //                     {fromUserId:req.userInfo.userId}
            //                 ]
            //             },
            //             {
            //                 [Op.and]:[
            //                     {toUserId:req.userInfo.userId},
            //                     {fromUserId:req.params.userId}
            //                 ]
            //             },
            //         ]
            //     },
            //     order:[['createdAt', 'DESC']],
            //     attributes: ['content','toUserId','fromUserId','id','toUserRead','fromUserRead'],
            //     include: [
            //         {
            //             model: UsersInformation,
            //             as: "toUser",
            //             attributes:['profileImage','firstName', 'lastName']
            //         },{
            //             model: UsersInformation,
            //             as: "fromUser",
            //             attributes:['profileImage','firstName', 'lastName']
            //         }
            //     ]
            // })

            let query = `SELECT "Conversation"."content", "Conversation"."toUserId", "Conversation"."fromUserId", "Conversation"."id", "Conversation"."toUserRead", "Conversation"."fromUserRead","Conversation"."createdAt", "toUser"."userId" As "toUser.userId" , "toUser"."profileImage" AS "toUser.profileImage", "toUser"."firstName" AS "toUser.firstName", "toUser"."lastName" AS "toUser.lastName", 
            "fromUser"."userId" AS "fromUser.userId", "fromUser"."profileImage" AS "fromUser.profileImage" , "fromUser"."firstName" AS "fromUser.firstName","fromUser"."lastName" AS "fromUser.lastName"  FROM "Conversations" AS "Conversation" LEFT OUTER JOIN "UsersInformations" AS "toUser" ON "Conversation"."toUserId" = "toUser"."userId" LEFT OUTER JOIN "UsersInformations" AS "fromUser" ON "Conversation"."fromUserId" = "fromUser"."userId" WHERE (("Conversation"."toUserId" = '${req.params.userId.trim()}' AND "Conversation"."fromUserId" = '${req.userInfo.userId}') OR ("Conversation"."toUserId" = '${req.userInfo.userId}' AND "Conversation"."fromUserId" = '${req.params.userId.trim()}')) ORDER BY "Conversation"."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`

            const chats = await db.sequelize.query(query,
                {
                    type: QueryTypes.SELECT
                }
            )
            // console.log(chats)
            return res.status(200).json({
                message:'Successful',
                chats
            });
        }
        return res.status(412).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.add_chat = async (req,res,next)=>{
    try {
        const v = new Validator(req.body, {
            content: "required|string|minLength:1",
            toUserId: "required|string|minLength:1",
        })
        const matched = await v.check()
        if(matched){
            // fromUserId,toUserId,content,fromUserRead,toUserRead
            let chat = await Conversation.create(
            {
                content : req.body.content.trim(),
                fromUserId:req.userInfo.userId,fromUserRead:true,
                toUserId:req.body.toUserId.trim()
            });
            return res.status(200).json({
                message:'Created',
                chat
            });
        }
        return res.status(412).json({
            message:'Fail'
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}