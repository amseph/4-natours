const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'"]
    }
  }
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const cleanObj = Array.isArray(obj) ? [] : {};

    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleanObj[key] = sanitize(obj[key]);
      } else {
        cleanObj[key] = obj[key];
      }
    }
    return cleanObj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize({ ...req.params });
  if (req.query) req.customQuery = sanitize(req.query);
  next();
});

app.use((req, res, next) => {
  const stripTags = (val) => {
    if (typeof val === 'string') return val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (Array.isArray(val)) return val.map(stripTags);
    if (val && typeof val === 'object') {
      for (const key of Object.keys(val)) val[key] = stripTags(val[key]);
    }
    return val;
  };
  if (req.body) stripTags(req.body);
  next();
});

app.get('/', (req, res) => res.status(200).sendFile(`${__dirname}/public/index.html`));

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Local Marketplace API is running',
    frontend: 'https://jaurigue-local-marketplace-online.onrender.com',
    documentation: '/api/v1/products'
  });
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});
app.get('/overview', (req, res) => res.status(200).sendFile(`${__dirname}/public/overview.html`));
app.get('/item', (req, res) => res.status(200).sendFile(`${__dirname}/public/item.html`));
app.get('/add-item', (req, res) => res.status(200).sendFile(`${__dirname}/public/add-item.html`));
app.get('/login', (req, res) => res.status(200).sendFile(`${__dirname}/public/login.html`));
app.get('/signup', (req, res) => res.status(200).sendFile(`${__dirname}/public/signup.html`));

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

//1 qow
// test commit