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

const colors = d3.scaleOrdinal(d3['schemeSet3']);

const arcPath = d3.arc()
                    .outerRadius(dimensions.radius)              
                    .innerRadius(dimensions.radius/2);      
                    
const update = (data) => {

    colors.domain(data.map((item) => item.name));

    const paths = graph.selectAll('path')
                        .data(pie(data));

    // remove unused elements                    
    paths.exit().remove();

    // update arcpath
    paths.attr('d', arcPath);

    paths.enter()
            .append('path')
            .attr('class', 'arc')
            // .attr('d', arcPath)
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('fill', d => colors(d.data.name))
            .transition()
                .duration(750)
                .attrTween('d', arcEnter);


};

var data = [];

db.collection('expenses').onSnapshot(res => {

    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(), id: change.doc.id };

        switch(change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id != doc.id);
                break;
            default:
                break;
        }

    });

    update(data);
});                    

const arcEnter = (d) => {
    var angle = d3.interpolate(d.endAngle, d.startAngle);

    return function(t) {
        d.startAngle = angle(t);
        return arcPath(d);
    }
}