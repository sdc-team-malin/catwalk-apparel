// const sinon = require('sinon');
// const chai = require('chai');
// const expect = chai.expect;
// const mocha = require('mocha')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017/mydb";
const supertest = require('supertest');
const app = require('../server/index')

const routes = require('./../server/index.js');
const mockData = require('./../assets/mockData');
const dbCall = require('./../db/db-helpers');

const mockProducts = mockData.products;
const mockStyles = mockData.styles;
const mockRelated = mockData.related;
// console.log(mockData.products)

describe("Connection", () => {
  beforeAll(async () => {
    await MongoClient.connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
  });

  test('retrieve a product', async () => {
    for (let prod in mockProducts) {
      let final;
      const result = await dbCall.getOneProduct(prod, (response) => {
        final = response;
        expect(final).toEqual(mockProducts[prod])
      })
    }
  })

  test('retrieve the first 5 products from mongo', async () => {
    const result = await dbCall.getAllProducts(5, 0, (res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].id = Number(res[i]._id);
        delete res[i]._id;
        expect(mockData.firstFive[i]).toEqual(res[i])
      }
    })
  })

  test('GET /products at defaults', async () => {

    await supertest(app).get('/products')
      .expect(200)
      .then((response) => {
        console.log(response.body)
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(5);
      })
  })

  // test('GET one product by ')

  afterAll(async done => {
    done();
  });
})

