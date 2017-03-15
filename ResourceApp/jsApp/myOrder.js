(function (app, mui, ko, $, _) {

  var viewModel;
  var pullRefresh;

  function Filter() {
    this.p1 = '';
    this.p2 = '';
    this.p3 = 1;
    this.p4 = 10;
  }

  function ResultItem(item) {
    this.tableId = item.tableId;

    this.orderNumber = item.orderNumber;
    this.areaName = item.areaName;
    this.orderTime = item.orderTime;
    this.contactPhone = item.contactPhone;
    this.theType = item.theType;
    this.square = item.square;
    this.valuationPurpose = item.valuationPurpose;
    this.isEvaluated = item.isEvaluated;

    this.address = item.address;
    this.contactName = item.contactName;
    this.orderTime = item.orderTime;
    this.orderType = item.orderType;
    if (this.orderType === 'registration') {
      this.orderTypeCss = '#icon-transfer-agent';
      this.orderTypeCn = '代办过户';
    } else {
      this.orderTypeCss = '#icon-commissioned-estimate';
      this.orderTypeCn = '委托评估';
    }
    switch (item.state) {
      case 1:
        this.stateCn = '待审核';
        this.stateIcon = 'icon-audit';
        this.stateColor = '#f3c350';
        break;
      case 2:
        this.stateCn = '未成功';
        this.stateIcon = 'icon-reject';
        this.stateColor = '#999';
        break;
      case 3:
        this.stateCn = '已通过';
        this.stateIcon = 'icon-pass';
        this.stateColor = '#50cb53';
        break;
      default:
        this.stateCn = '待审核';
        this.stateIcon = 'icon-audit';
        this.stateColor = '#f3c350';
    };
  }

  function ViewModel() {
    var self = this;
    this.filter = new Filter();
    this.results = ko.observableArray();
    this.orderType = ko.observable('类型');

    this.search = function (callback) {
      app.request.postActionAuth('tudwr', 'OrderListForMe', self.filter, function (response) {
        if (self.filter.p3 === 1) {
          self.results.removeAll();
          pullRefresh.scrollTo(0, 0, 200);
        }
        if (response.result === 'success') {
          var datas = response.orderList;
          for (var i = 0, len = datas.length; i < len; i++) {
            self.results.push(new ResultItem(datas[i]));
          }
        } else {
          app.messager.toast(response.info);
        }

        if (callback)
          callback(response);
      });
    };
    this.evaluation = function (record) {
      app.util.goTo('myOrderEvaluation.htm', record);
    };
    this.detail = function (record) {
      var model = mui.extend({ onlyDetail: true }, record)
      if (record.orderType === 'registration') {
        app.util.goTo('transferAgentDetail.htm', model);
      } else {
        app.util.goTo('commissionedEstimateDetail.htm', model);
      }
    };
    this.remove = function (record) {
      app.messager.confirm('提示', '确定要删除订单?', function (e) {
        if (e.index) {
          app.request.postActionAuth('tudwr', 'OrderDel', { p1: record.tableId }, function (response) {
            if (response.result === 'success') {
              self.results.remove(record);
              app.messager.toast('删除成功！');
            } else {
              app.messager.toast(response.info);
            }
          });
        }
      });
    };
    var popEl = $('.order-type'),
      mask = mui.createMask(function () {
        popEl.hide();
      });

    function hidePop() {
      mask.close();
      popEl.hide();
    }
    this.choiceOrderType = function () {
      mask.show();
      popEl.toggle();
    };
    this.allType = function () {
      self.orderType('类型');
      self.filter.p1 = '';
      self.filter.p3 = 1;
      self.search();
      hidePop();
    };
    this.transferAgent = function () {
      self.orderType('代办过户');
      self.filter.p1 = 'registration';
      self.filter.p3 = 1;
      self.search();
      hidePop();
    };
    this.commissionedEstimate = function () {
      self.orderType('委托估价');
      self.filter.p1 = 'valuation';
      self.filter.p3 = 1;
      self.search();
      hidePop();
    };
  }

  //mui.init();

  function initialize() {
    viewModel = new ViewModel();
    ko.applyBindings(viewModel);

    viewModel.filter.p3 = 0;
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
    var self = this;
    viewModel.filter.p3++;
    viewModel.search(function (response) {
      pullRefresh.endPullupToRefresh(response.pageNumber >= response.totalPage);
    });
  }

  function downPullfresh() {
    var self = this;
    viewModel.filter.p3 = 1;
    viewModel.search(function () {
      pullRefresh.endPulldownToRefresh();
    });
  }

  function events() {
    window.addEventListener('evaluation-result', function (event) {
      var detail = event.detail;
    });
  }

  app.plusReady(initialize);
  //initialize();
})(app, mui, ko, jQuery, _);