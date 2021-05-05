const fs = require('fs');
const csv = require('csv-parser');

const result = [];
const photos = [];
let currentPhotos = [];
let currentStyles = [];
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
    for (let i = 0; i < result.length; i++) {
      result[i].photos = [];
      result[i].skus = {}
    }
    console.log(result.length, count)
    currentProd = 1
    fs.createReadStream('csv-cleaning/styles/photos.csv')
    .pipe(csv())
    .on('data', row => {
      if (Object.keys(row).length !== 4) {
          row.thumbnail_url = ''
      }
      // have to do all photos cause not every style has photos
      // if (currentProd.toString() !== row.styleId) {
      //   photos.push(currentPhotos);
      //   currentProd++
      //   currentPhotos = [];
      // }
      // if (currentProd.toString() === row.styleId) {
      //   currentPhotos.push([row.url, row.thumbnail_url])
      // }
      // console.log(row)
      result[row.styleId].photos.push([row.url, row.thumbnail_url])
      // console.log(result[row.styleId])
    }).on('end', () => {
      fs.createReadStream('csv-cleaning/styles/skus.csv')
      .pipe(csv())
      .on('data', row => {
        const rowId = row.id
        const sku = {
          size: row.size,
          quantity: row.quantity
        }
        result[row.styleId].skus.rowId = sku;
        console.log(result[row.styleId])
      }
    })
  })



