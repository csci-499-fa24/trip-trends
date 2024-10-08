const errorHandler = (res, err, statusCode = 500) => {
    console.error(err); 
    
    // send standardized error response
    return res.status(statusCode).json({
        message: statusCode === 500 ? "Internal Server Error" : err.message,
        error: err.message,
    });
};

module.exports = errorHandler;
