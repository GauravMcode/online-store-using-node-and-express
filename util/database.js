const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient; //declare mongo client constructor

let _db; //to access the connected database

const mongoclient = (callback) => {
    MongoClient.connect('mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/shop?retryWrites=true&w=majority')   //the uri generated in mongodb
        .then(client => {
            console.log('mongoDb connected...');
            _db = client.db()   //The name of the database we want to use. If not provided, use database name from connection string.(e.g: shop here)
            callback();
        })
        .catch(err => { console.log(err) })
}

const getdb = () => {   //to access that connection pool created once; otherwise mongoclient function would have created  new connection everytime
    if (_db) {
        return _db;  //return the database instance
    }
    throw 'not connected to database';
}

exports.mongoclient = mongoclient;
exports.getdb = getdb;