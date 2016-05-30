'use strict';

/*
 * Define, load, condition and render datasets
 */

function vecmag(v) {
  return Math.sqrt(
    (v[0] * v[0]) + 
    (v[1] * v[1]) +
    (v[2] * v[2])
  );
}

let sensormodel = new CSVModel('flight_20160314.csv', rec => {
    let accel = [+rec.accelx, +rec.accely, +rec.accely],
      gravity = [+rec.gravityx, +rec.gravityy, +rec.gravityz],
      linaccel = [+rec.linaccelx, +rec.linaccely, +rec.linaccelz],
      gyr = [+rec.gyrx, +rec.gyry, +rec.gyrz],
      mag = [+rec.magx, +rec.magy, +rec.magz];
    return {
      date: new Date(rec.datestamp),
      accel: accel,
      gravity: gravity,
      gyr: gyr,
      mag: mag,
      pitch: +rec.orientpitch,
      roll: +rec.orientroll,
      azimuth: +rec.orientazimuth, 
      pressure: +rec.pressure,
      sound: +rec.sound,
      gravmag: vecmag(gravity),
      accelmag: vecmag(accel),
      linaccelmag: vecmag(linaccel),
      magmag: vecmag(mag),
      gyrmag: vecmag(gyr)
    };
  })
  , adsmodel = new CSVModel('flighttrack.csv', rec => { 
    let dateparts = /^([A-Za-z]+)\s+(\d\d):(\d\d):(\d\d)\s+([AP]M)$/.exec(rec.timestamp)
      , pmoffs = dateparts[5] == 'PM' ? 12 : 0
      , course = /^(\d+)\D*$/.exec(rec.course);
    return {
      date: new Date(2016, 2, 14, +dateparts[2] + pmoffs, +dateparts[3], +dateparts[4]),
      lat: +rec.lat,
      lon: +rec.lon,
      course: +rec.course[1],
      direction: rec.direction,
      kts: +rec.kts,
      mph: +rec.mph,
      altft: +rec.altft,
      climbft: +rec.climbft,
      datasource: rec.datasource
    };
  });

Promise.all([sensormodel.loadP(), adsmodel.loadP()]).then(res => {
  new FlightChart(res[0].records, res[1].records, document.getElementById('frame'));
//  document.getElementById('savebtn').innerHTML = makeSVGLink('chart');
})
.catch(err => { throw err; });

