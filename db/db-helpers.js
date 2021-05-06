var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

module.exports = {
  getAllProducts: function(count, page, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      }
      var dbo = db.db("mydb");
      dbo.collection("products").find({}).limit(count).skip(page).toArray(function(err, res) {
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
        delete item.related_product
        callback(item)
        db.close();
      })
    })
  },
  getStyles: function(product_id, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log('here')
        throw err;
      }
      var dbo = db.db("mydb");
      dbo.collection("styles").find({productId: `${product_id}`}).toArray(function(err, item) {
        console.log('here')
        // const { name, sale_price, original_price, default_style, photos, skus } = item;
        // for (let i = 0; i < photos.length; i++) {
        //   photos[i] = {
        //     "thumbnail_url": photos[i][1],
        //     "url": photos[i][0]
        //   }
        // }
        // const newObj = {
        //   product_id: item.productId,
        //   results: [
        //     {
        //       style_id: item._id,
        //       name,
        //       sale_price,
        //       original_price,
        //       default: default_style,
        //       photos,
        //       skus
        //     }
        //   ]
        // }
        callback(item)
        db.close();
      })
    })
  }
}