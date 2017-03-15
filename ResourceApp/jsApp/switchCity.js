(function (mui, app, ko, _) {

  function City(tableId, theName) {
    this.tableId = tableId;
    this.theName = theName;
  }

  function Mapping(firstChar, cities) {
    this.firstChar = firstChar;
    this.cities = cities;
  }

  function Filter() {
    this.keyword = '';
  }

  //Filter.prototype.search = function (cities, callback) {
  //  var keyword = this.keyword;
  //  if (keyword) {
  //    var array = _.filter(cities, function (el) {
  //      return _.str.include(el.theName, keyword) || el.firstLetter.toLocaleLowerCase() === keyword[0].toLocaleLowerCase();
  //    });
  //    callback(array);
  //  } else {
  //    callback(cities);
  //  }
  //};

  function Position() {
    this.maps = ko.observableArray();
    this.currentCity = ko.observable();
    this.load();
  }

  Position.prototype.switchCity = function (record) {
    app.location.switchCity(record);
  };

  Position.prototype.load = function () {
    var city = app.localStorage.getCity();
    if (city) {
      this.currentCity(city.theName);
    } else {
      this.currentCity(app.defaultCity.theName);
    }
  };

  var filter = new Filter();
  var position = new Position();

  function initialize() {
    events();
    ko.applyBindings(position, document.getElementById('city-list'));
    app.request.postAction('tdwr', 'CityList', {}, function (response) {
      var cities = response.cityList;
      var search = filter.search;
      filter.search = function (record, event) {
        filter.keyword = event.target.value;
        search(cities, function (result) {
          bindData(result);
        });
      };
      bindData(cities);
    });
  }

  function bindData(data) {
    var groups = _.groupBy(data, function (el) { return el.firstLetter; });
    var mappings = _.map(groups, function (val, key) {
      return new Mapping(key, _.map(val, function (el) {
        return new City(el.tableId, el.theName);
      }));
    });
    position.maps(mappings);

    var header = document.querySelector('header.mui-bar');
    var list = document.getElementById('list');
    //calc hieght
    list.style.height = (document.body.offsetHeight - header.offsetHeight) + 'px';

    //create
    window.indexedList = new mui.IndexedList(list);
  }
  //定位
  function events() {
    $('#getLocation').on('tap', function () {
      app.location.getLocation();
    });

    var first;
    //trigger(webview, 'pagebeforeshow', false);
    document.addEventListener('pagebeforeshow', function () {
      if (first) {
        //console.log('switchCity.htm pagebeforeshow');
        position.load();
      }
      first = true;
    }, false);
  }

  mui.init();
  app.plusReady(initialize);

})(mui, app, ko, _);