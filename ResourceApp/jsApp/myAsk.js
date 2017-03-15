(function (app, mui, $, ko, _) {
  
  function Question() {
    this.ask = '';
    this.ask_desc = '';
  }

  function ViewModel() {
    Question.call(this);
    var self = this;

    // 提交
    this.summitAsk = function (v, e) {
      if (!app.validate.require(self.ask, '问题')) {
        return;
      }
      app.request.postActionAuth('tudwr', 'QuestionAdd', {
        p1: self.ask,
        p2: app.localStorage.getCity().tableId,
        p3: self.ask_desc
      }, e.target, function (response) {
        if (response.result === 'success') {
          app.util.goTo('myQuestionSubmitSuccess.htm', { closeWebviewId: mui.currentWebview.id });
          var opener = plus.webview.getWebviewById('myQuestionContent.htm');
          app.util.fire(opener, 'reload');
        } else {
          app.messager.toast(response.info);
        }
      });
    };

    // 确定
    this.confirm = function () {
      var webview = plus.webview.getWebviewById('myQuestion.htm');
      if (!webview)
        webview = plus.webview.getWebviewById('myHouseQuestion.htm');

      if (webview)
        webview.close('none');
      mui.currentWebview.close();
    };

    // 查看我的问答
    this.checkMyAsk = function () {
      mui.back();
    };
  }

  function initialize() {
    var vm = new ViewModel();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)