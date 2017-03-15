;
(function (app, mui, $, ko, _) {
  var totalPage = 0,
    pullRefresh,
    vm;

  function InfoContent(model) {
    var self = this;
    this.tableId = model.tableId;
    this.title = model.title;
    this.content = model.content;
    this.state = model.state;

    if (model.sendDatetime) {
      this.strDate = app.util.dateString(model.sendDatetime);
      this.sendDatetime = model.sendDatetime.split('T');
      //this.strDate = this.sendDatetime[0];
      this.strTime = this.sendDatetime[1].split('.')[0];
      this.strAddDatetime = this.strDate + ' ' + this.strTime;
    } else {
      this.strAddDatetime = '';
    }

    this.readingVisible = ko.observable(false);
    this.readyingCss = ko.observable('');
    this.updateState = function () { };

    if (this.state === 1) {
      this.readingVisible(true);
      this.readyingCss('readying');
      this.updateState = function (record) {
        app.request.postActionAuth('tudwr', 'NoticeUpdateState', { p1: record.tableId }, function (response) {
          if (response.result === 'success') {
            self.readingVisible(false);
            self.readyingCss('');
            self.updateState = function () { };
            app.util.fire(plus.webview.currentWebview().opener(), 'message-readed');
          }
        });
      };
    }
  }

  function ViewModel() {
    this.filter = {
      p1: 0,
      p2: '',
      p3: 0,
      p4: 10
    }
    this.infoes = ko.observableArray();
    this.search = function (callback) {
      search(callback);
    };
  }

  function search(callback) {
    app.request.postActionAuth('tudwr', 'NoticeListForMe', vm.filter, function (response) {
      if (vm.filter.p3 === 1) {
        vm.infoes.removeAll();
      }
      if (response.result === 'success') {
        var noticeList = response.noticeList;
        totalPage = JSON.stringify(response.totalPage);
        for (var i = 0; i < noticeList.length; i++) {
          vm.infoes.push(new InfoContent(noticeList[i]));
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
    vm.filter.p3++;
    search(function (response) {
      pullRefresh.endPullupToRefresh(response.pageNumber >= response.totalPage);
    });
  }

  function downPullfresh() {
    vm.filter.p3 = 1;
    search(function () {
      pullRefresh.endPulldownToRefresh();
    });
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko, _);