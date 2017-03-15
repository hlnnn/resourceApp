(function (app, mui, $, ko) {
  var feedback;
  var feedbackPicker;

  function Feedback(item) {
    this.p1 = item.feedbackContent;
    this.p2 = item.contactMethod;
    this.p3 = item.feedback();
    this.p4 = item.houseType;
    this.p5 = item.type;
    this.cityId = app.cache.get('city').tableId;
  }

  function validate(model) {
    return app.validate.require(model.p3, '意见反馈') &&
      app.validate.require(model.p1, '内容') &&
      app.validate.require(model.p2, '联系方式');
  }

  function ViewModel() {
    var self = this;
    var extras = app.util.getExtras(),
      type = extras.type,
      houseId = extras.houseId;
    feedback = extras.feedback;

    this.feedback = ko.observable('意见反馈');
    this.feedbackContent = '';
    this.contactMethod = '';
    this.type = '';
    this.houseType = '';
    if (this.type === 'saleHouse') {
      this.houseType = 0;
    } else if (this.type === 'rentOffice') {
      this.houseType = 1;
    } else if (this.type === 'rentShop') {
      this.houseType = 2;
    } else if (this.type === 'saleHouse') {
      this.houseType = 3;
    } else if (this.type === 'saleOffice') {
      this.houseType = 4;
    } else if (this.type === 'saleShop') {
      this.houseType = 5;
    } else if (this.type === 'newHouse') {
      this.houseType = 12;
    }

    this.houseId = houseId;
    this.send = function () {
      var model = new Feedback(self);
      if (validate(model)) {
        app.request.postActionAuth('tudwr', 'FeedbackAdd', model, function (response) {
          if (response.result === 'success') {
            if (feedback === 'feedback') {
              app.messager.toast('成功');
              mui.back();
            } else if (feedback === 'housingReport') {
              app.util.goTo('housingReportedSuccess.htm', { closeWebviewId: plus.webview.currentWebview().id });
            }
          } else {
            app.messager.toast(response.info);
          }
        });
      }
    }

    this.feedbackTap = function () {
      feedbackPicker.show(function (selectedItem) {
        self.feedback(selectedItem[0]);
      });
    };
  }

  function initialize() {      
    var vm = new ViewModel();
    ko.applyBindings(vm);
  
    feedbackPicker = function () {
      var picker = new mui.PopPicker();
      if (feedback === 'feedback') {
        picker.setData(['意见反馈', '房源投诉', '用户举报', '其他']);
      } else if (feedback === 'housingReport') {
        picker.setData(['意见反馈', '房源投诉', '用户举报', '价格不真实', '房屋不真实', '房屋已租', '房源已卖', '与描述不符', '其他']);
      }
      return picker;
    }();
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko)