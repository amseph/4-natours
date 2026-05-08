module.exports = (fn) => {
  return (req, res, next) => {
    const nextFn = typeof next === 'function' ? next : (err) => {
      console.error('Express did not provide a next function!', err);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: err.message || 'Internal Server Error',
          error: err,
          stack: err.stack
        });
      }
    };

    Promise.resolve(fn(req, res, nextFn)).catch(nextFn);
  };
};