; (function (app, mui, $, ko, _) {

  var tableId;

  function Info(model) {
    var self = this;
    this.tableId = model.tableId;
    this.title = model.theName;
    //this.dateTime = model.dateTime;
    this.source = model.source;
    this.content = Base64.decode(model.content);

    var dateTime = model.dateTime.split('T');
    this.strDate = dateTime[0];
    this.strTime = dateTime[1];
    this.sourceAdd = '来源:' + this.source;
    this.coverImagePath = model.coverImagePath;
    var shareItems = app.module.share.shareItems;
    _.each(shareItems, function (item) {
      item.msg.href = window.location.href + '?id=' + self.tableId;
      item.msg.title = self.title;
      item.msg.thumbs = [self.coverImagePath];
      item.msg.extra.scene = item.extra;
    });
    this.shareItems = ko.observableArray(shareItems);
  }

  function search() {
    app.request.postAction('tdwr', 'InformationDetail', { p1: tableId }, function (response) {
      if (response.result === 'success') {
        ko.applyBindings(new Info(response.information));
      } else {
        app.messager.toast(response.info);
      }
    });
  }

  //初始化
  function initialize() {
    var param = app.util.getParam();
    if (_.isEmpty(param)) {
      tableId = app.util.getExtrasValue('tableId');
    } else {
      tableId = param.id;
    };
    search();
  }
  app.plusReady(initialize);
})(app, mui, jQuery, ko, _);