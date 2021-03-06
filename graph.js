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

const legendGroup = svg.append('g')
                    .attr('transform', `translate(${dimensions.width + 40}, 10)`);

const legend = d3.legendColor()
                    .shape('circle')
                    .shapePadding(10)
                    .scale(colors);

const tip = d3.tip()
                .attr('class', 'tip card')
                .html((d) => {
                    let content = `<div class="name">${d.data.name}</div>`;
                    content += `<div class="cost">${d.data.cost}</div>`;
                    content += `<div class="delete">Click to delete</div>`;
                    return content;
                });                    

graph.call(tip);

const arcPath = d3.arc()
                    .outerRadius(dimensions.radius)              
                    .innerRadius(dimensions.radius/2);      
                    
const update = (data) => {

    colors.domain(data.map((item) => item.name));

    legendGroup.call(legend);
    legendGroup.selectAll('text')
                    .attr('fill', 'white');


    const paths = graph.selectAll('path')
                        .data(pie(data));

    // remove unused elements                    
    paths.exit()
        .transition()
            .duration(750)
            .attrTween('d', arcExit)
        .remove();

    // update arcpath
    paths.attr('d', arcPath)
        .transition()
            .duration(750)
            .attrTween('d', arcUpdate);

    paths.enter()
            .append('path')
            .attr('class', 'arc')
            // .attr('d', arcPath)
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('fill', d => colors(d.data.name))
            .each(function(d) {this._current = d})
            .transition()
                .duration(750)
                .attrTween('d', arcEnter);


    graph.selectAll('path')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick);

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

// transitions

const arcEnter = (d) => {
    var angle = d3.interpolate(d.endAngle, d.startAngle);

    return function(t) {
        d.startAngle = angle(t);
        return arcPath(d);
    }
}

const arcExit = (d) => {
    var angle = d3.interpolate(d.startAngle, d.endAngle);

    return function(t) {
        d.startAngle = angle(t);
        return arcPath(d);
    }
}

function arcUpdate(d) {
    
    var angle = d3.interpolate(this._current, d);
    this._current = d;

    return function(t) {
        return arcPath(angle(t));
    }
    
}

// event handlers

const handleMouseOver = (d, i, n) => {
    tip.show(d, n[i]);
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
            .attr('fill-opacity', 0.8);

}

const handleMouseOut = (d, i, n) => {
    tip.hide();
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
            .attr('fill-opacity', 1);
}

const handleClick = (d) => {
    const id = d.data.id;
    db.collection('expenses').doc(id).delete();
}