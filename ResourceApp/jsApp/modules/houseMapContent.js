(function (app, ko) {
  var city = app.localStorage.getCity(),
    cityId = city.tableId,
    vm;
  var type,
    dataPack,
    filter,
    all;

  function setParams(param) {
    filter = param.filter;
    dataPack = param.dataPack;
    type = param.type;
    all = param.all;
  }

  function ViewModel() {
    var self = this;
    this.editing = ko.observable(false);

    this.position = ko.pureComputed(function () {
      app.location.position(function (response) {
        var coords = response.coords,
          latitude = coords.latitude,
          longitude = coords.longitude;
        map.panTo(new BMap.Point(longitude, latitude));
      });
    });
    this.drawing = ko.pureComputed(function () {
      var myDrawingManagerObject = new BMapLib.DrawingManager(map, {
        isOpen: true,
        drawingType: BMAP_DRAWING_MARKER,
        enableDrawingTool: true,
        enableCalculate: false,
        drawingToolOptions: {
          anchor: BMAP_ANCHOR_TOP_LEFT,
          offset: new BMap.Size(5, 5),
          drawingTypes: [
            BMAP_DRAWING_MARKER,
            BMAP_DRAWING_CIRCLE,
            BMAP_DRAWING_POLYLINE,
            BMAP_DRAWING_POLYGON,
            BMAP_DRAWING_RECTANGLE
          ]
        },
        polylineOptions: {
          strokeColor: "#333"
        }
      });
      myDrawingManagerObject.addEventListener("circlecomplete", function (e, overlay) {
        console.log(overlay);
      });
      myDrawingManagerObject.addEventListener("overlaycomplete", function (e) {
        console.log([e.drawingMode, e.overlay, e.calculate, e.label]);
      });
    });
    this.clear = ko.pureComputed(function () {
      self.editing(false);
    });
  }

  //function search() {
  //  type = app.util.getExtrasValue('type');
  //  app.request.postAction('tdwr', type.requestUrl, filter, function (response) {
  //    console.log(_.pairs(response));
  //    app.map.load(_.map(response.communityList, function (el) {
  //      el.itemValue = el.tableId;
  //      el.itemText = _.sprintf('%(theName)s %(count)s套', el);
  //      return el;
  //    }), all);
  //  });
  //}

  function initialize() {
    events();
    //search();
    app.map.initialize('allmap');

    vm = new ViewModel();
    ko.applyBindings(vm, document.getElementById('mapContent'));
  }

  function events() {
    window.addEventListener('list-research', function (event) {
      setParams(event.detail);
      search();
    });
  }

  app.plusReady(initialize);

})(app, ko);