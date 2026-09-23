export function errorHandler(err, req, res, next) {
  // Safe console log without leaking secrets
  console.error(`[API Error] ${req.method} ${req.path}:`, err.message || err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    path: req.path
  });
}
