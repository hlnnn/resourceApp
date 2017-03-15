(function (app, mui, $, ko) {
  var type = 'disclaimer';
  var feedback = 'feedback';

  function ViewModel(config) {
    //var self = this;
    //  this.currentPage = 1;
    //  this.pageNumber = 1;
    //    this.p1 = function () {
    //      return self.currentPage;
    //    }
    //    this.p2 = function () {
    //      return self.pageNumber;
    //    }

    this.isMessage = config.isMessage;
    this.isPush = config.isPush;
    this.noImage = config.noImage;

    this.feedback = function () {
      app.util.goTo('myFeedback.htm', {
        feedback: feedback
      });
    }
    this.aboutUs = function () {
      app.util.goTo('myAboutUs.htm');
    }
    this.disclaimerTap = function () {
      app.util.goTo('agreeStatement.htm', {
        type: type
      });
    }
    this.messageToggle = function (v, e) {
      config.isMessage = e.detail.isActive;
      updateConfig(config);
    };
    this.pushToggle = function (v, e) {
      config.isPush = e.detail.isActive;
      updateConfig(config);
    };
    this.noImageToggle = function (v, e) {
      config.noImage = e.detail.isActive;
      updateConfig(config);
      var home = plus.webview.getWebviewById('home.htm');
      app.util.fire(home, 'toggle-noImage', {
        noImage: config.noImage
      });
    };
    this.clearCache = function (v, e) {
      app.messager.unopened();
    };
  }

  function updateConfig(config) {
    app.cache.set('config', config);
  }

  function initialize() {
    app.util.show();
  }

  (function () {
    var config = mui.extend({
      noImage: false,
      isMessage: true,
      isPush: true
    }, app.cache.get('config'));
    var vm = new ViewModel(config);
    updateConfig(config);
    //  var city = app.localStorage.getCity(),
    //    cityId = city.tableId;
    //  app.request.postAction('tdwr', 'RecommendAppList', {
    //    p1: pageNumber,
    //    p2: currentPage,
    //    p3: cityId
    //  }, function (response) {
    //    if (response.result === 'success') {
    //      console.log(_.pairs(response));
    //      console.log(_.pairs(response.recommendAppList[0]));
    //    } else {
    //      app.Message.toast('没有数据');
    //    }
    //  });

    ko.applyBindings(vm);
  })();

  app.plusReady(initialize);

})(app, mui, jQuery, ko)