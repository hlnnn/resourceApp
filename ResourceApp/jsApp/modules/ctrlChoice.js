(function (app, mui, ko) {

  function Choice(extras) {
    this.title = extras.title;
    this.datas = ko.observableArray(JSON.parse(extras.datas));
    this.selectedItem = ko.observable(extras.selected);
    var self = this;
    this.selected = ko.pureComputed({
      read: this.selectedItem,
      write: function (value) {
        var record = _.find(self.datas(), function (t) { return t.value === value; });
        self.selectedItem(value);
        var opener = plus.webview.currentWebview().opener();
        app.util.fire(opener, 'choice-selected-' + extras.type, {
          selected: record
        });
        mui.back();
      }
    });
  }

  function ChoiceMutli(extras) {
    this.title = extras.title;
    this.datas = ko.observableArray(JSON.parse(extras.datas));
    this.selecteds = ko.observableArray(extras.selecteds);
    var self = this;
    this.confirm = function () {
      var selecteds = self.selecteds();
      var datas = self.datas();
      var filter = _.filter(datas, function (el) { return _.contains(selecteds, el.value); });
      var opener = plus.webview.currentWebview().opener();
      app.util.fire(opener, 'choice-selected-' + extras.type, {
        selecteds: filter
      });
      mui.back();
    };
  }

  app.module.Choice = Choice;
  app.module.ChoiceMutli = ChoiceMutli;

})(app, mui, ko);