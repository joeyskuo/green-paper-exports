const dimensions = {
    height: 300,
    width: 300,
    radius: 150
};

const center = {
    x: 5 + (dimensions.width/2),
    y: 5 + (dimensions.width/2)
}

const svg = d3.select('.canvas')
                .append('svg')
                .attr('width', 150 + dimensions.width)
                .attr('height', 150 + dimensions.height);

const graph = svg.append('g')
                .attr('transform', `translate(${center.x}, ${center.y})`);
                
const pie = d3.pie()
                .sort(null)
                .value(d => d.cost);

const arcPath = d3.arc()
                    .outerRadius(dimensions.radius)              
                    .innerRadius(dimensions.radius/2);              