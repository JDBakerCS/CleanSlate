// Centralized error function instead of writing 
// res.status(...).json(...) everywhere
const generateError = (status, msg) => {
    const error = new Error(msg);

    error.status = status;

    return error;
}

module.exports = generateError;