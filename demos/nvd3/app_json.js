jQuery(function($) {
  window.dataExplorer = null;
  window.explorerDiv = $('.data-explorer-here');

  // This is some fancy stuff to allow configuring the multiview from
  // parameters in the query string
  //
  // For more on state see the view documentation.
  var state = recline.View.parseQueryString(decodeURIComponent(window.location.search));
  if (state) {
    _.each(state, function(value, key) {
      try {
        value = JSON.parse(value);
      } catch(e) {}
      state[key] = value;
    });
  } else {
    state.url = 'demo';
  }
  var dataset = null;
  if (state.dataset || state.url) {
    var datasetInfo = _.extend({
        url: state.url,
        backend: state.backend
      },
      state.dataset
    );
    dataset = new recline.Model.Dataset(datasetInfo);
  } else {
      var dataset = new recline.Model.Dataset({
          url: 'http://jsonpdataproxy.appspot.com/?type=csv&url=http://www.inps.it/docallegati//Mig/OpenData/5XQCOZM5.csv',
          // optional rows parameter specifies how many rows to retrieve - default is a 1000
          // rows: 5000
          backend: 'jsonp'
      });

      //passare fields e data
      // json must have a fields array containing data column and a "data" field containing data


      dataset.fetch();


  }
  createExplorer(dataset, state);
});


// make Explorer creation / initialization in a function so we can call it
// again and again
var createExplorer = function(dataset, state) {
  // remove existing data explorer view
  var reload = false;
  if (window.dataExplorer) {
    window.dataExplorer.remove();
    reload = true;
  }
  window.dataExplorer = null;
  var $el = $('<div />');
  $el.appendTo(window.explorerDiv);

  var views = [
    {
      id: 'grid',
      label: 'Grid',
      view: new recline.View.SlickGrid({
        model: dataset
      })
    },
    {
      id: 'graph',
      label: 'Graph',
      view: new recline.View.Graph({
        model: dataset
      })
    },
    {
      id: 'map',
      label: 'Map',
      view: new recline.View.Map({
        model: dataset
      })
    },
    {
      id: 'transform',
      label: 'Transform',
      view: new recline.View.Transform({
        model: dataset
      })
    },
    {
      id: 'nvd3linegraph',
      label: 'NVD3 LineGraph',
      view: new recline.View.NVD3LineGraph({
      model: dataset
          })
    },
      {
          id: 'nvd3stackedarea',
          label: 'NVD3 StackedArea',
          view: new recline.View.NVD3StackedArea({
              model: dataset
          })
      }

  ];

  window.dataExplorer = new recline.View.MultiView({
    model: dataset,
    el: $el,
    state: state,
    views: views
  });
}

