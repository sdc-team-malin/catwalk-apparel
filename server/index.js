const express = require('express');
const bodyParser = require('body-parser');
const dbHelpers = require('./../db/db-helpers.js') //db/db-helpers.js

const app = express();
const PORT = 3030;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true,
}))

app.get('/products', (req, res) => {
  let count = req.query.page || 5;
  let page = req.query.page || 0;

  dbHelpers.getAllProducts(count, page, (result) => {
    res.json(result)
  })
})

app.get('/products/:product_id', (req, res) => {
  const product_id = req.params.product_id;
  dbHelpers.getOneProduct(product_id, (result) => {
    if (!result._id) {
      res.json([])
      return;
    };
    res.json(result)
  })
})

app.get('/products/:product_id/styles', (req, res) => {
  const product_id = req.params.product_id;
  dbHelpers.getStyles(product_id, (results) => {
    if (!results.length) {
      res.json([])
      return;
    };
    const allStyles = {
      'product_id': results[0].productId,
      results: []
    }

    results.map(result => {
      const { name, sale_price, original_price, default_style, photos, skus } = result;
      for (let i = 0; i < photos.length; i++) {
        photos[i] = {
          "thumbnail_url": photos[i][1],
          "url": photos[i][0]
        }
      }
      let currentDefault;
      if (default_style === '1') {
        currentDefault = true;
      } else {
        currentDefault = false;
      }
      const oneStyle = {
        style_id: result._id,
        name,
        sale_price,
        original_price,
        'default': currentDefault,
        photos,
        skus
      }
      allStyles.results.push(oneStyle)
    })

    res.json(allStyles);
  })
})

app.get('/products/:product_id/related', (req, res) => {
  const productId = req.params.product_id;

  dbHelpers.getRelatedItems(productId, (result) => {
    if (!result.length) {
      res.json([])
      return;
    };
    res.json(result)
  })
})

app.listen(PORT, () => {
  console.log(`Listening to app on port ${PORT}`)
})
