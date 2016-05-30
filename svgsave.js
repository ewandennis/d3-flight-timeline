function makeSVGLink(svgID, csspath) {
  let preamble = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
  let doctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

  if (csspath) {
    preamble = preamble + '<?xml-stylesheet href="' + csspath + '" type="text/css" ?>\n';
  }

  let svgmarkup = document.getElementById(svgID).outerHTML;
  let svgenc = btoa(preamble + doctype + svgmarkup);
  return "<a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n" + svgenc + "' title='chart.svg'>Download</a>";
}

