(function (app, mui, $, ko, _) {
  var vm;

  mui.init({
    gestureConfig: {
      longtap: true //默认为false
    }
  });

  function ViewModel() {
    var self = this;
    this.imgSrc = app.config.imagePath + 'zhidishuju.png';
    var shareItems = app.module.share.shareItems;
    var splits = location.pathname.split('/');
    var fileName = splits[splits.length - 1];
    _.each(shareItems, function (item) {
      item.msg.href = app.config.requestPath + 'App/' + fileName;
      item.msg.title = '智屋二维码';
      item.msg.thumbs = [self.imgSrc];
      item.msg.extra.scene = item.extra; //分享消息扩展参数
    });
    this.shareItems = ko.observableArray(shareItems);
  }

  function events() {
    document.getElementById('imgLongTap').addEventListener('longtap', function () {
      mui('#sahre-modal').popover('toggle');
    });

    document.getElementById('saveImage').addEventListener('tap', function () {
      if (window.plus) {
        plus.gallery.save("../images/zhidishuju.png", function() {
          app.messager.toast("图片保存成功");
          mui('#sahre-modal').popover('toggle');
        });
      }
    });
  }

  function initialize() {
    events();
    vm = new ViewModel();
    ko.applyBindings(vm);

    plus.nativeUI.closeWaiting();
    //显示当前页面
    mui.currentWebview.show('slide-in-right', mui.os.ios ? 200 : 300);
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)