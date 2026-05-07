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
  // Task 7: Custom Validator
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only points to current doc on NEW document creation
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
  // Task 6: Built-in Validator
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    maxLength: [50, 'The description should not exceed 50 characters']
  },
  seller: String,
  // Task 2: Posted Date property
  postedDate: {
    type: Date,
    default: Date.now
  },
  // Task 3: productSlug property
  productSlug: String,
  // Task 4: premiumProducts property
  premiumProducts: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Task 2: Virtual Property (days posted)
productSchema.virtual('daysPosted').get(function() {
  if (!this.postedDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - this.postedDate.getTime()) / msPerDay);
});

// Task 3: Document Middleware
productSchema.pre('save', function() {
  // Slugify product in upper case
  this.productSlug = slugify(this.name).toUpperCase();
});

// Task 4: Query Middleware
productSchema.pre(/^find/, function() {
  // Only get data with premiumProducts = false
  this.find({ premiumProducts: { $ne: true } });
});

// Task 5: Aggregate Middleware
productSchema.pre('aggregate', function() {
  // Trigger before the aggregation created in step 1
  this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;