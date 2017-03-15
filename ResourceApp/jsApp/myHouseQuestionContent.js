(function (app, mui, ko, $, _) {
  function Filter() {
    this.pageNumber = 1;
    this.countPerPage = 10;
    this.keyword = '';
    this.totalPage = 1;
  }

  function DataPack(type) {
    function DataBase() {
      this.filter = new Filter();
      this.isInit = false;
    }

    function NewestData() {
      this.requestUrl = 'QuestionNewestList';
      this.responseData = 'questionNewestList';
    }

    function CommonData() {
      this.requestUrl = 'QuestionCommonList';
      this.responseData = 'questionCommonList';
    }

    DataBase.call(this);
    (type === 'newest' ? NewestData : CommonData).call(this);
  }

  var vm, pullRefresh;

  function ViewModel() {
    var type = app.util.getExtrasValue('type');
    DataPack.call(this, type);
    var self = this;
    this.results = ko.observableArray();

    this.detail = function(record){
      app.util.goTo('myQuestionDetail.htm', record);
    };
    this.search = function (callback) {
      app.request.postAction('tdwr', self.requestUrl, {
        p1: self.filter.pageNumber,
        p2: self.filter.countPerPage,
        p3: self.filter.keyWord,
        p4: app.cache.get('city').tableId
      }, function (response) {
        if (self.filter.pageNumber === 1) {
          self.results.removeAll();
        }
        if (response.result === 'success') {
          var list = response[self.responseData];
          _.each(list, function (el) {
            self.results.push(el);
          });
          self.filter.totalPage = response.totalPage;
          callback(response);
        } else {
          app.messager.toast(response.info);
        }
      });
    };
  }

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    vm.filter.pageNumber = 0;
    pullRefresh = new app.module.PullRefresh('#refreshContainer', {
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

  function upPullfresh() {
    var self = this;
    setTimeout(function () {
      vm.filter.pageNumber++;
      vm.search(function (response) {
        pullRefresh.endPullupToRefresh(response.pageNumber >= response.totalPage);
      });
    }, 100);
  }

  function downPullfresh() {
    var self = this;
    vm.filter.pageNumber = 1;
    vm.search(function (response) {
      pullRefresh.endPulldownToRefresh();
    });
  }

  function events() {
    window.addEventListener('reload', function (event) {
      vm.filter.keyWord = event.detail.keyWord;
      downPullfresh();
    });
  }

  events();
  app.plusReady(initialize);
})(app, mui, ko, jQuery, _);