(function (app, mui, ko, $, _) {
  var viewModel;

  function validate(item) {
    return app.validate.require(item.areaId, '行政区域') &&
      app.validate.require(item.address, '产证地址') &&
      app.validate.require(item.contactName, '联系人') &&
      app.validate.validatePhone(item.contactPhone, '联系电话') &&
      app.validate.require(item.theType, '办证类型') &&
      app.validate.require(item.orderTime, '预约时间') &&
      app.validate.require(item.orderDateId, '预约时间');
  }

  function Agent(item) {
    this.areaId = item.areaId;
    this.address = item.address();
    this.contactName = item.contactName();
    this.contactPhone = item.contactPhone();
    this.theType = item.theType();
    this.orderTime = item.orderTime();
    this.orderDateId = item.orderDateId;
  }

  function ViewModel() {
    var self = this;
    this.areaName = ko.observable();
    this.areaId = '';
    this.address = ko.observable();
    this.contactName = ko.observable();
    this.contactPhone = ko.observable();
    this.theType = ko.observable();
    this.orderTime = ko.observable();
    this.orderDateId = '';
    this.isRead = ko.observable(true);

    this.isNext = ko.observable(false);
    this.title = ko.observable('代办过户');

    this.choiceArea = function () {
      app.util.goTo('ctrlAdministrativeDivision.htm', {
        selected: self.areaName()
      });
    };
    this.choiceTheType = function () {
      app.util.goTo('ctrlCertificateType.htm', {
        selected: self.theType()
      });
    };
    this.choiceOrderTime = function () {
      app.util.goTo('ctrlAppointment.htm', {
        selected: self.orderTime()
      });
    };
    this.serviceStatement = function (view, e) {
      e.stopPropagation();
      app.util.goTo(e.target.href, { type: plus.webview.currentWebview().id });
    };
    this.next = function () {
      var agent = new Agent(self);
      if (validate(agent)) {
        if (!self.isRead()) {
          app.messager.alert('提示', '请同意服务声明');
        } else {
          self.isNext(true);
          self.title('确定订单');
        }
      }
    };
    this.submit = function () {
      var model = new Agent(self);
      app.request.postActionAuth('tudwr', 'OrderRegistrationAdd', model, function (response) {
        if (response.result === "success") {
          var data = response.orderRegistration;
          mui.extend(model, {
            orderNumber: data.orderNumber,
            areaName: self.areaName(),
            closeUntilWebviewId: 'home.htm'
          });
          app.util.goTo('transferAgentDetail.htm', model);
        } else {
          app.messager.toast(response.info);
        }
      });
    };
    app.module.ServiceCall.call(this, '400-663-8008');
  };

  function initialize() {
    viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    events();
  }

  function events() {
    window.addEventListener('choice-selected', function (event) {
      var detail = event.detail,
        type = detail.type,
        selected = detail.selected;
      if (type === 'certificateType') {
        viewModel.theType(selected);
      } else if (type === 'administrativeDivision') {
        viewModel.areaId = selected.tableId;
        viewModel.areaName(selected.theName);
      } else if (type === 'appointment') {
        viewModel.orderDateId = selected.tableId;
        viewModel.orderTime(selected.timeString + ' ' + selected.halfDay);
      }
    });
  }

  var old_back = mui.back;
  mui.back = function () {
    if (viewModel.isNext()) {
      viewModel.isNext(false);
      self.title('代办过户');
    } else {
      old_back();
    }
  };

  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);