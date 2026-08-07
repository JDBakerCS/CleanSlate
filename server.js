const app = require("./app");
const db = require("./config/db");
require("dotenv").config();

const startApp = async () => {
    try {
        await db.authenticate();

        console.log("Database connected successfully");
        await db.sync();

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on PORT ${PORT}`);
        });

    } catch(err) {
        console.log(err.message);
    }
}

startApp();