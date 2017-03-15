(function (app, mui, ko) {
  var type,
    dataPack,
    vm,
    pullRefresh,
    city = app.cache.get('city'), //城市Id 
    cityId = city.tableId;

  function DataPack() {
    var self = this;
    this.dataBase = function () {
      this.type = '';
      this.title = '';
      this.requestUrl = 'ProfessionalList';
      this.responseData = 'professionalList';
    };

    this.designer = function () {
      self.dataBase.call(this);
      this.title = '设计师';
      this.type = 3;
    };
    this.inspector = function () {
      self.dataBase.call(this);
      this.title = '验房师';
      this.type = 2;
    };
    this.lawyer = function () {
      self.dataBase.call(this);
      this.title = '律师';
      this.type = 1;
    };
    this.agent = function () {
      self.dataBase.call(this);
      this.title = '经纪人';
      this.requestUrl = 'BrokerList';
      this.responseData = 'brokerList';
    };
  }

  function Filter() {
    if (type === 'agent') {
      return {
        p1: function () { return vm.pageNumber; },
        p2: function () { return vm.countPerPage },
        p3: function () { return vm.keyWord(); },
        p4: cityId
      }
    } else {
      return {
        p1: dataPack.type,
        p2: function () { return vm.pageNumber; },
        p3: function () { return vm.countPerPage },
        p4: function () { return vm.keyWord(); },
        p5: cityId
      }
    }
  }

  // 查询结果
  function SetContent(item) {
    this.memberId = item.memberId;
    this.brokerId = item.brokerId;
    //this.headImagePath = app.image.get(item.headImagePath, app.config.noImage);
    this.headImagePath = app.image.getLocal(item .headImagePath);
    this.memberName = item.memberName;
    this.company = item.company;
    this.address = item.address;
  };

  function ViewModel() {
    var self = this;
    this.title = dataPack.title;
    this.pageNumber = 0;
    this.countPerPage = 10;
    this.totalPage = 0;
    this.keyWord = ko.observable();
    this.filter = new Filter();

    this.professionalList = ko.observableArray();
    this.detail = function (record) {
      app.util.goTo('personalDetail.htm', { tableId: record.memberId || record.brokerId, title: self.title,type: type });
    };
    
    this.chat=function() {
      app.util.goTo('chat.htm');
    }

    this.search = function (callback) {
      app.request.postAction('tdwr', dataPack.requestUrl, self.filter, function (response) {
        
        if (self.pageNumber === 1) {
          self.professionalList.removeAll();
          pullRefresh.scrollTo(0, 0, 200);
        }
        if (response.result === 'success') {
          self.totalPage = response.totalPage;
          var datas = response[dataPack.responseData];
          for (var i = 0, len = datas.length; i < len; i++) {
            self.professionalList.push(new SetContent(datas[i]));
          }
        } else {
          app.messager.toast(response.info);
        }
        if (callback)
          callback(response);
      });
    };
  };

  function events() {
    $('#search').on('input propertychange', function () {
      vm.keyWord($(this).val());
      vm.pageNumber = 1;
      vm.search();
    });

    $('.search').on('tap', '.mui-icon-clear', function () {
      vm.keyWord('');
      vm.pageNumber = 1;
      vm.search();
    });
  }

  function initialize() {
    type = app.util.getExtrasValue('type');
    dataPack = new (new DataPack()[type])();
    
    vm = new ViewModel();
    ko.applyBindings(vm);
    
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
    
    events();

  }

  function upPullfresh() {
    vm.pageNumber++;
    vm.search(function (response) {
      pullRefresh.endPullupToRefresh(response.pageNumber >= response.totalPage);
    });
  }

  function downPullfresh() {
    vm.pageNumber = 1;
    vm.search(function () {
      pullRefresh.endPulldownToRefresh();
    });
  }

  app.plusReady(initialize);

})(app, mui, ko);