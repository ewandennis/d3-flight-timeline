'use strict';

// A 2D line with datetime x axis and numeric y axis.
// x: left -> right
// y: bottom -> top
class TimeSeries {
  constructor(records, fld, timeExtent, width, height) {
    this.records = records;
    this.fld = fld;

    let timeScale = d3.time.scale().range([0, width]).domain(timeExtent);

    let numericScale = d3.scale.linear().range([height, 0])
      .domain(d3.extent(records, d => d[fld]));

    //this.axis = d3.svg.axis().scale(this.numericScale).orient('left');

    this.line = d3.svg.line()
        .x(d => timeScale(d.date))
        .y(d => numericScale(d[fld]));
  }

  renderTo(svg, colour) {
    linechart(svg, this.line, this.records, this.fld, {
      colour: colour,
      linewidth: '3px'
    });
  }
}
