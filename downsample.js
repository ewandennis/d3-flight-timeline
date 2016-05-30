function downSample(records, width) {
  let samplesPerPixel = records.length / width;
  return records.filter((d, i) => i % Math.ceil(samplesPerPixel * 2) == 0)
}

