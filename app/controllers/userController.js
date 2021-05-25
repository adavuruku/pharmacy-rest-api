const {Sequelize,Op} = require('sequelize');
const { Validator } = require('node-input-validator')
const db = require('../../models');
const argon2 = require('argon2')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const {UsersInformation,InventoryCategory,Inventory,TransactionReceipt,Transaction,DeliveryLocation} = require('../../models/index');

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
            console.log(productExist.productImage)
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

                let updatedRecord = await Inventory.update({ 
                    productImage: productUrl,productName, productMeasure, productDescription, productPrice, productCategory
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
                  }, {where: {categoryId: req.body.categoryId.trim()}})

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
            let limit = 20
            let page = req.params.page
            let offset = (page - 1) * limit
            const company = await Inventory.findAll({
                limit:limit, offset:offset,
                where:{},
                attributes: ['inventoryId','productName','productImage','productDescription','productName','productMeasure'],
                // include: [Inventory.Category]
                include: [
                    {
                        model: InventoryCategory,
                        as: "Category",
                        attributes: ['categoryId','categoryName']
                    }
                ]
            })
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
            return res.status(201).json({
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
                attributes: ['userId','firstName', 'lastName', 'email', 'phone']
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
                attributes: ['receiptId','paymentType'],
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