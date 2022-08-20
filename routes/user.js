const Card = require('../models/cards')
const express =require('express')
const router = express.Router()
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const multerConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/')
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1]
        callback(null, `image_${Date.now()}.${ext}`)
    }
})


const isImage = (req, file, callback) => {
    if(file.mimetype.startsWith('image')) {
        callback(null, true) } else { callback(new Error('Only Image is Allowed...')) }
    }


const upload = multer({
    storage: multerConfig
})

const uploadImage = upload.single('photo')


router.post('/add', uploadImage, async (req, res) => {

    let success = false
    try {
        let foundUser = await Card.findOne({email: req.body.email})

        if(foundUser) {
            res.status(401).json({success, error: "This user already exists"})
        } else {

            const salt = await bcrypt.genSalt(10)
            const secPassword = await bcrypt.hash(req.body.password, salt)

            let user = new Card({
                name: req.body.name,
                email: req.body.email,
                password: secPassword,
                dob: req.body.dob,
                image: {
                    contentType: 'image/png',
                    data: fs.readFileSync(path.join('E:\\React-projects\\tinder-backend' + '/uploads/' + req.file.filename))
                }
            })

            const data = {
                user: {
                    id: user._id
                }
            }

            const jwtData = jwt.sign(data, "test_secret");
            console.log(jwtData);

            await user.save()

            success = true
            res.status(200).json({success, user})
        }
    } catch(err) {
        res.status(500).json({success, error: err.message})
    } 
})


module.exports = router