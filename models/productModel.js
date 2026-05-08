const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price {{VALUE}} should be below regular price'
    }
  },
  category: {
    type: String,
    required: [true, 'A product must have a category']
  },
  location: String,
  image: String,
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    maxLength: [50, 'The description should not exceed 50 characters']
  },
  seller: String,
  postedDate: {
    type: Date,
    default: Date.now
  },
  productSlug: String,
  premiumProducts: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('daysPosted').get(function () {
  if (!this.postedDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - this.postedDate.getTime()) / msPerDay);
});

productSchema.pre('save', function () {
  this.productSlug = slugify(this.name).toUpperCase();
});

productSchema.pre(/^find/, function () {
  this.find({ premiumProducts: { $ne: true } });
});

productSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;