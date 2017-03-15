(function (app, mui, ko, $, _) {
  var viewModel;

  function validate(item) {
    return app.validate.require(item.areaId, '行政区域') &&
      app.validate.require(item.address, '产证地址') &&
      app.validate.require(item.contactName, '联系人') &&
      app.validate.validatePhone(item.contactPhone, '联系电话') &&
      app.validate.require(item.orderTime, '预约时间') &&
      app.validate.require(item.orderDateId, '预约时间') &&
      app.validate.require(item.theType, '物业类型') &&
      app.validate.require(item.valuationPurpose, '估价目的') &&
      app.validate.require(item.square, '房屋面积');
  }

  function Commission(item) {
    this.areaId = item.areaId;
    this.address = item.address();
    this.contactName = item.contactName();
    this.contactPhone = item.contactPhone();
    this.orderTime = item.orderTime();
    this.orderDateId = item.orderDateId;
    this.theType = item.theType();
    this.valuationPurpose = item.valuationPurpose();
    this.square = item.square();
  }

  function ViewModel() {
    var self = this;

    this.areaName = ko.observable();
    this.areaId = '';
    this.address = ko.observable();
    this.contactName = ko.observable();
    this.contactPhone = ko.observable();
    this.orderTime = ko.observable();
    this.orderDateId = '';
    this.theType = ko.observable();
    this.valuationPurpose = ko.observable();
    this.square = ko.observable();
    this.isRead = ko.observable(true);

    this.title = ko.observable('委托评估');
    this.isNext = ko.observable(false);

    this.choiceArea = function () {
      app.util.goTo('ctrlAdministrativeDivision.htm', {
        selected: self.areaName()
      });
    };
    this.choiceOrderTime = function () {
      app.util.goTo('ctrlAppointment.htm', {
        selected: self.orderTime()
      });
    };
    this.choiceTheType = function () {
      app.util.goTo('ctrlPropertyType.htm', {
        selected: self.theType()
      });
    };
    this.choiceValuationPurpose = function () {
      app.util.goTo('ctrlValuationPurpose.htm', {
        selected: self.valuationPurpose()
      });
    };
    this.serviceStatement = function (vm, e) {
      e.stopPropagation();
      app.util.goTo(e.target.href, { type: plus.webview.currentWebview().id });
    };
    this.next = function () {
      var model = new Commission(self);
      if (validate(model)) {
        if (!self.isRead()) {
          app.messager.alert('提示', '请同意服务声明');
        } else {
          self.isNext(true);
          self.title('确定订单');
        }
      }
    };
    this.submit = function () {
      var model = new Commission(self);
      app.request.postActionAuth('tudwr', 'OrderValuationAdd', model, function (response) {
        if (response.result === "success") {
          var data = response.orderValuation;
          mui.extend(model, {
            orderNumber: data.orderNumber,
            areaName: self.areaName(),
            closeUntilWebviewId: 'home.htm'
          });
          app.util.goTo('commissionedEstimateDetail.htm', model);
        } else {
          app.messager.toast(response.info);
        }
      });
    };
    app.module.ServiceCall.call(this,'400-663-8008');
  }

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
      if (type === 'administrativeDivision') {
        viewModel.areaId = selected.tableId;
        viewModel.areaName(selected.theName);
      } else if (type === 'appointment') {
        viewModel.orderDateId = selected.tableId;
        viewModel.orderTime(selected.timeString + ' ' + selected.halfDay);
      } else if (type === 'propertyType') {
        viewModel.theType(selected);
      } else if (type === 'valuationPurpose') {
        viewModel.valuationPurpose(selected);
      }
    });
  }

  var old_back = mui.back;
  mui.back = function () {
    if (viewModel.isNext()) {
      viewModel.isNext(false);
      self.title('委托评估');
    } else {
      old_back();
    }
  };

  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);