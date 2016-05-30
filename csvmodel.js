'use strict';

/*
 * Provide a very simple view on a CSV file
 */

class CSVModel {
  constructor (url, fmtRecord) {
    this.url = url;
    this.fmtRecord = fmtRecord;
  }

  load(next) {
    d3.csv(this.url, this.fmtRecord, (err, data) => {
      if (err) {
        return next(err);
      }
      this.records = data;
      next(null, data);
    });
  }

  loadP() {
    return new Promise((resolve, reject) => {
      this.load((err, data) => {
        if (err) {
          return reject(err);
        }
        this.records = data;
        return resolve(this);
      });
    });
  }

  filter(predicate) {
    return this.records.filter(predicate);
  }
}

