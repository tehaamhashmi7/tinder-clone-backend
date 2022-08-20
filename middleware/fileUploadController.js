const User = require('../models/cards')

const singleFileUpload = async (req, res, next) => {
    try{
        const user = new User({
            name: req.body.name,
            image: {
                name: req.file.originalname,
                path: req.file.path,
                type: req.file.mimetype,
                size: req.file.size
            }
        });

        await user.save()
        console.log(file)
        res.status(201).send("File uploaded")
    } catch (error) {
        res.status(400).send(error.message)
    }
}

module.exports = {singleFileUpload}