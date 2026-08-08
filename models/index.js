const User = require("./User");
const GoogleCredentials = require("./GoogleCredentials");
const ProtectedSender = require("./ProtectedSender")
const Scan = require("./Scan")
const ScanItem = require("./ScanItem")


User.hasOne(GoogleCredentials, {
    foreignKey: "userId",
    as: "googleAccount",
})


GoogleCredentials.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})


User.hasMany(Scan, {
    foreignKey: "userId",
    as: "scans"
})

Scan.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})

Scan.hasMany(ScanItem, {
    foreignKey: "scanId",
    as: "items"
})

ScanItem.belongsTo(Scan, {
    foreignKey: "scanId",
    as: "scan"
})

User.hasMany(ProtectedSender, {
    foreignKey: "userId",
    as: "protectedSenders"
})

ProtectedSender.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
})

module.exports = {
    User,
    GoogleCredentials,
    ProtectedSender,
    Scan,
    ScanItem,
}