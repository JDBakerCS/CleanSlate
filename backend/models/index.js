const User = require("./User");
const GoogleCredentials = require("./GoogleCredentials");
const ProtectedSender = require("./ProtectedSender")
const ClassificationRun = require("./ClassificationRun")


User.hasOne(GoogleCredentials, {
    foreignKey: "userId",
    as: "googleAccount",
})


GoogleCredentials.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})


User.hasMany(ProtectedSender, {
    foreignKey: "userId",
    as: "protectedSenders"
})

ProtectedSender.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})


User.hasMany(ClassificationRun, {
    foreignKey: "userId",
    as: "classificationRuns"
})

ClassificationRun.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})

module.exports = {
    User,
    GoogleCredentials,
    ProtectedSender,
    ClassificationRun,
}