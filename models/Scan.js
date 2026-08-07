module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "Scan",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    "created",
                    "fetching",
                    "filtering",
                    "classifying",
                    "ready_for_review",
                    "applying_actions",
                    "completed",
                    "failed"
                ),
                allowNull: false,
                defaultValue: "created",
            },
            olderThanDays: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 15,
            },
            messageLimit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 25,
            },

            fetchedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            candidateCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            protectedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            analyzedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            archivedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            trashedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            keptCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            skippedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            failedActionCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            attemptCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            processingStartedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            lastHeartbeatAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            errorCode: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            errorMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            startedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "scans",
            timestamps: true,
        }
    );
};