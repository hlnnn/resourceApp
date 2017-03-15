;
(function (app, mui, $, ko, _) {
  var city = app.cache.get('city'), //城市Id
    cityId = city.tableId,
    pullRefresh,
    vm;

  function Filter() {
    this.p1 = 0;
    this.p2 = 10;
    this.p4 = cityId;
  };
  
  function News(model) {
    this.tableId = model.tableId;
    this.coverImagePath = app.image.get(model.coverImagePath, app.config.noImage);
    this.theName = model.theName;
    this.dateTime = model.dateTime;

    this.title = this.theName;
    this.date = app.util.dateString(this.dateTime);
    //咨询详情
    this.goDetail = function(record) {
      app.util.goTo('informationDetail.htm', { tableId: record.tableId });
    };
  }

  function ViewModel() {
    this.filter = new Filter();
    this.news = ko.observableArray();
  }

  function search(callback) {
    app.request.postAction('tdwr', 'InformationList', vm.filter, function (response) {
      if (vm.filter.p1 === 1) {
        vm.news.removeAll();
      }
      if (response.result === 'success') {
        var datas = response.informationList;
        for (var i = 0, len = datas.length; i < len; i++) {
          vm.news.push(new News(datas[i]));
        }
      } else {
        app.messager.toast(response.info);
      }

      if (callback)
        callback(response);
    });
  }

  //初始化
  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    vm.filter.p1 = 0;
    pullRefresh = new app.module.PullRefresh('#refreshContainer', {
      down: {
        auto: true,
        callback: downPullfresh
      },
      up: {
        auto: true,
        callback: upPullfresh
      }
    });
  }

  function upPullfresh() {
    vm.filter.p1++;
    search(function (response) {
      pullRefresh.endPullupToRefresh(response.pageNumber >= response.totalPage);
    });
  }

  function downPullfresh() {
    vm.filter.p1 = 1;
    search(function () {
      pullRefresh.endPulldownToRefresh();
    });
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko, _);