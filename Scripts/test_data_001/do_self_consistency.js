// analyze the data for self consistency

import { range } from "d3";
import { getOptimalCost } from "../Exact_DP_TSP.js";
import { getFileContent, writeDataToFile, checkRandomness, readChunkRandomData } from "../utilities.js";
import jStat from 'jStat';


function main() {
  const dataFileName = "../../generated_data/test_self_consistency/processed_order.json";
  const analysisFileName = "../../generated_data/test_self_consistency/randomness_analysis/randomness_analysis.json";
  const data = getFileContent(dataFileName);
  let updatedData = getFileContent(analysisFileName);
  const keys = Object.keys(data)
  keys.forEach(chunkSize => {
    const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);

    // let pointsChunk = []
    // for (let i in range(30)) {
    //   if(updatedData[chunkSize] && updatedData[chunkSize][i]) {
    //     console.log("points already processed!")
    //     const {optDistance, optOrder} = updatedData[chunkSize][i]
    //     pointsChunk.push([optDistance, optOrder])
    //     continue;
    //   } else {
    //     const points = chunkRandomData[i].points;
    //     const [optDistance, optOrder] = getOptimalCost(points);
    //     pointsChunk.push([optDistance, optOrder])
    //     console.log(`chunk_${chunkSize} ${i} Finished!`);
    //   }
    // }
    if(!updatedData[chunkSize]) {
      updatedData[chunkSize] = [];
    }


    
    data[chunkSize].forEach((order, idx) => {
      const randomDistances = chunkRandomData[order.requestId].tours.map((d) => d.distance);
      order.random = jStat.stdev(randomDistances);
      order.mean = jStat.mean(randomDistances);
      // const [optDistance, optOrder] = pointsChunk[order.requestId];
      // order.optDistance = optDistance;
      // order.optOrder = optOrder;
      updatedData[chunkSize][idx] = order;
    })
    // console.log(Object.keys(data[chunkSize][0]))
    // console.log(`chunk_${chunkSize} Finished!`);
    console.log("#################################\n\n")
  });
  // writeDataToFile(updatedData, analysisFileName);
  
  
  
  
  
  // const processedData = setNonValidDistance(data);
  // const resNumList = [3, 5, 7, 9, 11];
  // resNumList.forEach(resNum => {
  //   const analysisFileName = `../../generated_data/test_self_consistency/randomness_analysis/randomness_analysis_${resNum}.json`;
  //   const dataAfterSelfConsistency = getBestOrderDistance(resNum, processedData);
  //   // const analysis = checkRandomness(dataAfterSelfConsistency);
  // });
}

function setNonValidDistance(data) {
  let processedData = {};
  Object.keys(data).forEach(chunkSize => {
    const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
    processedData[chunkSize] = [];
    for (let order of data[chunkSize]) {
      const randomDistances = chunkRandomData[order.requestId].tours.map((d) => d.distance);
      if(!order.valid) {
        order.distance = jStat.mean(randomDistances);
      }
      processedData[chunkSize].push(order);
    }
  });
  return processedData;
}


function getOrderForSelfConsistency(resNum, data) {
    let orderCheck = {};
    Object.keys(data).forEach(chunkSize => {
      orderCheck[chunkSize] = [];
      for (let idx = 0; idx < 30; idx++) {
        let relatedOrders = data[chunkSize].filter(order => order.requestId === idx);
        let filteredRelatedOrders = relatedOrders.slice(0, resNum);
        orderCheck[chunkSize].push(...filteredRelatedOrders);
      }
    });
    return orderCheck;
}
  

function getBestOrderDistance(resNum, data) {
  let filteredData = getOrderForSelfConsistency(resNum, data);
  let chunkDistance = {};
  Object.keys(filteredData).forEach(chunkSize => {
    const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
    chunkDistance[chunkSize] = [];
    for (let idx = 0; idx < 30; idx++) {
      let mostOptimalOrder = {};
      let minValue = Infinity;
      for (let order of filteredData[chunkSize]) {
        if (order.requestId == idx && order.distance && order.distance <= minValue) {
          minValue = order.distance;
          mostOptimalOrder = order;
        }
      }
      // console.log(chunkSize,idx)
      const randomDistances = chunkRandomData[mostOptimalOrder.requestId].tours.map((d) => d.distance);
      chunkDistance[chunkSize][mostOptimalOrder.requestId] = {
        order: mostOptimalOrder.order,
        distance: mostOptimalOrder.distance,
        randomDistances,
        requestId: mostOptimalOrder.requestId,
        valid: mostOptimalOrder.valid
      };
    }
  });


  return chunkDistance;
}

main();
