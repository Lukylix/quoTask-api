const mongoose = require("mongoose");

const DB = {
  config: {
    host: process.env.DB_HOST || "mongo", // docker internal virtual network
    port: process.env.DB_PORT || 27017,
    database: process.env.DB_DATABASE || "quotask",
  },
  options: {
    //Use new connection string for MongoDB driver
    useNewUrlParser: true,
    //Use new Server Discover and Monitoring engine
    useUnifiedTopology: true,
  },
  get uri() {
    return `mongodb://${this.config.host}:${this.config.port}/${this.config.database}`;
  },
};

//Initialise mongoose connection and handle initial error
mongoose.connect(DB.uri, DB.options).catch((err) => console.error(err));
//Handle errors after initial connection
mongoose.connection.on("error", (err) => console.error(err));
//Listen for the first emit of the "open" event (equivalent to the connected event)
mongoose.connection.once("open", () => console.log("Connection succes !"));

module.exports = mongoose;
