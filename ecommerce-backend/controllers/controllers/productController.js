const Product = require("../models/productModels");
const Errorhandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//create product --Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;

  console.log(req.body.id);
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
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    result: products,
    results: productCount,
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
//var i=0;
exports.deleteProduct = catchAsyncError(async (req, res) => {
  //i++
  //console.log(i);
  const product = await Product.findById(req.params.id);
  // console.log(product);
  //console.log("hello1");
  if (!product) {
    return res.status(500).json({
      success: true,
      message: "product not found",
    });
  } else {
    console.log("hello");
    var productDelete = await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      result: productDelete,
      message: "product delete successfully",
    });
  }
});

//create new review and update the review
exports.createProductReview = catchAsyncError(async (req, res) => {

  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  //console.log(review);
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {

    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {

    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg=0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  })
  product.ratings =avg / product.reviews.length; //(total product rating length review)

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});


//get Reviews of product


exports.getProductReviews = catchAsyncError(async (req, res,next) => {
  const product = await Product.findById(req.query.id);
console.log(product)
  if(!product){
    return next(new Errorhandler ("product not found",404))
  }

  res.status(200).json({
    success:true,
    reviews:product.reviews
  })
});


//delete reviews
exports.deleteReview = catchAsyncError(async (req, res ,next) => {

  const product = await Product.findById(req.query.productId);

  if(!product){
    return next(new Errorhandler ("product not found",404))
  }

  const reviews =product.reviews.filter(
    (rev)=>rev._id.toString() !== req.query.id.toString()
  )
    //console.log(reviews);
  let avg=0;
 reviews.forEach((rev) => {
    avg += rev.rating;
  })

  const ratings =avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId,{
    reviews,ratings,numOfReviews,
  },
  {
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  res.status(200).json({
    success:true,
  })

})
