'use strict';

function linechart(svg, line, records, classname, options) {
  svg.append('path').attr('class', 'line' + classname);
  svg.select('path.line' + classname)
    .attr('fill', 'none')
    .attr('stroke', options.colour || 'white')
    .attr('stroke-width', options.linewidth || '3px')
    .datum(records);
  svg.select('path.line' + classname).attr('d', line);
}

