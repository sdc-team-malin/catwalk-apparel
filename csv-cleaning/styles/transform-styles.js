const fs = require('fs');
const csv = require('csv-parser');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017/mydb";

const result = [];
const photos = [];
const skus = [];
let currentPhotos = [];
let currentStyles = [];
let currentSkus = [];
let currentProd = 1;
let count = 0;
const missing = [];
let flag = false;

fs.createReadStream('csv-cleaning/styles/styles.csv')
  .pipe(csv())
  .on('data', row => {
    if (Object.keys(row).length !== 6) {
      row.default_style = '0'
    }
    if (Object.keys(row).length !== 6) {
      count++
    }
    if (row.sale_price[0] === '$') {
      row.sale_price = row.sale_price.slice(1)
    }
    if (row.original_price[0] === '$') {
      row.original_price = row.original_price.slice(1)
    }
    if (currentProd.toString() === row.id) {
      // console.log(row.id)
      result.push(row)
      currentProd++
    } else {
      const noId = {
        id: currentProd,
        productId: null,
        name: null,
        sale_price: null,
        original_price: null,
        default_style: null
      }
      result.push(noId);
      result.push(row);
      currentProd+=2;
    }

  })
  .on('end', () => {
    console.log(result.length, count)
    // for (let i = 0; i < result.length; i++) {
    //   result[i].skus = {}
    // }
    currentProd = 1
    let trigger = true;
    fs.createReadStream('csv-cleaning/styles/photos.csv')
    .pipe(csv())
    .on('data', row => {
      if (Object.keys(row).length !== 4) {
          row.thumbnail_url = ''
      }
      // have to do all photos cause not every style has photos
      if (currentProd.toString() !== row.styleId) {
        photos.push(currentPhotos);
        currentProd++
        currentPhotos = [];
      }
      if (currentProd.toString() === row.styleId) {
        currentPhotos.push([row.url, row.thumbnail_url])
      }
      // result[currentProd].photos.push([row.url, row.thumbnail_url])

      if (currentProd === 1958102 && trigger) {
        trigger = false
        photos.push([
          ["https://images.unsplash.com/photo-1554921148-83d8ceda2095?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80","https://images.unsplash.com/photo-1553830591-d8632a99e6ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"],
          [
            "https://images.unsplash.com/photo-1490723286627-4b66e6b2882a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80","https://images.unsplash.com/photo-1447879027584-9d17c2ca0333?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80"
          ],
          [
            "https://images.unsplash.com/photo-1548861216-17dd1ac80d5f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=664&q=80","https://images.unsplash.com/photo-1553830591-2f39e38a013c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          ],
          [
            "https://images.unsplash.com/photo-1447958272669-9c562446304f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2800&q=80","https://images.unsplash.com/photo-1454177643390-7f100d1bbeec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80"
          ]
        ])
      }
      // let index;
      // result[row.styleId] ? index = result[row.styleId].id - 1 : null;
      // // console.log(Number(result[row.styleId].id) - 1, typeof row.styleId)
      //   result[index].photos.push([row.url, row.thumbnail_url]
      //   )
      // console.log(result[row.styleId])
    }).on('end', () => {
      trigger = true;
      currentProd = 1;
      fs.createReadStream('csv-cleaning/styles/skus.csv')
      .pipe(csv())
      .on('data', row => {
        if (currentProd.toString() !== row.styleId) {
          skus.push(currentSkus);
          currentProd++
          currentSkus = {};
        }
        if (currentProd.toString() === row.styleId) {
          const sku = {
          size: row.size,
          quantity: row.quantity
        }
          const rowId = row.id
          currentSkus[rowId] = sku;
        }
        if (currentProd === 1958102) {
          let last = {
          '11323907': { size: "7", quantity: '38' },
          '11323908': { size: "7.5", quantity: '12' },
          '11323909': { size: "8", quantity: '17' },
          '11323910': { size: "8.5", quantity: '0' },
          '11323911': { size: "9", quantity: '5' },
          '11323912': { size: "9.5", quantity: '29' },
          '11323913': { size: "10", quantity: '15' },
          '11323914': { size: "10.5", quantity: '37' },
          '11323915': { size: "11", quantity: '33' },
          '11323916': { size: "11.5", quantity: '41' },
          '11323917': { size: "12", quantity: '53' }
          }
          skus.push(last)
        }

      }).on('end', () => {
      for (let i = 0; i < photos.length; i++) {
        result[i].photos = photos[i];
        result[i].skus = skus[i]
        result[i]._id = result[i].id;
        delete result[i].id;
      }
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("styles").insertMany(result, function(err, res) {
          if (err) throw err;
          console.log('Added data');
          db.close();
        });
      })
    })
    })
  })



