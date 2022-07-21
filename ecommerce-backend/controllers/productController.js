const Product = require("../models/productModels");
const Errorhandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//create product --Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

  req.body.user = req.user.id;

  console.log( req.body.id)
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    result: product,
  });
});

//Get All Products
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    result: products,
    results:productCount
  });
});

//Get product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const productDetails = await Product.findById(req.params.id);

  if (!productDetails) {
    return next(new Errorhandler("product not found", 404));
  } else {
    res.status(200).json({
      success: true,
      result: productDetails,
      //productCount
    });
  }
});

//update products --Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: "product not found",
    });
  } else {
    var productUpdate = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      result: productUpdate,
    });
  }
});

//Delete product
exports.deleteProduct = catchAsyncError(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: "product not found",
    });
  } else {
    var productDelete = await Product.deleteOne();

    res.status(200).json({
      success: true,
      result: productDelete,
      message: "product delete successfully",
    });
  }
});
