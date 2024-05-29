import fs from 'fs';
import { getFileContent, writeDataToFile } from '../utilities.js';

function main() {
    const responsesFileName = "../../generated_data/test_self_consistency/model_responses.json";
    const processedResponsesFileName = "../../generated_data/test_self_consistency/processed_order.json";
    const analysisFileName = "../../generated_data/test_self_consistency/randomness_analysis/randomness_analysis.json";
    const pointsFileName = "../../generated_data/test_data.json";
    const outDataFileName = "../../generated_data/test_self_consistency/allDataFile.json";


    const responses = getFileContent(responsesFileName);
    const processedResponses = getFileContent(processedResponsesFileName);
    const analysisData = getFileContent(analysisFileName);
    const pointsData = getFileContent(pointsFileName);

    const data = {};
    for(let chunk in responses) {
        data[chunk] = [];
        for(let i=0; i<responses[chunk].length; i++) {
            const requestId = processedResponses[chunk][i].requestId;
            data[chunk].push({
                content: responses[chunk][i].response.content,
                ...processedResponses[chunk][i],
                optOrder: (analysisData[chunk] ? analysisData[chunk][i].optOrder : null),
                optDistance: (analysisData[chunk] ? analysisData[chunk][i].optDistance : null),
                points: pointsData[chunk][requestId]
            });
        }
    }

    writeDataToFile(data, outDataFileName);
}

main();