const express = require('express');
const bodyParser = require('body-parser');
const dbHelpers = require('./../db/db-helpers.js') //db/db-helpers.js
require('newrelic');


const app = express();
const PORT = 3030;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true,
}))

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.send('Working...')
})

app.get('/products', (req, res) => {
  let count = req.query.count || 5;
  let page = req.query.page || 0;

  dbHelpers.getAllProducts(count, page, (result) => {
    for (let i = 0; i < result.length; i++) {
      result[i].id = Number(result[i]._id);
      delete result[i]._id;
    }
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
    result.id = result._id;
    delete result._id
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
      let { name, sale_price, original_price, default_style, photos, skus } = result;
      for (let i = 0; i < photos.length; i++) {
        photos[i] = {
          "thumbnail_url": photos[i][1],
          "url": photos[i][0]
        }
      }
      if (sale_price === 'null') {
        sale_price = null;
      } else {
        sale_price+= '.00'
      }

      original_price+='.00'

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

app.get('/loaderio-0bc13ac6abc22d8f6fb58a7f83ed169b', (req, res) => {
  res.render()
})

app.listen(PORT, () => {
  console.log(`Listening to app on port ${PORT}`)
})

module.exports = app
