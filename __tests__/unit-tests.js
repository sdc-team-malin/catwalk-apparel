// const sinon = require('sinon');
// const chai = require('chai');
// const expect = chai.expect;
// const mocha = require('mocha')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

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

  test('retrieve the first 5 products', async () => {
    const result = await dbCall.getAllProducts(5, 0, (res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].id = Number(res[i]._id);
        delete res[i]._id;
        expect(mockData.firstFive[i]).toEqual(res[i])
      }
    })
  })

  afterAll(async done => {
    done();
  });
})

