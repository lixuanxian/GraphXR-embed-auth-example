"use strict";

let fs = require("fs");
let path = require("path");
let Sequelize = require("sequelize");
let env = process.env.NODE_ENV || "development";
let appConfig = require("../config/config.json")[env];
let sequelize = new Sequelize(
  appConfig.db.database,
  appConfig.db.username,
  appConfig.db.password,
  appConfig.db
);
let db = {};

fs.readdirSync(__dirname)
  .filter(function (file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function (file) {
    let model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
