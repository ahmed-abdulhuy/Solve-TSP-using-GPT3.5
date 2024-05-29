/*************************************** 
 *--- Script/Exact_DP_TSP.js ---
 * This script is used to get the exact solution for the problem.
 ****************************************/

export function getOptimalCost(sample) {
	const n = sample.length
	const distant = getDistant(sample);
 
	let completed_visit = (1 << n) - 1;
	let DP = [];
	
	for(let i=0; i<Math.pow(2, n); i++) {
		DP.push([]);
		for(let j=0; j<n; j++) {
			DP[i].push(-1);
		}
	}
	function TSP(mark, position) {
		if(mark == completed_visit) {
			return distant[position][0];
		}
		if (DP[mark][position] != -1) {
			return DP[mark][position];
		}
		
		let answer = Infinity;
		for(let city=0; city<n; city++) {
			if ((mark & (1 << city)) == 0) {
				let new_answer = distant[position][city] + TSP(mark | (1 << city), city);
				if(new_answer< answer)
				answer = Math.min(answer, new_answer);
			}
		}
		DP[mark][position] = answer;
		return answer;
	}

	const cost = TSP(1, 0);	
	let optTour = [0];
	let indices = [];
	for(let i=1; i<n; i++) {
		indices.push(i);
	}
	
	function GetOptimalTour(idxArr, mark, cost, position) {
		let minCost = Infinity;
		let minCostIdx = -1;
		for(let idx=0; idx<idxArr.length; idx++) {
			const newCost = DP[(mark | (1 << idxArr[idx]))][idxArr[idx]] + distant[position][idxArr[idx]];
			if(newCost === cost) {
				minCost = DP[(mark | (1 << idxArr[idx]))][idxArr[idx]];
				minCostIdx = idx;
				break;
			}
		}
		const newPosition = idxArr[minCostIdx];
		optTour.push(newPosition);
		idxArr.splice(minCostIdx, 1);
		if(idxArr.length === 1) {
			optTour.push(idxArr[0]);
			optTour.push(0);
			return;
		} 
		GetOptimalTour(idxArr, (mark | (1<<newPosition)), minCost, newPosition);
	}

	GetOptimalTour(indices, 1, cost, 0);
	return [cost, optTour];
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

const sample = [
	    [
        288,
        149
      ],
      [
        288,
        129
      ],
      [
        270,
        133
      ],
      [
        256,
        141
      ],
      [
        256,
        157
      ],
      [
        246,
        157
      ],
      [
        236,
        169
      ],
      [
        228,
        169
      ],
      [
        228,
        161
      ],
      [
        220,
        169
      ],
	    [
        212,
        169
      ],
      [
        204,
        169
      ],
      [
        196,
        169
      ],
      [
        188,
        169
      ],
      [
        196,
        161
      ],
      [
        188,
        145
      ],
      [
        172,
        145
      ],
      [
        164,
        145
      ],
      [
        156,
        145
      ],
      [
        148,
        145
      ],
      [
        140,
        145
      ],
      [
        148,
        169
      ],
      [
        164,
        169
      ],
      
]

// console.log(getOptimalCost(sample));