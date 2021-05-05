const csv = require('csv-parser');
const fs = require('fs');

const result = [];
const productsOne = [];
const relatedOne = [];
let currentProd = 1;
let current = [];

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
          }).on('end', () => {
            for (let i = 0; i < productsOne.length; i++) {
              productsOne[i].related_product = relatedOne[i];
            }
            console.log(productsOne)
          })
            });




console.log(productsOne.length === relatedOne.length)



