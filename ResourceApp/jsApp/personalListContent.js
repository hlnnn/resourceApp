(function (app, mui, ko) {
  var type,
    dataPack,
    keyWord,
    filterData,
    city = app.cache.get('city'), //城市Id 
    cityId = city.tableId;

  function DataPack() {
    var self = this;
    this.dataBase = function () {
      this.type = '';
      this.requestUrl = 'ProfessionalList';
      this.responseData = 'professionalList';
      this.pageNumber = 1;
      this.countPerPage = 10;
      this.totalPage = 0;
    };

    this.designer = function () {
      self.dataBase.call(this);
      this.type = 3;
    };
    this.inspector = function () {
      self.dataBase.call(this);
      this.type = 2;
    };
    this.lawyer = function () {
      self.dataBase.call(this);
      this.type = 1;
    };
    this.agent = function () {
      self.dataBase.call(this);
      this.requestUrl = 'BrokerList';
      this.responseData = 'brokerList';
    };
  }

  function Filter(type, dataPack) {
    if (type === 'agent') {
      return {
        p1: dataPack.pageNumber,
        p2: dataPack.countPerPage,
        p3: keyWord,
        p4: cityId
      }
    } else {
      return {
        p1: dataPack.type,
        p2: dataPack.pageNumber,
        p3: dataPack.countPerPage,
        p4: keyWord,
        p5: cityId
      }
    }
  }

  // 查询结果
  (function () {
    function Result() {
      this.professionalList = ko.observableArray();
    };

    function setContent(item) {
      this.memberId = item.memberId;
      this.brokerId = item.brokerId;
      this.headImagePath = app.image.local(item.headImagePath);
      this.memberName = item.memberName;
      this.company = item.company;
      this.address = item.address;
      this.phoneNumber = item.phoneNumber;
    };

    Result.prototype.setParams = function (param) {
      if (type === 'agent') {
        filterData.p3 = param.keyWord;
      } else {
        filterData.p4 = param.keyWord;
      }
    };
    Result.prototype.load = function (datas) {
      for (var i = 0, len = datas.length; i < len; i++) {
        this.professionalList.push(new setContent(datas[i]));
      }
    };
    Result.prototype.reload = function (datas) {
      this.professionalList.removeAll();
      this.load(datas);
    };

    Result.prototype.research = function () {
      search(this, this.reload);
    };
    Result.prototype.search = function () {
      search(this, this.load);
    };
    Result.prototype.detail = function (record) {
      app.util.goTo('personalListDetail.htm', {
        tableId: record.memberId || record.brokerId,
        type: type,
        phoneNumber: record.phoneNumber
      });
    }

    function search(self, callback) {
      app.request.postAction('tdwr', dataPack.requestUrl, filterData, function (response) {
        if (response.result === 'success') {
          dataPack.totalPage = response.totalPage;
          callback.call(self, response[dataPack.responseData]);
        } else {
          app.messager.toast('没有数据');
        }
      });
    }
    app.module.result = new Result();
  })();

  // 初始化环境
  mui.init({
    pullRefresh: {
      container: '#content-list',
      down: {
        callback: pulldownRefresh
      },
      up: {
        contentrefresh: '正在加载...',
        callback: pullupRefresh
      }
    }
  });

  //下拉刷新
  function pulldownRefresh() {
    mui('#content-list').pullRefresh().endPulldownToRefresh(); //参数为true代表没有更多数据了。
    if (type === 'agent') {
      filterData.p1 = 1;
    } else {
      filterData.p2 = 1;
    }
    dataPack.pageNumber = 1;
    app.module.result.research();
  }

  // 上拉加载具体业务实现
  function pullupRefresh() {
    setTimeout(function () {
      mui('#content-list').pullRefresh().endPullupToRefresh((dataPack.pageNumber > dataPack.totalPage)); //参数为true代表没有更多数据了.
      if (type === 'agent') {
        filterData.p1++;
      } else {
        filterData.p2++;
      }
      dataPack.pageNumber++;
      if (dataPack.pageNumber <= dataPack.totalPage) {
        app.module.result.search();
      }
    }, 100);
  }

  function initialize() {
    type = app.util.getExtrasValue('type');

    dataPack = new(new DataPack()[type])();

    ko.applyBindings(app.module.result);
    filterData = new Filter(type, dataPack);
  }

  function events() {
    window.addEventListener('list-research', function (event) {
      app.module.result.setParams(event.detail);
      app.module.result.research();
    });
  }
  app.plusReady(initialize);
  events();
})(app, mui, ko);