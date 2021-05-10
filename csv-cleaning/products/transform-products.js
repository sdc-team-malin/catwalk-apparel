const csv = require('csv-parser');
const fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017/mydb";

let count = 0
const result = [];
const productsOne = [];
const relatedOne = [];
const featuresOne = [];
let currentProd = 1;
let current = [];
let current1 = [];

fs.createReadStream('csv-cleaning/products/product.csv')
  .pipe(csv())
  .on('data', (row) => {
      if (Object.values(row).length !== 6) {
          row.default_price = row.category
          row.category = row.description
          row.description = row.slogan
          row.slogan = '';
        }
        if (row.default_price[0] ==='$') {
            row.default_price = row.default_price.slice(1)
          }
          productsOne.push(row)
        })
        .on('end', () => {
          fs.createReadStream('csv-cleaning/products/related.csv')
          .pipe(csv())
          .on('data', row => {
            if (row.current_product_id !== currentProd.toString()) {
              relatedOne.push(current)
              currentProd++;
              current = [];
            }
            if (row.current_product_id === currentProd.toString()) {
              current.push(row.related_product_id)
            }
            if (currentProd === 1000011) {
              relatedOne.push(['275004', '93556', '125885', '166656', '875619', '592637'])
            }
          }).on('end', () => {
            currentProd = 1;
            fs.createReadStream('csv-cleaning/products/features.csv')
            .pipe(csv())
            .on('data', row => {
              if (row.product_id !== currentProd.toString()) {
                featuresOne.push(current1);
                currentProd++;
                current1 = [];
              }
              if (row.product_id === currentProd.toString()) {
                current1.push({
                  feature: row.feature,
                  value: row.value
                })
              }
              if (currentProd === 1000011) {
                current1 = [{
                  feature: row.feature,
                  value: row.value
                }]
                featuresOne.push(current1)
              }

            }).on('end', () => {
            let i;
            for (i = 0; i < productsOne.length; i++) {
              if (relatedOne[productsOne[i].id] === undefined) {
                count++
                console.log(productsOne[i].id)
              }
              // console.log(relatedOne[productsOne[i].id])
              productsOne[i].related_product = relatedOne[productsOne[i].id];
              productsOne[i]._id = productsOne[i].id;
              productsOne[i].features = featuresOne[productsOne[i].id]
              delete productsOne[i].id;
            }
            console.log(i)
            MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("mydb");
              dbo.collection("products").insertMany(productsOne, function(err, res) {
                if (err) throw err;
                console.log('Added data');
                db.close();
              });
            })
            });
          })
        });








