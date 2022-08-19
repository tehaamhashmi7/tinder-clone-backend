const mongoose = require("mongoose");
const connectionUrl =
  "mongodb+srv://tehaamdbarif:Arif717612@cluster0.noqmp9q.mongodb.net/tinderdb?retryWrites=true&w=majority";

const connectToServer = () => {
  mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, console.log("Connected to mongodb"))
};


module.exports = connectToServer