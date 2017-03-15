(function (app, mui, ko, $, _) {

  var vm;
  
  function ViewModel() {
    this.filter = new Filter();
    this.questionList = ko.observableArray();
    this.myQuestionDetail = function (record) {
      app.util.goTo('myQuestionDetail.htm', record);
    };
    this.myAsk = function () {
      app.util.goTo('myAsk.htm');
    };
  }

  function Filter() {
    this.currentPage = 0;
    this.pageSize = 10;
    this.totalPage = 0;
  }

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    pullRefresh = new app.module.PullRefresh('#question-list', {
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

  function search(callback) {
    app.request.postActionAuth('tudwr', 'QuestionNewestListForMe', { p1: vm.filter.currentPage, p2: vm.filter.pageSize }, function (response) {
      if (vm.filter.currentPage === 1) {
        vm.questionList.removeAll();
      }
      if (response.result === 'success') {
        var list = response['questionList'];
        _.each(list, function (el) {
          vm.questionList.push(el);
        })
        vm.filter.totalPage = response.totalPage;
      } else {
        app.messager.toast('没有数据');
      }
      if (callback) callback();
    });
  }

  //下拉刷新
  function downPullfresh() {
    vm.filter.currentPage = 1;
    search(function () {
      pullRefresh.endPulldownToRefresh();
    });
  }

  // 上拉加载具体业务实现
  function upPullfresh() {
    setTimeout(function () {
      vm.filter.currentPage++;
      search(function () {
        pullRefresh.endPullupToRefresh(vm.filter.currentPage >= vm.filter.totalPage);
      });
    }, 100);
  }
  
  app.plusReady(initialize);

  //启用双击监听
  /*mui.init({
    subpages: [{
      url: 'myQuestionContent.htm',
      id: 'myQuestionContent.htm',
      styles: {
        top: app.config.top,
        bottom: app.config.bottom
      }
    }]
  });*/
})(app, mui, ko, jQuery, _);