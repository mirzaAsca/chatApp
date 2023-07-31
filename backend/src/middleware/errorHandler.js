/**
 * A middleware function to handle errors that occur in the application.
 * It logs the error and sends a response with status 500 and the error message.
 * 
 * @param {Error} err - The error object
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @param {Function} next - The next middleware function in the Express pipeline
 */
exports.errorHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err);

  // Respond to the client with a 500 status code and the error message
  res.status(500).json({ error: err.message });
};
