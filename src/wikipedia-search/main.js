import * as d3 from 'd3';
import * as gui from 'lil-gui';

const NODE_ID = 3102381;

const options = {
  nodeLimit: {
    start: 100,
    min: 0,
    max: 5000,
  },
  minConnections: {
    start: 1,
    min: 1,
    max: 700,
  },
}
const GUI = new gui.GUI();
const config = {
  topic: 'Bauhaus',
  nodeLimit: 100,
  minConnections: 1,
  zoom: 1,
};

const onChange = async () => {
  console.log('changed');
  await filterData();
  setTimeout(() => {
    createGraph();
  }, 100);
}

const svg = d3.select("#graphSvg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const padding = 100;
const zoom = d3.zoom()
  .scaleExtent([.1, 10])  // Limit the zoom scale
  .on("zoom", (event) => {
      graphGroup.attr("transform", event.transform);
  });

const nodesFileName = './enwiki-2013-names-trimmed.csv';
const edgesFileName = './enwiki-2013-trimmed.txt';

let link = d3.select(null);
let node = d3.select(null);
let label = d3.select(null);

let nodes = [];
let links = [];

let connectionBoundMin = 0;
let connectionBoundMax = 0;

console.log('load')


svg.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "#333");

// Apply the zoom behavior to the SVG element
svg.call(zoom)


function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

document.addEventListener('keypress', function(e) {
  if (e.key === 's') {
    saveSvg(svg.node(), 'graph.svg');
  }
});




const graphGroup = svg.append("g");
const lineGroup = graphGroup.append("g");
const nodeGroup = graphGroup.append("g");
const forceX = d3.forceX(width / 2).strength(0.01)
const forceY = d3.forceY(height / 2).strength(0.01)
const simulation = d3.forceSimulation(nodes)
  .force('x', forceX)
  .force('y', forceY)
  .force("link", d3.forceLink(links).id(d => d.id))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().radius(d => Math.pow(normalizeDegrees(d.degree) * 15, 1.7) + 20)); // Add collision force



const update = () => {
  link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

  node
      .attr("cx", d => d.x = Math.max(padding, Math.min(width - padding, d.x)))
      .attr("cy", d => d.y = Math.max(padding, Math.min(height - padding, d.y)));

  label
      .attr("x", d => d.x)
      .attr("y", d => d.y);

  label.selectAll("tspan")
      .attr("x", d => d.x)
      .attr("y", (d, i, nodes) => d.y + (i - nodes.length) * 12 + (nodes.length * 12 / 2) + 6); // Adjust for multiline
}


simulation.on("tick", update);

GUI.add(config, 'topic', ['Bauhaus', 'Modernism', 'Art Nouveau', 'Art Deco', 'De Stijl', 'Constructivism', 'Futurism', 'Dada', 'Surrealism', 'Cubism', 'Expressionism', 'Impressionism', 'Post-Impressionism', 'Romanticism', 'Neoclassicism', 'Rococo', 'Baroque', 'Renaissance', 'Gothic', 'Medieval', 'Byzantine', 'Roman', 'Greek', 'Egyptian', 'Mesopotamian', 'Prehistoric', 'African', 'Oceanic', 'Native American', 'Asian', 'Islamic', 'Ancient', 'Classical', 'Contemporary', 'Modern', 'Art', 'Architecture', 'Design', 'Painting', 'Sculpture', 'Photography', 'Drawing', 'Printmaking', 'Installation', 'Performance', 'Film', 'Video', 'Sound', 'Textile', 'Ceramic', 'Glass', 'Metal', 'Wood', 'Plastic', 'Stone', 'Marble', 'Bronze', 'Gold', 'Silver', 'Jewelry', 'Furniture', 'Interior', 'Fashion', 'Graphic Design', 'Typography', 'Industrial Design', 'Product Design', 'Urban Design', 'Landscape Architecture', 'Garden Design', 'Lighting Design', 'Exhibition Design', 'Textile Design', 'Fashion Design', 'Jewelry Design', 'Toy Design', 'Game Design', 'Interaction Design', 'Web Design', 'UI Design', 'UX Design', 'Service Design', 'Design Thinking', 'Design History', 'Design Theory', 'Design Criticism', 'Design Education', 'Design Research', 'Design Management', 'Design Practice', 'Design Process', 'Design Philosophy', 'Design Ethics', 'Design Politics', 'Design Activism', 'Design Fiction', 'Design Futures', 'Design Technology', 'Design Culture', 'Design Aesthetics', 'Design Psychology', 'Design Anthropology', 'Design Sociology', 'Design Ecology', 'Design Systems', 'Design Patterns', 'Design Language', 'Design Tools', 'Design Software', 'Design Hardware', 'Design Methodology', 'Design Strategy', 'Design Leadership', 'Design Entrepreneurship', 'Design Innovation', 'Design Thinking', 'Design Futures', 'Design Technology', 'Design']);
GUI.add(config, 'nodeLimit', options.nodeLimit.min, options.nodeLimit.max).step(5).listen().onChange(onChange);
GUI.add(config, 'minConnections', options.minConnections.min, options.minConnections.max).step(5).listen().onChange(onChange);
GUI.add(config, 'zoom', 1, 100).step(1).onChange(() => {
  config.nodeLimit = Math.floor(Math.min(options.nodeLimit.max, options.nodeLimit.max * Math.pow(config.zoom / 100, 1.05)));
  config.minConnections = Math.floor(Math.min(options.minConnections.max, Math.pow(config.zoom / 100, 1.05) * options.minConnections.max) * 2);

  link.data(links, d => d.source.id + "-" + d.target.id);
  node.data(nodes, d => d.id);
  label.data(nodes, d => d.id);

  onChange();
});

async function loadCsvData(url) {
    const data = await d3.csv(url);
    return data;
}

async function loadTxtData(url) {
    const response = await fetch(url);
    const text = await response.text();
    return text.split('\n').map(line => line.split(' '));
}

async function filterData() {
  const nodesData = await loadCsvData(nodesFileName);
  const edgesData = await loadTxtData(edgesFileName);

  // Calculate the middle slice for nodes
  const middleIndex = Math.floor(nodesData.length / 2);
  const startIndex = Math.max(middleIndex - Math.floor(config.nodeLimit / 2), 0);
  const limitedNodesData = nodesData.slice(startIndex, startIndex + config.nodeLimit);

  // Initialize connection and degree counts
  const connectionCounts = {};
  const degreeCounts = {};

  // Count connections for each node
  edgesData.forEach(edge => {
      if (limitedNodesData.some(node => node.node_id === edge[0]) &&
          limitedNodesData.some(node => node.node_id === edge[1])) {
          connectionCounts[edge[0]] = (connectionCounts[edge[0]] || 0) + 1;
          connectionCounts[edge[1]] = (connectionCounts[edge[1]] || 0) + 1;

          degreeCounts[edge[0]] = (degreeCounts[edge[0]] || 0) + 1;
          degreeCounts[edge[1]] = (degreeCounts[edge[1]] || 0) + 1;
      }
  });

  // reset bounds
  connectionBoundMin = 1000;
  connectionBoundMax = 0;

  // Filter nodes based on connection counts
  nodes = await limitedNodesData
      .filter(node => connectionCounts[node.node_id] >= config.minConnections || parseInt(node.node_id, 10) === NODE_ID)
      .map(node => {
        connectionBoundMin = Math.min(connectionBoundMin, connectionCounts[node.node_id]);
        connectionBoundMax = Math.max(connectionBoundMax, connectionCounts[node.node_id]);

        return {
          id: String(node.node_id),
          name: node.name,
          degree: degreeCounts[node.node_id] || 0
        }
      });

  console.log(nodes)
  // Filter edges to include only those between the filtered nodes
  links = await edgesData
      .filter(edge => nodes.some(node => node.id === edge[0]) && nodes.some(node => node.id === edge[1]))
      .map(edge => ({ source: String(edge[0]), target: String(edge[1]) }));
}

const normalizeDegrees = (degree) => {
  return (degree - connectionBoundMin) / (connectionBoundMax - connectionBoundMin);
}


function createGraph() {
  // Bind data to link, node, and label
  link = lineGroup.selectAll("line")
      .data(links, d => d.source.id + "-" + d.target.id)
      .join("line");

  node = nodeGroup.selectAll("circle")
      .data(nodes, d => parseInt(d.id, 10));

  label = nodeGroup.selectAll("text")
      .data(nodes, d => d.id);

  // Exit selection: for removed elements
  label.exit().remove();

  // Enter + update
  link.enter().append("line")
    .merge(link)
    .attr("stroke-width", 1)
    .attr("stroke", "#aaa");


  node.enter().append("circle")
      .merge(node) // Merge enter and update selections
      .attr("r", d => normalizeDegrees(d.degree) * 50 + 5)
      .attr("fill", d => (`rgba(${normalizeDegrees(d.degree) * 100 + 100}, ${150 - normalizeDegrees(d.degree) * 50}, 50, 0.95)`));

  let size = 0;
  let enterLabels = label.enter().append("text");

  // Update selection: for existing elements
  // Combine enter and update using the merge() function
  let updateLabels = enterLabels.merge(label);

  updateLabels
    .text(d => d.name)
    .attr("font-size", d => normalizeDegrees(d.degree) > .3 ? 12 : 3)
    .attr("x", 6)
    .attr("y", 3)
    .style("fill", "#fff")
    .style("font-family", "helvetica")
    .style("font-weight", d => {
      size = Math.sqrt(d.degree) * 2 + 2;
      return size > 10 ? '400' : '100';
    }) // Adjust font size as needed
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle")
    .call(wrapText, 80); // Ensure wrapText function is defined properly

  // Exit
  link.exit().remove();
  node.exit().remove();
  label.exit().remove();

  // Restart the simulation
  simulation.nodes(nodes);
  simulation.force("link", d3.forceLink(links).id(d => d.id).distance(.5).strength(.05));
  simulation.alpha(1).restart();
}



await filterData();
setTimeout(() => {
  createGraph();
}, 100);


function wrapText(textSelection, width) {
  let lineNumber = 0;

  textSelection.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    lineNumber += 1;
    const lineHeight = .8;
    const fontSize = text.attr("font-size");
    const x = text.attr("x");
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy"));
    let tspan = text.text(null).append("tspan")
                    .attr("x", x).attr("y", y * 30)
                    // .attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];

        const anchor = {
          x: +text.attr("x"),
          y: +text.attr("y")
        };

        console.log(lineHeight * fontSize)

        tspan = text.append("tspan")
                    .attr("x", 0)
                    .attr("y", lineNumber)
                    .attr("dy", lineNumber + dy + "px")
                    .text(word);
      }
    }
  });
}
