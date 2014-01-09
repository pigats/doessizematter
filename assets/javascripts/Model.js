Model = (function() {

  function Model(url, callback) {
    // depends on d3.js
    if(window.d3 === undefined) return console.log('Error in Model: d3 is not loaded');

    var type = url.substr(url.lastIndexOf('.')); // get the extension
    var _this = this;
    switch(type) {
      case '.csv'  : d3.csv(url, function(data) { _this._data = data; callback(_this) }); break;
      case '.tsv'  : d3.tsv(url, function(data) { _this._data = data; callback(_this) }); break;
      default     : console.log(type + ' is an unknown format');  
    }
  }

  // get data sample, possibly filterd 
  Model.prototype.data = function(filter) {
    if (filter === undefined) {
      return this._data;
    } else {
      return this._data.filter(filter); // filter is not persistent
    }
  }

  // get [min, max] for column key
  Model.prototype.extent = function(key) {
    if (this[key + '_extent'] === undefined) {
      this[key + '_extent'] = d3.extent(this.data(), function(d) { return +d[key] });
    }
    return this[key + '_extent'];
  }

  // get mean for column key
  Model.prototype.mean = function(key) {
    if (this[key + '_mean'] === undefined) {
      this[key + '_mean'] = d3.mean(this.data(), function(d) { return +d[key] });
    }
    return this[key + '_mean'];      
  }

  // get variance for column key
  Model.prototype.variance = function(key) {
    if (this[key + '_variance'] === undefined) {   
      var n = this.data().length;
      if (n < 1) { console.log('Error in Model: cannot compute variance of empty data set'); return this[key + '_variance'] = NaN; }
      if (n === 1) return this[key + '_variance'] = 0;
      
      var mean = this.mean(key);
      var sum = 0;
      for(var i = 0; i < n; i++) {
        var v = this.data()[i][key] - mean;
        sum += v*v;
      }
      this[key + '_variance'] = sum / (n - 1);
    }
    return this[key + '_variance'];    
  }

  // get standard deviation for column key
  Model.prototype.sigma = function(key) {
    return Math.sqrt(this.variance(key)); // just an helper, we don't need to cache everything :)    
  }

  // get Pearson correlation index for columns key1 and key2
  Model.prototype.pearsonIndex = function(key1, key2) {
    if (this[key1 + '-' + key2 + '_pearson_index'] === undefined) {
      var n = this.data().length;
      var mean1 = this.mean(key1);
      var mean2 = this.mean(key2);
      var sum = 0;

      for(var i = 0; i < n; i++) {
        sum += ((this.data()[i][key1] - mean1) * (this.data()[i][key2] - mean2));
      }      
      this[key1 + '-' + key2 + '_pearson_index'] = sum / (n * this.sigma(key1) * this.sigma(key2));
    }
    return this[key1 + '-' + key2 + '_pearson_index']; 
  }

  // add column to model, given a function to populate each row
  Model.prototype.addColumn = function(key, f) {
    var n = this.data().length;
    for(var i = 0; i < n; i++ ) {
      var d = this.data()[i];
      d[key] = f(d);
    }
  }

  return Model;
})();