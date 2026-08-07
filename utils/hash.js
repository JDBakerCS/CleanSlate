const crypto = require("crypto");

// Session hashing algorithm
const hashSessionToken = (token) => {
    const hashingObj = crypto.createHash("sha256");

    hashingObj.update(token);

    return hashingObj.digest("hex");
}


module.exports = hashSessionToken;



