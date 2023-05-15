import React, { useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://www.terriblytinytales.com/test.txt');
      const text = response.data;
      const words = text.split(/\s+/);
      const counts = words.reduce((acc, word) => {
        if (!acc[word]) {
          acc[word] = 1;
        } else {
          acc[word]++;
        }
        return acc;
      }, {});
      const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
      setData(sortedCounts);
    } catch (err) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  const handleExport = () => {
    const csvData = data.map(([word, count]) => `${word},${count}`).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const svgRef = React.createRef();

  React.useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);

    const x = d3.scaleBand()
      .range([0, 600])
      .domain(data.map(([word, count]) => word))
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([400, 0])
      .domain([0, d3.max(data, ([word, count]) => count)]);

    svg.append('g')
      .attr('transform', 'translate(50, 400)')
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', ([word, count]) => x(word) + 50)
      .attr('y', ([word, count]) => y(count))
      .attr('width', x.bandwidth())
      .attr('height', ([word, count]) => 400 - y(count));
  }, [data]);

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>Submit</button>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data.length > 0 && (
        <>
          <svg ref={svgRef} width={700} height={500}>
            <g transform="translate(50, 0)">
              <text x={300} y={480} textAnchor="middle">Words</text>
            </g>
            <g transform="translate(0, 400)">
              <text x={-250} y={-30} textAnchor="middle" transform="rotate(-90)">Frequency</text>
            </g>
          </svg>
          <button onClick={handleExport}>Export</button>
        </>
      )}
    </div>
  );
}

export default App;