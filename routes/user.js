const Card = require("../models/cards");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const fetchUser = require("../middleware/fetchUser");

// DEFINING DIRECTORY TO SAVE THE UPLOADED IMAGE

const multerConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    // LOOKING FOR EXTENSION

    const ext = file.mimetype.split("/")[1];
    callback(null, `image_${Date.now()}.${ext}`);
  },
});

// CHECK IF THE FILE IS IMAGE OR NOT

const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Only Image is Allowed..."));
  }
};

// SETTING UP STORAGE

const upload = multer({
  storage: multerConfig,
});

const uploadImage = upload.single("image");

// REGISTRATION - NO AUTHENTICATION REQUIRED

router.post("/add", uploadImage, async (req, res) => {
  let success = false;
  try {
    let foundUser = await Card.findOne({ email: req.body.email });

    if (foundUser) {
      res.status(401).json({ success, error: "This user already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);

      let user = new Card({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
        dob: req.body.dob,
        image: {
          contentType: "image/png",
          data: fs.readFileSync(
            path.join(
              "E:\\React-projects\\tinder-backend" +
                "/uploads/" +
                req.file.filename
            )
          ),
        },
      });

      const data = {
        user: {
          id: user._id,
        },
      };

      const jwtData = jwt.sign(data, "test_secret");
      console.log(jwtData);

      await user.save();

      success = true;
      res.status(200).json({ success, token: jwtData });
    }
  } catch (err) {
    res.status(500).json({ success, error: err.message });
  }
});


// LOGIN

router.post('/login', async(req, res) => {
  let success = false
  try {
    const foundUser = await Card.findOne({email: req.body.email})
    if(!foundUser) {
      res.status(404).json({success, error: "User does not exist, please register"})
    } else {
      const data = {
        user: {
          id: foundUser._id,
        },
      };

      const jwtData = jwt.sign(data, "test_secret");
      console.log(jwtData);

      success = true
      res.status(200).json({success, token: jwtData})

    }

  } catch(error) {
    res.status(500).send(error.message)
  }
})


// GETTING ALL USERS - AUTHENTICATION REQUIRED

router.get('/all', fetchUser, async (req, res) => {
    let success = false
    try {
      const userId = req.user.id
      const userExists = await Card.findOne({_id: userId})
      if(!userExists) {
        res.status(401).json({success})
      }
        const allUsers = await Card.find({_id: { $ne: userId }}).select([
          'name',
          'image'
        ])
        if(allUsers) {
            success = true
            res.status(200).json({success, allUsers})
        }
    } catch(err) {
        res.status(500).json({success, error: err.message})
    }
})

module.exports = router;
