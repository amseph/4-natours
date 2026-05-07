class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1) Handle "flat" price filters if they come in as price[gte]=... instead of an object
    if (!queryObj.price) {
      queryObj.price = {};
      let foundPriceFilter = false;
      
      if (queryObj['price[gte]']) { queryObj.price.gte = queryObj['price[gte]']; delete queryObj['price[gte]']; foundPriceFilter = true; }
      if (queryObj['price[lte]']) { queryObj.price.lte = queryObj['price[lte]']; delete queryObj['price[lte]']; foundPriceFilter = true; }
      if (queryObj['price[gt]']) { queryObj.price.gt = queryObj['price[gt]']; delete queryObj['price[gt]']; foundPriceFilter = true; }
      if (queryObj['price[lt]']) { queryObj.price.lt = queryObj['price[lt]']; delete queryObj['price[lt]']; foundPriceFilter = true; }
      
      if (!foundPriceFilter) delete queryObj.price;
    }

    // 2) Advanced filtering for operators like gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // 3) Parse back to object and cast Numbers
    const finalQuery = JSON.parse(queryStr);
    
    if (finalQuery.price && typeof finalQuery.price === 'object') {
      for (let key in finalQuery.price) {
        finalQuery.price[key] = Number(finalQuery.price[key]);
      }
    }

    this.query = this.query.find(finalQuery);
    
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100; 
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;