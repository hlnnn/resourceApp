(function (app, mui, ko) {

  app.map.initialize('allmap');

  function MapItem(item) {
    this.latitude = item.latitude;
    this.longitude = item.longitude;
    this.itemValue = item.communityId||item.address;
    this.itemText = item.address;
  }

  function initialize() {
    var extras = app.util.getExtras(),
      latitude = extras.latitude,
      longitude = extras.longitude,
      address = extras.address,
      type=extras.type,
      communityId = extras.communityId;
    var item = new MapItem(extras);
    app.map.center(item);
    ko.applyBindings(item);
  }

  app.plusReady(initialize);
})(app, mui, ko);