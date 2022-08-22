const Card = require("../models/cards");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const fetchUser = require("../middleware/fetchUser");
const  { body, validationResult } = require("express-validator");

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
      res.status(201).json({ success, token: jwtData });
    }
  } catch (err) {
    res.status(500).json({ success, error: err.message });
  }
});


// LOGIN

router.post(
  "/login",
  [
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password must be entered").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false
    // If the teacher fails validation
    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      // Checking if the user exists in database
      let foundUser = await Card.findOne({ email: req.body.email }).select(['_id', 'email', 'password'])

      if (!foundUser) {
        return res.status(404).json({success, error: "Credentials do not match" });
      }

      const passwordCompare = await bcrypt.compare(
        req.body.password,
        foundUser.password
      );

      if (!passwordCompare) {
        return res.status(400).json({success, data: "Credentials do not match" });
      }

      //Generating an auth token
      const payload = {
        user: {
          id: foundUser._id,
        },
      };

      const jwtData = jwt.sign(payload, "test_secret");
      console.log(jwtData);
      success = true
      res.json({success, token: jwtData });
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
);


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


// GET USER PROFILE


router.get('/profile', fetchUser, async (req, res) => {
  let success = false
  try {
    const userId = req.user.id
    const userExists = await Card.findOne({_id: userId})
    if(!userExists) {
      res.status(401).json({success})
    }
      const ourUser = await Card.find({_id: userId }).select([
        'name',
        'image',
        'email'
      ])
      if(ourUser) {
          success = true
          res.status(200).json({success, ourUser})
      }
  } catch(err) {
      res.status(500).json({success, error: err.message})
  }
})


module.exports = router;
