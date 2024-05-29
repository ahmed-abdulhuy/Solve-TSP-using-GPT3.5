import fs from "fs";
import { calculateTourDistance, getPointsFromJson } from "./generate_random_model_responses.js";


const data = getPointsFromJson();
function main() {
    const RandomResponsesFileName = "../generated_data/random_model_responses.json";
    const RandomResponsesFile = fs.readFileSync(RandomResponsesFileName);
    const randomResponses = JSON.parse(RandomResponsesFile);
    const idx = 19;
    const randomResponse = randomResponses[idx];
    const referenceIndex = randomResponse[0].referenceIndex;
    const RandomDistances = randomResponse.map((d) => d.distance);
    const optimalCost = data[idx].cost;
    console.log("size", data.length)
    console.log("idx", idx)
    console.log("optimalCost", optimalCost)
    console.log("points", data[idx].sample)
    for(let sample of randomResponse) {
        if(sample.distance < optimalCost) {
            console.log("random distance", sample.distance)
            console.log("points order", sample.pointsOrder)
        }
    }

    // console.log("referenceIndex", referenceIndex);

    // // console.log("RandomDistances", RandomDistances);
     const fileName = "../generated_data/random_distances.json";
     fs.writeFile(fileName, JSON.stringify(RandomDistances), 'utf8', (err) => {
         if(err) {
             console.error('Error writing to file:', err);
             return;
         }
         console.log('Data written to file successfully.');
     })
}

main();