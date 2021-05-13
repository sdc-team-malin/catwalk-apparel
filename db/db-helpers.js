var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017/mydb";

module.exports = {
  getAllProducts: function(count, page, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      }
      var dbo = db.db("mydb");
      dbo.collection("products").find({}).limit(Number(count)).skip(page*count).toArray(function(err, res) {
        if (err) throw err;
        for (let i = 0; i < count; i++) {
          delete res[i].related_product;
        }
        callback(res)
        db.close();
      });
    })
  },
  getOneProduct: function(index, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      }
      var dbo = db.db("mydb");
      const result = dbo.collection("products").findOne({_id: `${index}`}, function(err, item) {
        if (err) {
          throw err
        }
        if (!item) {
          callback([]);
          db.close();
          return
        }
        delete item.related_product
        callback(item)
        db.close();
      })
    })
  },
  getStyles: function(product_id, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      }
      var dbo = db.db("mydb");
      dbo.collection("styles").find({productId: `${product_id}`}).toArray(function(err, item) {
        if (err) {
          throw err
        }
        callback(item)
        db.close();
      })
    })
  },

  getRelatedItems: function(index, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      }
      var dbo = db.db("mydb");
      const result = dbo.collection("products").findOne({_id: `${index}`}, function(err, item) {
        if (err) {
          throw err;
        }
        if (!item) {
          callback([]);
          db.close();
          return;
        }
        callback(item.related_product)
        db.close();
      })
    })
  }
}