charts = [
      {
          order: [0, 12, 21, 16, 7, 20, 10, 1, 4, 19, 17, 3, 11, 18, 5, 8, 9, 2, 6, 13, 14, 15, 0],
          optOrder: [0, 12, 10, 21, 20, 7, 13, 6, 8, 11, 18, 5, 1, 17, 19, 4, 9, 3, 2, 14, 15, 16, 0],
          points: [[9740948, 5742710], [7401, 8056], [870199, 729940], [140199, 131550], [35166, 24109], [49519, 64065], [206576, 230866], [1487191, 1906441], [65770, 78682], [126716, 120497], [2594348, 3141459], [59637, 78037], [3568064, 4239520], [808921, 1225859], [1007576, 1085947], [1050752, 1116226], [1934351, 1897004], [5546, 5519], [53024, 77721], [15635, 11206], [1677437, 2355377], [2056672, 2511138]]
      },
      {
          order: [0, 3, 16, 10, 19, 12, 8, 13, 2, 9, 6, 15, 4, 18, 14, 17, 5, 21, 11, 1, 7, 20, 0],
          optOrder: [0, 15, 17, 11, 5, 21, 1, 7, 14, 20, 18, 6, 4, 3, 9, 10, 19, 16, 12, 8, 13, 2, 0],
          points: [[2087994, 2020659], [250820, 161980], [2778168, 3941666], [4708921, 2607464], [953973, 649529], [12141, 11865], [598659, 354473], [247561, 227203], [4363575, 4990111], [3998596, 3766037], [6397420, 5221700], [172262, 282346], [10899172, 12785728], [3319249, 4854376], [293710, 319165], [716383, 1063707], [8288843, 7307386], [190056, 301069], [524177, 349485], [8045433, 6823640], [446329, 325745], [18849, 10913]]
      },
      {
          order: [0, 1, 11, 7, 19, 21, 6, 8, 9, 13, 4, 18, 12, 10, 15, 16, 20, 2, 5, 3, 14, 17, 0],
          optOrder: [0, 1, 11, 7, 19, 17, 21, 6, 8, 13, 12, 4, 3, 10, 16, 20, 2, 5, 15, 14, 18, 9, 0],
          points: [[4357117, 5113628], [5407900, 6108503], [16456, 16838], [583888, 634654], [1067949, 990935], [18145, 19241], [7399675, 5341402], [7381276, 8187631], [4252357, 3917076], [1566605, 2054764], [314149, 209990], [6207693, 8609801], [1198574, 899424], [2019998, 1371701], [384692, 627098], [422291, 594389], [8042, 5927], [14882466, 12000160], [832934, 1017111], [8652436, 9709015], [12561, 15805], [19707915, 14594119]]
      },
      ]
      
      
      charts.forEach( (chart, c) =>  {
            for (let cc=0; cc<2; cc++) {
              const pointsList = chart.points;
          let order = chart.order; 
          if(cc%2) order = chart.optOrder;
        let x = Math.max(...pointsList.map( i => i[0]))
        let y = Math.max(...pointsList.map( i => i[1]))
      
        for(let i=0; i<pointsList.length; i++) {
          pointsList[i][0] /= x
          pointsList[i][1] /= y
        }
      
            // Define the 2D points
        const points = order.map( (o) => {
          return {x: pointsList[o][0], y: pointsList[o][1]}
        });
      
        // Set margins and dimensions for the chart
        const margin = { top: 20, right: 20, bottom: 20, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
      
        // Create SVG element
        const svg =	d3.select("body").append("svg")
        .attr("id", `${c +'_'+ cc}`)
        .attr("width", 600)
        .attr("height", 550)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
        // Define scales for x and y axes
        const xScale = d3.scaleLinear()
        .domain([d3.min(points, d => d.x), d3.max(points, d => d.x)])
        .range([0, width]);
      
        const yScale = d3.scaleLinear()
        .domain([d3.min(points, d => d.y), d3.max(points, d => d.y)])
        .range([height, 0]);
      
        // Create x and y axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
      
        // Append x and y axes to SVG
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
      
        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
        // Bind data to group elements and append them to SVG
        const groups = svg.selectAll("g.point")
        .data(points)
        .enter()
        .append("g")
        .attr("class", "point")
        .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);
      
        // Append circles to groups
        groups.append("circle")
          .attr("r", 5) // Circle radius
          .style("fill", "black"); // Circle color
      
        // Append text labels to groups
        groups.append("text")
          .attr("x", 8) // Adjust position
          .attr("y", -8) // Adjust position
          .text((d, idx) => `${order[idx]}`)
          .style("font-size", "10px")
          .style("fill", "black");
      
        // Create a line generator
        const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
      
        // Append a path element to connect the points with lines
        svg.append("path")
          .datum(points)
          .attr("fill", "none")
          .attr("stroke", "black") // Line color
          .attr("stroke-width", 1) // Line width
          .attr("d", line);
          
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom*3)
          .attr("text-anchor", "middle")
          .text(`${!(cc%2) ? 'response' : 'optimal'} idx ${c}`);
      
        }
      })