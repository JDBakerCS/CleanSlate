const ai = require("../config/gemini");
const geminiPrompting = require("./geminiInput");

const geminiIntegration = async (geminiThreads, labelsList) => {

    const labels = structuredClone(labelsList);

    const BATCH_LENGTH = 50;

    const batches = [];


    for (let i = 0; i < geminiThreads.length; i += BATCH_LENGTH) {

        batches.push(geminiThreads.slice(i, i + BATCH_LENGTH));
    }


    const delay = (ms) => {

        return new Promise((resolve) => {

            setTimeout(() => {
                resolve();
            }, ms)
        })
    };


    const resultArr = [];

    for (let i = 0; i < batches.length; i++) {

        const geminiRes = await geminiPrompting(labels, batches[i]);

        resultArr.push(geminiRes);


        const newLabels = geminiRes.categories.reduce((acc, category) => {

            if (category.action === "CREATE_NEW") {

                const obj = {
                    id: "PENDING_" + `${category.labelName}`,
                    name: `${category.labelName}`,
                    type: "user"
                }

                acc.push(obj);
            }

            return acc;

        }, [])


        labels.push(...newLabels);

        if (i !== batches.length - 1) await delay(12000);
    }


    const finalMap = {};

    for (let i = 0; i < resultArr.length; i++) {

        for (let category of resultArr[i].categories) {

            if (finalMap[category.labelName] === undefined) {
                finalMap[category.labelName] = category;

            } else {
                finalMap[category.labelName] = {
                    ...finalMap[category.labelName],
                    threadIds: [
                        ...finalMap[category.labelName].threadIds, 
                        ...category.threadIds
                    ]
                }
            }
        }
    }


    const formatted = Object.values(finalMap);

    formatted.forEach((singlCategory) => {
        singlCategory.status = "pending";
    })

    return {
        categories: formatted
    }
}

module.exports = geminiIntegration;