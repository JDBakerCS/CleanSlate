const crypto = require("crypto");
require("dotenv").config();


const ALGORITHM = "aes-256-gcm"; // AES encryption algorithm with a 256-bit (32-byte) key using GCM mode.

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Generating the key to later feed the cipher
// object which is literally the machine for ecnryption. Besides this key we will 
// also generate iv and use our algorithm in order to get the final encrypted value.

// Since aes algorithm only works with the raw bytes this is why we are converting back
// our secret into the raw bytes and keep it in the key variable.

const encrypt = (token) => {
    const iv = crypto.randomBytes(12); // This is what produces different 
    // encrypted values for the same inputs. Which makes the results lot less 
    // predictable.


    // Creating the encrypting object, kind of preparing the ground and soon we will
    // feed this object with the token that we want to be encrypted, this process so far
    // only creates the object with values that we created and does not yet start the 
    // encryopting process.
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        key,
        iv
    )

    // This is where we give it the token, but we also convert it into raw bytes,
    // since we already said that aes algorithm only works with raw bytes and can not 
    // work with strings and our token is string so need to do the conversion.
    const firstPart = cipher.update(token, "utf-8");


    // This part tells the program that process is over and also encrypt whatever
    // was left to encrypt and stop waiting.
    const secondPart = cipher.final();


    // simply combine these two parts to produce simple single output. Still this is buffer
    // and not string, therefore we have to convert it back to string later.
    const encrypted = Buffer.concat([
        firstPart, secondPart
    ]);

    const authTag = cipher.getAuthTag(); // This part makes sure that the buffer was not changed
    // since the moment it was generated, useful for later decryption operation.


    return `${encrypted.toString("base64")}:${iv.toString("base64")}:${authTag.toString("base64")}`;
}


module.exports = {
    encrypt
}


// Need to write the decrypt function as well later on.