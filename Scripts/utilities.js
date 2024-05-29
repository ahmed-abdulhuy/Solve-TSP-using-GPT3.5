/**
 * This file contains utility functions that are used in many scripts.
 */
import fs from 'fs';
import jStat from 'jStat';
import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export function getFileContent(fileName) {
    const file = fs.readFileSync(fileName, 'utf-8');
    if(file) return JSON.parse(file);
    return {};
}


export function createPrompt(points) {
    const systemMessage =`In two-dimensional space, you will visit variable number of stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".

Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.

Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total travelling distance of the journey. At last, Sum the distances between the stations according to the order you find.

The answer format should be as follows: distance matrix, Stations' order with minimum total traveling distance, and traveling distance.
`;

    let userMessage = '';
    points.map((station, idx) => {
        if(idx < points.length - 1)
            userMessage += `station ${idx} ( ${station[0]}, ${station[1]} ), `;
        else
            userMessage += `and station ${idx} ( ${station[0]}, ${station[1]} ).`;
    });

    return {
        "messages": [
            {"role": "system", "content": systemMessage}, 
            {"role": "user", "content": userMessage}, 
        ]
    };
}


export async function makeRequest(messages, model, temperature, idx=1) {
    return new Promise(async (resolve, reject) => {
        try {
            const completion = await openai.chat.completions.create({
                messages,
                model,
                temperature,
            });
            const assistantResponse = completion.choices[0].message;
            let response = {
                response: assistantResponse,
                requestId: idx,
            };
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });
}

export function getPreviousResponses(fileName) {
    try {
      // Check if the file exists synchronously
      fs.accessSync(fileName, fs.constants.F_OK);
      const file = fs.readFileSync(fileName, 'utf-8');
      let previousResponses = {};
      if(file.length > 0) {
          previousResponses = JSON.parse(file);
      }
      return previousResponses; // File exists
    } catch (err) {
      return {}; // File does not exist
    }
}

export function  writeDataToFile(responses, fileName) {
    const jsonData = JSON.stringify(responses, null, 2);
    
    fs.writeFile(fileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}

export function getDistant(sample) {
	let distantArr = [];
	const n = sample.length;
	for(let i=0; i<n; i++) {
		distantArr.push([]);
		for(let j=0; j<n; j++) {
			let distance = measureDistant(sample[i], sample[j]);
			distantArr[i].push(+distance.toFixed(2));
		}
	}
	return distantArr;
}

export function measureDistant(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}


export function getResponseOrder(response) {
    let order = []
    if(response) {
        const regex = /"(?:minimum_distance_|optimal_)?(?:order|path)"\s*:\s*\[(\s*\d+(?:,\s*\d+)*\s*)\]/;
        const match = response.match(regex);
        if (match && match[1]) {
            order = JSON.parse(`[${match[1]}]`);  
        }
    }
    return order;
}


export function checkOrderValidity(order, chunkSize) {
    let numCounts = Array(Number(chunkSize)).fill(0);
    let outOfOrder = [];
    let validOrder = true;
    // Count occurrences of each number in the array
    order.forEach(num => {
        if(num < chunkSize) numCounts[num] += 1
        else outOfOrder.push(num)
    })

    // check out of order visits
    if(outOfOrder.length) validOrder = false;
    if(order[0] != 0 || order[order.length-1] !=0) validOrder = false;

    if(validOrder) {
        // Check visits status
        numCounts.forEach((num, idx) =>{
            if(idx == 0 && num != 2) validOrder = false;
            else if (idx && num != 1) validOrder = false;
        })
    }
  
    return validOrder;
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


export function checkRandomness(data) {
    const chunkSizeList = Object.keys(data);
    let analysis = {};
    chunkSizeList.forEach( chunkSize => {
        const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
        const modelResponsesChunk = data[chunkSize].sort( (a, b) => a.requestId - b.requestId);
        analysis[chunkSize] = {};
        modelResponsesChunk.forEach( (order, idx) => {
            const randomDistances = chunkRandomData[idx].tours.map((d) => d.distance);
            const mean = jStat.mean(randomDistances);
            const std = jStat.stdev(randomDistances);
            const pValue = (order.distance - mean) / std;
            if(pValue<0) {
                console.log("chunkSize_idx:", `${chunkSize}_${idx}`)
                console.log('mean:', mean)
                console.log('std:', std)
                console.log('distance:', order.distance)
                console.log('pValue:', pValue)
                console.log('#################################\n\n')
            }
            analysis[chunkSize][idx] = {
                pValue,
                order: order.order,
                distance: order.distance,
                randomDistances,
            }
        })
    })
    return analysis;
}


export function readChunkRandomData(chunkSize) {
    const fileName = `../../generated_data/random_test_data/chunk_${chunkSize}.json`;
    return getFileContent(fileName);
}
  