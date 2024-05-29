import fs from "fs";
import { measureDistant } from "../Exact_DP_TSP.js";


export async function createRandomModelResponses() {
    
    const examplesList = await getPointsFromJson();
    for (let chunkSize in examplesList) {
        const chunk = examplesList[chunkSize];
        const chunkRandomData = chunk.map((points, idx) => {
            const toursList = [];
            for (let i = 0; i < 1000; i++) {
                const randomPointsOrder = shufflePointsOrder(points);
                const distance = calculateTourDistance(randomPointsOrder, points);
                toursList.push({
                    pointsOrder: randomPointsOrder,
                    distance: distance,
                });
            }
            const journeySample = {
                points: points,
                tours: toursList,
                referenceIndex: idx
            }
            return journeySample;
        });
        const objToStringify = {
            [chunkSize]: chunkRandomData,
        }
        const jsonData = JSON.stringify(objToStringify, null, 2);
        fs.writeFile(`../generated_data/random_test_data/chunk_${chunkSize}.json`, jsonData, 'utf8', (err) => {
            if(err) {
                console.error('Error writing to validation file:', err);
                return;
            }
            console.log(`chunk_${chunkSize} written to file successfully.`);
        });
    }
}


function shufflePointsOrder(points) {
    let indices = points.map((_, idx) => idx+1);
    indices.pop();
    let pointsOrder = [0];
    while(indices.length > 0) {
        const randomIndex = Math.floor(Math.random() * indices.length);
        const index = indices[randomIndex];
        indices.splice(randomIndex, 1);
        pointsOrder.push(index);
    }
    pointsOrder.push(0);
    return pointsOrder;
}

export function calculateTourDistance(pointsOrder, points) {
    let distance = 0;
    for( let i = 1; i < pointsOrder.length; i++) {
        const point1 = pointsOrder[i-1];
        const point2 = pointsOrder[i];
        distance += measureDistant(points[point1], points[point2]);
    }

    return distance;
}

export function getPointsFromJson() {

    const fileName = "../generated_data/test_data.json";
    const file = fs.readFileSync(fileName, 'utf-8');
    const samples = JSON.parse(file);

    return samples;
}

createRandomModelResponses();