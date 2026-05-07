const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Aliasing Middleware
exports.aliasTop3Cheapest = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'price';
  req.query.fields = 'name,price,category,seller,rating,image';

  req.customQuery = {
    limit: '3',
    sort: 'price',
    fields: 'name,price,category,seller,rating,image'
  };
  
  next(); 
};

// Task 1: Aggregation Pipeline
exports.getProductCategoryStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalPrice: { $sum: '$price' }
      }
    },
    {
      $sort: { numProducts: -1 } 
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const activeQuery = req.customQuery || req.query;

  const features = new APIFeatures(Product.find(), activeQuery)
    .filter()
    .sort()
    .limitFields()
    .paginate(); 

  const products = await features.query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({ status: 'success', data: { product: newProduct } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});