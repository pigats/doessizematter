ScatterPlot = (function() {
  
  function ScatterPlot(model, canvas, axes) { // axes is an object {x: 'key_x', y: 'key_y'}
    // depends on d3.js
    if(window.d3 === undefined) return console.log('Error in ScatterPlot: d3 is not loaded');

    this.canvas = canvas;
    this.margin = 40;
    this.width = parseInt(window.getComputedStyle(this.canvas).getPropertyValue('width')) - this.margin;
    this.height = parseInt(window.getComputedStyle(this.canvas).getPropertyValue('height')) - this.margin;
    this.x_range = [this.margin, this.width];
    this.y_range = [this.height, this.margin];

    this.model = model;
    this.x = axes.x;
    this.y = axes.y;

    // allow for lazyloading
    var _this = this;
    this.canvas.addEventListener('click', function(e) { _this.click(e, _this) }, true );
    return this; // I <3 method chainability on the constructor!
  }

  ScatterPlot.prototype.click = function(e, _this) {
    _this.canvas.removeEventListener('click'); 
    _this.draw();
  }

  ScatterPlot.prototype.draw = function(filter) {

    // draw axes with their labels
    d3.select(this.canvas)
      .attr('data-drawn', 'true') 
      .append('g')
      .attr('class', 'plot-axis plot-axis-x')
      .attr('transform', 'translate(0, ' + this.height + ')')
      .call(this.axis('x'));

    d3.select(this.canvas)
      .select('.plot-axis-x')
      .append('text')
      .attr('class', 'plot-axis-label')
      .text(this.x)
      .attr('transform', 'translate(' + (this.width - 50) + ', 40)');
    
    d3.select(this.canvas)
      .append('g')
      .attr('class', 'plot-axis plot-axis-y')
      .attr('transform', 'translate(' + this.margin + ', 0)')
      .call(this.axis('y').orient('left'));

    d3.select(this.canvas)
      .select('.plot-axis-y')
      .append('text')
      .attr('class', 'plot-axis-label')
      .text(this.y)
      .attr('transform', 'rotate(-90, 0, 0) translate(-80, -30)');


    // draw the +- standard deviation rectangle (background)
    var mean_value = this.scale('y')(this.model.mean(this.y));
    var mean_interval = this.scale('y')(0) - this.scale('y')(this.model.sigma(this.y));

    d3.select(this.canvas)
      .append('rect')
      .attr('class', 'plot-mean-interval')
      .attr('width', this.width - this.margin)
      .attr('height', mean_interval * 2)
      .attr('transform', 'translate('+ this.margin + ', ' +  (mean_value - mean_interval) + ')');


    // draw data points
    _this = this;
    d3.select(this.canvas)
      .selectAll('circle.plot-data-point')
      .data(this.model.data(filter))
      .enter()
        .append('circle')
        .attr('class', 'plot-data-point')
        .attr('r', 3)
        .attr('cx', function(d) { return _this.scale('x')(d[_this.x]) } )
        .attr('cy', function(d) { return _this.scale('y')(d[_this.y]) } );
    
    // draw the mean line (foreground)
    d3.select(this.canvas)
      .append('line')
      .attr('class', 'plot-mean-value')
      .attr('x1', this.margin)
      .attr('y1', mean_value)
      .attr('x2', this.width)
      .attr('y2', mean_value);

  }

  // think of these below as private

  ScatterPlot.prototype.scale = function(axis) {
    if (this[axis + '_scale'] === undefined) {
      this[axis + '_scale'] = d3.scale.linear().range(this[axis + '_range']).domain(this.model.extent(this[axis]));
    }
    return this[axis + '_scale'];
  }

  ScatterPlot.prototype.axis = function(axis) {
    if (this[axis + '_axis'] === undefined) {
      this[axis + '_axis'] = d3.svg.axis().scale(this.scale(axis));
    }
    return this[axis + '_axis'];    
  }

  ////////////////////////////////////


  return ScatterPlot;
})();