; (function (app, mui, $, ko, _) {
  function ViewModel() {
    this.goBack = function () {
      var myHouse = plus.webview.getWebviewById('myHouse.htm');
      plus.webview.close('publishHouseFirst.htm');
      plus.webview.close('publishHouseSecond.htm');
      if(myHouse){
        myHouse.reload(true);
      }
      mui.back();
    };
    this.goContinue = function() {
      app.util.goTo('publishHouseFirst.htm');
    };
  }
  function initialize() {
    var vm = new ViewModel();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _);