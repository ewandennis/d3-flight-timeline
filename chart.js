'use strict';

// Chart of multiple dimensions that change with time during a flight. 
class FlightChart {
  constructor(sensorrecords, adsrecords, domNode) {
    let rows = 3;

    this.renderTimeAxis = true;

    this.colours = d3.scale.category20();
    this.colourIdx = 2;

    this.margin = {top: 20, right: 20, bottom: 50, left: 30};
    this.padding = 40;
    this.labelTextYOffs = 6;

    let nodeWidth = parseInt(window.getComputedStyle(domNode).width)
      , nodeHeight = parseInt(window.getComputedStyle(domNode).height);

    this.width = nodeWidth - this.margin.left - this.margin.right;
    this.height = nodeHeight - this.margin.top - this.margin.bottom;
    this.rowHeight = (this.height - (this.padding*(rows-1))) / rows;

    this.sensors = downSample(sensorrecords, this.width);
    this.ads = adsrecords;

    this.timeExtent = d3.extent(this.sensors, d => d.date);
    this.timeScale = d3.time.scale()
      .range([0, this.width])
      .domain(this.timeExtent)
//      .nice();

    this.svg = d3.select('#' + domNode.id)
      .append('svg:svg')
        .attr('id', 'chart')
        .attr('version', '1.1')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', this.width+this.margin.left+this.margin.right)
        .attr('height', this.height+this.margin.top+this.margin.bottom)
        .attr('fill', 'white')
        .attr('style', 'font-family: Arial')
      .append('g')
        .attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');

    this.timeSeries = [
      [
        {d: this.sensors, fld: 'sound', c: this.colours(3)},
        {d: this.sensors, fld: 'pressure', c: this.colours(10)},
        {d: this.sensors, fld: 'pitch', c: this.colours(6)},
      ],
      [
        {d: this.ads, fld: 'altft', c: this.colours(5)},
        {d: this.ads, fld: 'mph', c: this.colours(7)},
      ],

      [
        {d: this.ads, fld: 'lat', c: this.colours(9)},
        {d: this.ads, fld: 'lon', c: this.colours(11)},
      ]
    ];

    let sensorAt = pos => this.sensors[Math.floor(pos * this.sensors.length)];
    
    this.labels = [
      {t:'Boarding', r:0, s:sensorAt(0).date, e:sensorAt(44/575).date},
      {t:'Taxi', r:0, s:sensorAt(49/575).date, e:sensorAt(74/575).date},
      {t:'Ascent', r:0, s:this.ads[3].date, e:this.ads[43].date},
      {t:'Cruise', r:0, s:this.ads[44].date, e:this.ads[62].date},
      {t:'Descent', r:0, s:this.ads[64].date, e:this.ads[90].date},
      {t:'Holding', r:0, s:this.ads[92].date, e:this.ads[150].date},
      {t:'Approach', r:0, s:this.ads[153].date, e:sensorAt(560/575).date},
    ];

    let padit = (x, pad) => String(pad + x).slice(-pad.length);
    let pad2 = (x) => padit(x, '00')
    let fmtlbltime = (t) => { 
      let sh = pad2(t.s.getHours())
        , sm = pad2(t.s.getMinutes())
        , eh = pad2(t.e.getHours())
        , em = pad2(t.e.getMinutes())
      return `s:${sh}:${sm}, e:${eh}:${em}`;
    };

    this.render();
  }

  rowTop(rowIdx) {
    return (this.rowHeight*rowIdx) + (this.padding*rowIdx);
  }

  renderLatLong() {
    let latlong = this.ads;
    let latRange = [this.timeScale(this.ads[0].date), this.timeScale(this.ads[this.ads.length-1].date)];
    let latScale = d3.scale.linear().range([latRange[1], latRange[0]])
      .domain(d3.extent(latlong, d => d.lat));
    let longScale = d3.scale.linear().range([this.rowHeight, 0])
      .domain(d3.extent(latlong, d => d.lon));

    let latLongLine = d3.svg.line()
        .x(d => latScale(d.lat))
        .y(d => longScale(d.lon));

    linechart(row2, latLongLine, latlong, 'latlong', {
      colour: this.nextColour(),
      linewidth: '3px'
    });
  }

  renderLabels() {

    // Precompute positions
    let augLabels = this.labels.map(d => ({
      t: d.t,
      lbl: d.t.toLowerCase(),
      left: this.timeScale(d.s),
      right: this.timeScale(d.e),
      y: this.rowTop(d.r) + this.rowHeight + (this.padding / 2)
    }));

    // Bind the labels with SVG text elements
    let lblsel = this.svg.selectAll('lbl')
      .data(augLabels)
      .enter()
      .append('g')
        .attr('class', 'lbl');

    lblsel.append('text')
        .text(d => d.t)
        .attr('class', d => 'lbl' + d.lbl)
        .attr('fill', 'white')
        .attr('y', d => d.y - this.labelTextYOffs);

    // Reselect SVG text elements and centre them
    // Note: this must be a separate step because getComputedTextLength() will return
    // 0 until the text element has been rendered.
    lblsel.selectAll('text')
      .attr('x', function(d) {
        return d.left + ((d.right - d.left) / 2) - (this.getComputedTextLength() / 2);
      });

    // Bind the labels with horizontal line spans 
    lblsel.append('line')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '2px')
        .attr('x1', d => d.left)
        .attr('y1', d => d.y)
        .attr('x2', d => d.right)
        .attr('y2', d => d.y);
  }

  render() {
    let timeAxis = d3.svg.axis().scale(this.timeScale).orient('bottom').ticks(d3.time.minutes, 10);

    if (this.renderTimeAxis) {
      this.svg.append('g')
        .attr('class', 'timeaxis')
        .attr('transform', 'translate(0,' + (this.rowTop(3) - 30) + ')')
        .call(timeAxis);
      this.svg.select('g.timeaxis').selectAll('path')
        .attr('style', 'fill: none; stroke: none;');
    }

    this.timeSeries.forEach((row, rowIdx) => {
      let svgRow = this.svg.append('g').attr('transform', 'translate(0,' + this.rowTop(rowIdx) + ')');
      row.map(
        s => new TimeSeries(s.d, s.fld, this.timeExtent, this.width, this.rowHeight)
          .renderTo(svgRow, s.c))
    });

    this.renderLabels();
  }
}

