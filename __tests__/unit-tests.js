const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const routes = require('./../server/index.js');
const mockData = require('./../assets/mockData');
const dbCall = require('./../db/db-helpers');

const mockProducts = mockData.products;
const mockStyles = mockData.styles;
const mockRelated = mockData.related;

