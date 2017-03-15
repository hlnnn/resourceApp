(function (app, mui, ko, $, _) {

  var viewModel;
  var starSelectedCss = 'selected iconfont icon-star-selected';

  function ResultItem(item) {
    this.tableId = item.tableId;
    this.address = item.address;
    this.contactName = item.contactName;
    this.orderTime = item.orderTime;
    this.orderTypeCss = item.orderTypeCss;
    this.orderTypeCn = item.orderTypeCn;
  }

  function Evaluation(self) {
    this.p1 = self.tableId;
    this.p2 = self.serviceAttribute;
    this.p3 = self.replyEfficiency;
    this.p4 = self.satisfactionDegree;
    this.p5 = self.overallEvaluation;
    this.p6 = self.comment;
  }

  function validate(self) {
    return app.validate.require(self.p6, '评价');
  }

  function ViewModel(extras) {
    ResultItem.call(this, extras);

    this.serviceAttribute = 0;
    this.replyEfficiency = 0;
    this.satisfactionDegree = 0;
    this.overallEvaluation = 0;
    this.comment = '';

    var self = this;

    this.submit = function () {
      var model = new Evaluation(self);
      if (validate(model)) {
        app.request.postActionAuth('tudwr', 'OrderEvaluate', model, function (response) {
          if (response.result === 'success') {
            app.messager.toast('提交成功');
            mui.back();
          } else {
            app.messager.toast(response.info);
          }
        });
      }
    };
  }

  function initialize() {
    var extras = app.util.getExtras();
    viewModel = new ViewModel(extras);
    ko.applyBindings(viewModel);
  }

  function events() {
    mui('.evaluation').on('tap', 'i', function (e) {
      var el = $(e.target),
        parent = el.parent(),
        prop = parent[0].id,
        selecteds = el.prevAll(),
        point = selecteds.length + 1;

      parent.children(starSelectedCss).removeClass(starSelectedCss);
      selecteds.addClass(starSelectedCss);
      el.addClass(starSelectedCss);
      viewModel[prop] = point;
    });
  }

  mui.init();

  app.plusReady(initialize);
  events();

})(app, mui, ko, jQuery, _);