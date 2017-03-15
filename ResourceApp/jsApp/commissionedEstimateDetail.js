(function (app, mui, ko, $, _) {
  var viewModel;
  var old_back = mui.back;

  function ViewModel(extras) {
    ViewModelDetail.call(this, extras);

    this.isDetail = ko.observable(false);
    this.title = ko.observable('提交成功');

    var self = this;

    this.detail = function () {
      self.isDetail(true);
      self.title('订单详情');
    };
  }

  function ViewModelDetail(extras) {
    this.orderNumber = extras.orderNumber;
    this.areaName = extras.areaName;
    this.address = extras.address;
    this.contactName = extras.contactName;
    this.contactPhone = extras.contactPhone;
    this.orderTime = extras.orderTime;
    this.theType = extras.theType;
    this.square = extras.square;
    this.valuationPurpose = extras.valuationPurpose;

    this.isDetail = ko.observable(true);
    this.title = ko.observable('订单详情');

    this.onlyDetail = extras.onlyDetail;

    this.detail = mui.noop;
    this.confirm = function () {
      old_back();
    };
    //app.module.ServiceCall.call(this);
  }

  function initialize() {
    var extras = app.util.getExtras();
    viewModel = extras.onlyDetail ? new ViewModelDetail(extras) : new ViewModel(extras);
    ko.applyBindings(viewModel);
  }

  mui.back = function () {
    if (viewModel.onlyDetail) {
      old_back();
    } else {
      if (viewModel.isDetail()) {
        viewModel.isDetail(false);
        viewModel.title('提交成功');
      } else {
        old_back();
      }
    }
  };
  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);