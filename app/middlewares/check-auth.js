// const {Sequelize,Op} = require('sequelize');
const {UsersInformation} = require('../../models/index');
const jwt = require('jsonwebtoken');

module.exports.check_is_admin = async (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.MY_HASH_SECRET);
        let userExist = await UsersInformation.findOne({ where: {userId: decoded.userId}})
        if(userExist){
            if(userExist.status && userExist.isAdmin){
                req.userInfo = userExist
                next();
            }else{
                res.status(422).json({
                    message:'Authentication Fail'
                });
            }
        }else{
            res.status(422).json({
                message:'Authentication Fail'
            });
        }
        
    }catch(error){
        res.status(422).json({
            message:'Authentication Fail'
        });
    }
}

module.exports.check_is_consultant = async (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.MY_HASH_SECRET);
        let userExist = await UsersInformation.findOne({ where: {userId: decoded.userId}})
        if(userExist){
            if(userExist.status && userExist.isConsultant){
                req.userInfo = userExist
                next();
            }else{
                res.status(422).json({
                    message:'Authentication Fail'
                });
            }
        }else{
            res.status(422).json({
                message:'Authentication Fail'
            });
        }
        
    }catch(error){
        res.status(422).json({
            message:'Authentication Fail'
        });
    }
}

module.exports.check_is_consultant_and_admin = async (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.MY_HASH_SECRET);
        let userExist = await UsersInformation.findOne({ where: {userId: decoded.userId}})
        if(userExist){
            if(userExist.status && userExist.isConsultant && userExist.isAdmin){
                req.userInfo = userExist
                next();
            }else{
                res.status(422).json({
                    message:'Authentication Fail'
                });
            }
        }else{
            res.status(422).json({
                message:'Authentication Fail'
            });
        }
        
    }catch(error){
        res.status(422).json({
            message:'Authentication Fail'
        });
    }
}

module.exports.check_is_Active = async (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.MY_HASH_SECRET);
        let userExist = await UsersInformation.findOne({ where: {userId: decoded.userId}})
        if(userExist){
            if(userExist.status){
                req.userInfo = userExist
                next();
            }else{
                res.status(422).json({
                    message:'Authentication Fail'
                });
            }
        }else{
            res.status(422).json({
                message:'Authentication Fail'
            });
        }
        
    }catch(error){
        res.status(422).json({
            message:'Authentication Fail'
        });
    }
}