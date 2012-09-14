// # Recline Backbone VirtualModels
this.recline = this.recline || {};
this.recline.VirtualModel = this.recline.VirtualModel || {};


(function($, my) {

// ## <a id="dataset">VirtualDataset</a>
my.VirtualDataset = Backbone.Model.extend({
  constructor: function VirtualDataset() {
      Backbone.Model.prototype.constructor.apply(this, arguments);

      this.datasets = new Object();

      for (var k in arguments[0].datasets) {
         this.datasets[k]  = arguments[0].datasets[k];
         }


  },

  // ### initialize
  initialize: function() {
      _.bindAll(this, 'query');
      this.backend = recline.Backend.Memory;

      this.fields = new my.FieldList();
      this.records = new my.RecordList();
      this._changes = {
          deletes: [],
          updates: [],
          creates: []
      };
      this.facets = new my.FacetList();
      this.recordCount = null;
      this.queryState = new my.Query();
      this.queryState.bind('change', this.query);
      this.queryState.bind('facet:add', this.query);
      // store is what we query and save against
      // store will either be the backend or be a memory store if Backend fetch
      // tells us to use memory store
      this._store = this.backend;
      if (this.backend == recline.Backend.Memory) {
          this.fetch();
      }

  },

  // ### fetch
  //
  // Retrieve dataset and (some) records from the backend.
  fetch: function() {

  },

  // ### _normalizeRecordsAndFields
  // 
  // Get a proper set of fields and records from incoming set of fields and records either of which may be null or arrays or objects
  //
  // e.g. fields = ['a', 'b', 'c'] and records = [ [1,2,3] ] =>
  // fields = [ {id: a}, {id: b}, {id: c}], records = [ {a: 1}, {b: 2}, {c: 3}]
  _normalizeRecordsAndFields: function(records, fields) {

  },

  save: function() {

  },

  transform: function(editFunc) {

  },

  // ### query
  //
  // AJAX method with promise API to get records from the backend.
  //
  // It will query based on current query state (given by this.queryState)
  // updated by queryObj (if provided).
  //
  // Resulting RecordList are used to reset this.records and are
  // also returned.
  query: function(queryObj) {

  },

  _handleQueryResult: function(queryResult) {

  },

  toTemplateJSON: function() {

  },

  // ### getFieldsSummary
  //
  // Get a summary for each field in the form of a `Facet`.
  // 
  // @return null as this is async function. Provides deferred/promise interface.
  getFieldsSummary: function() {

  },

  // Deprecated (as of v0.5) - use record.summary()
  recordSummary: function(record) {

  },

  // ### _backendFromString(backendString)
  //
  // See backend argument to initialize for details
  _backendFromString: function(backendString) {

  }
});



// ## <a id="field">A Field (aka Column) on a Dataset</a>
my.Field = Backbone.Model.extend({
  constructor: function Field() {
    Backbone.Model.prototype.constructor.apply(this, arguments);
  },
  // ### defaults - define default values
  defaults: {
    label: null,
    type: 'string',
    format: null,
    is_derived: false
  },
  // ### initialize
  //
  // @param {Object} data: standard Backbone model attributes
  //
  // @param {Object} options: renderer and/or deriver functions.
  initialize: function(data, options) {
    // if a hash not passed in the first argument throw error
    if ('0' in data) {
      throw new Error('Looks like you did not pass a proper hash with id to Field constructor');
    }
    if (this.attributes.label === null) {
      this.set({label: this.id});
    }
    if (options) {
      this.renderer = options.renderer;
      this.deriver = options.deriver;
    }
    if (!this.renderer) {
      this.renderer = this.defaultRenderers[this.get('type')];
    }
    this.facets = new my.FacetList();
  },
  defaultRenderers: {
    object: function(val, field, doc) {
      return JSON.stringify(val);
    },
    geo_point: function(val, field, doc) {
      return JSON.stringify(val);
    },
    'float': function(val, field, doc) {
      var format = field.get('format'); 
      if (format === 'percentage') {
        return val + '%';
      }
      return val;
    },
    'string': function(val, field, doc) {
      var format = field.get('format');
      if (format === 'markdown') {
        if (typeof Showdown !== 'undefined') {
          var showdown = new Showdown.converter();
          out = showdown.makeHtml(val);
          return out;
        } else {
          return val;
        }
      } else if (format == 'plain') {
        return val;
      } else {
        // as this is the default and default type is string may get things
        // here that are not actually strings
        if (val && typeof val === 'string') {
          val = val.replace(/(https?:\/\/[^ ]+)/g, '<a href="$1">$1</a>');
        }
        return val
      }
    }
  }
});

my.FieldList = Backbone.Collection.extend({
  constructor: function FieldList() {
    Backbone.Collection.prototype.constructor.apply(this, arguments);

/*      var tmpFields = null;

      for (var k in this.datasets[k]) {

          //intersection of models field
          if(tmpFields == null) {
              tmpFields = this.datasets[k].fields;
          }  else
          {
              var found = true;
              for (var field in this.datasets[k].fields._byId) {
                  if(tmpFields._byId[field] == null)
                      tmpFields.remove(field);
              }

              for (var field in tmpFields._byId) {
                  if(this.datasets[k].fields._byId[field] == null)
                      tmpFields.remove(field);

              }


          }
      }

      for (var k in tmpFields) {
          var field = .............
      }
*/

      },
  model: my.Field
});

    // ## A Backbone collection of Records
    my.RecordList = Backbone.Collection.extend({
        constructor: function RecordList() {
            Backbone.Collection.prototype.constructor.apply(this, arguments);
        },
        model: my.Record
    });


// ## <a id="query">Query</a>
my.Query = Backbone.Model.extend({
  constructor: function Query() {
    Backbone.Model.prototype.constructor.apply(this, arguments);
  },
  defaults: function() {
    return {
      size: 100,
      from: 0,
      q: '',
      facets: {},
      filters: []
    };
  },
  _filterTemplates: {
    term: {
      type: 'term',
      // TODO do we need this attribute here?
      field: '',
      term: ''
    },
    range: {
      type: 'range',
      start: '',
      stop: ''
    },
    geo_distance: {
      type: 'geo_distance',
      distance: 10,
      unit: 'km',
      point: {
        lon: 0,
        lat: 0
      }
    }
  },  
  // ### addFilter
  //
  // Add a new filter (appended to the list of filters)
  //
  // @param filter an object specifying the filter - see _filterTemplates for examples. If only type is provided will generate a filter by cloning _filterTemplates
  addFilter: function(filter) {
    // crude deep copy
    var ourfilter = JSON.parse(JSON.stringify(filter));
    // not full specified so use template and over-write
    // 3 as for 'type', 'field' and 'fieldType'
    if (_.keys(filter).length <= 3) {
      ourfilter = _.extend(this._filterTemplates[filter.type], ourfilter);
    }
    var filters = this.get('filters');
    filters.push(ourfilter);
    this.trigger('change:filters:new-blank');
  },
  updateFilter: function(index, value) {
  },
  // ### removeFilter
  //
  // Remove a filter from filters at index filterIndex
  removeFilter: function(filterIndex) {
    var filters = this.get('filters');
    filters.splice(filterIndex, 1);
    this.set({filters: filters});
    this.trigger('change');
  },
  // ### addFacet
  //
  // Add a Facet to this query
  //
  // See <http://www.elasticsearch.org/guide/reference/api/search/facets/>
  addFacet: function(fieldId) {
    var facets = this.get('facets');
    // Assume id and fieldId should be the same (TODO: this need not be true if we want to add two different type of facets on same field)
    if (_.contains(_.keys(facets), fieldId)) {
      return;
    }
    facets[fieldId] = {
      terms: { field: fieldId }
    };
    this.set({facets: facets}, {silent: true});
    this.trigger('facet:add', this);
  },
  addHistogramFacet: function(fieldId) {
    var facets = this.get('facets');
    facets[fieldId] = {
      date_histogram: {
        field: fieldId,
        interval: 'day'
      }
    };
    this.set({facets: facets}, {silent: true});
    this.trigger('facet:add', this);
  }
});


// ## <a id="facet">A Facet (Result)</a>
my.Facet = Backbone.Model.extend({
  constructor: function Facet() {
    Backbone.Model.prototype.constructor.apply(this, arguments);
  },
  defaults: function() {
    return {
      _type: 'terms',
      total: 0,
      other: 0,
      missing: 0,
      terms: []
    };
  }
});

// ## A Collection/List of Facets
my.FacetList = Backbone.Collection.extend({
  constructor: function FacetList() {
    Backbone.Collection.prototype.constructor.apply(this, arguments);
  },
  model: my.Facet
});

// ## Object State
//
// Convenience Backbone model for storing (configuration) state of objects like Views.
my.ObjectState = Backbone.Model.extend({
});


// ## Backbone.sync
//
// Override Backbone.sync to hand off to sync function in relevant backend
Backbone.sync = function(method, model, options) {
  return model.backend.sync(method, model, options);
};

}(jQuery, this.recline.VirtualModel));

