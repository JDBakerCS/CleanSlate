const User = require("./User");
const GoogleCredentials = require("./GoogleCredentials");


User.hasMany(GoogleCredentials, {
    foreignKey: "userId",
    as: "googleAccounts",
})


GoogleCredentials.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})


module.exports = {
    User,
    GoogleCredentials
}