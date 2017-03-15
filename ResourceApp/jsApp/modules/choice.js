(function (app, mui, ko) {

  function Choice(type, items) {
    var self = this;
    this.items = ko.observable(items);
    this.type = type;
    this.selectedItem = app.util.getExtrasValue('selected');
    this.selected = function (record) {
      self.selectedItem = record;
      var opener = plus.webview.currentWebview().opener();
      app.util.fire(opener, 'choice-selected', {
        type: self.type,
        selected: record
      });
      mui.back();
    };
  }

  app.module.Choice = Choice;

})(app, mui, ko);
