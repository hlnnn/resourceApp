// Request Auth
(function (app, mui, $) {

  var scroll, pullRefresh;

  function PullRefresh(selector, options, ios) {
    var downAuto = options.down && options.down.auto,
      upAuto = options.up && options.up.auto;
    if (options.down) {
      options.down.auto = false;
    }
    if (options.up) {
      options.up.auto = false;
    }
    /*if (ios || mui.os.ios) {
      if (options.down) {
        options.down.auto = downAuto || upAuto;
      }
      if (options.up) {
        options.up.auto = false;
      }
    } else {
      if (options.down) {
        options.down.auto = false;
      }
      if (options.up) {
        options.up.auto = downAuto || upAuto;
      }
    }*/
    var refresh;
    if (window.plus && mui.currentWebview.parent() != null) {
      refresh = new ChildPullRefresh(selector, options);
    } else {
      if (ios || mui.os.ios) {
        refresh = new IosPullRefresh(selector, options);
      } else {
        refresh = new AndroidPullRefresh(selector, options);
      }
    }
    mui.later(function () {
      if (downAuto) {
        refresh.pullDownLoading();
      } else if (upAuto) {
        refresh.pullUpLoading();
      }
    }, 10);
    return refresh;
  }

  function ChildPullRefresh(selector, options) {
    mui.init({
      pullRefresh: {
        container: selector,
        down: options.down,
        up: options.up
      }
    });
    var el = mui(selector);
    this.scrollTop = function () {
      this.scrollTo(0, 0, 200);
    };
    this.scrollTo = function (xpos, ypox, duration) {
      el.pullRefresh().scrollTo(xpos, ypox, duration);
    };
    this.endPullupToRefresh = function (finished) {
      el.pullRefresh().endPullupToRefresh(finished);
    };
    this.endPulldownToRefresh = function () {
      el.pullRefresh().endPulldownToRefresh();
    };
    this.pullUpLoading = function () {
      el.pullRefresh().pullupLoading();
    }
    this.pullDownLoading = function () {
      el.pullRefresh().pulldownLoading();
    }
  }

  function IosPullRefresh(selector, options) {
    scroll = pullRefresh = mui(selector).pullRefresh(options);
    this.scrollTop = function () {
      this.scrollTo(0, 0, 200);
    };
    this.scrollTo = function (xpos, ypox, duration) {
      scroll.scrollTo(xpos, ypox, duration);
    };
    this.endPullupToRefresh = function (finished) {
      pullRefresh.endPullupToRefresh(finished);
    };
    this.endPulldownToRefresh = function () {
      pullRefresh.endPulldownToRefresh();
    };
    this.pullUpLoading = function () {
      pullRefresh.pullupLoading();
    }
    this.pullDownLoading = function () {
      pullRefresh.pulldownLoading();
    }
  }

  function AndroidPullRefresh(selector, options) {
    // var deceleration = mui.os.ios ? 0.003 : 0.0009;
    scroll = mui(selector).scroll({
      bounce: false,
      indicators: true, //是否显示滚动条
      deceleration: 0.0009
    });
    pullRefresh = mui($(selector).find('.mui-scroll')[0]).pullToRefresh(options);
    this.scrollTop = function () {
      this.scrollTo(0, 0, 200);
    };
    this.scrollTo = function (xpos, ypox, duration) {
      scroll.scrollTo(xpos, ypox, duration);
    };
    this.endPullupToRefresh = function (finished) {
      pullRefresh.endPullUpToRefresh(finished);
    };
    this.endPulldownToRefresh = function () {
      pullRefresh.endPullDownToRefresh();
    };
    this.pullUpLoading = function () {
      pullRefresh.pullUpLoading();
    }
    this.pullDownLoading = function () {
      pullRefresh.pullDownLoading();
    }
  }

  app.module.PullRefresh = PullRefresh;
})(app, mui, jQuery);