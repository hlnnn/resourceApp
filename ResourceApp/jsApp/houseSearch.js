(function (app, mui, $, ko, _) {
  var vm,
    dataPack,
    city = app.cache.get('city'), //城市Id
    cityId = city.tableId;

  function Source(dataText, type) {
    this.dataText = dataText;
    this.type = type;
  }

  function DataPack() {
    this.saleHouse = function () {
      this.requestUrl = 'SearchBySaleHouse';
    };
    this.rentHouse = function () {
      this.requestUrl = 'SearchByRentHouse';
    };
    this.saleOffice = function () {
      this.requestUrl = 'SearchBySaleOffice';
    };
    this.rentOffice = function () {
      this.requestUrl = 'SearchByRentOffice';
    };
    this.saleShop = function () {
      this.requestUrl = 'SearchBySaleShop';
    };
    this.rentShop = function () {
      this.requestUrl = 'SearchByRentShop';
    };
  }

  function ViewModel() {
    var self = this;
    this.keyWord = ko.observable();
    this.selectList = [new Source('二手房', 'saleHouse'), new Source('租房', 'rentHouse'), new Source('写字楼-出售', 'saleOffice'), new Source('写字楼-出租', 'rentOffice'), new Source('商铺-出售', 'saleShop'), new Source('商铺-出租', 'rentShop')];
    this.seachTypeCn = ko.observable(this.selectList[0].dataText);
    this.searchType = ko.observable(this.selectList[0].type);
    this.checkedVal = ko.pureComputed({
      read: function () {
        self.seachTypeCn();
        self.searchType();
      },
      write: function (val) {
        self.seachTypeCn(val.dataText);
        self.searchType(val.type);
      }
    });
    this.searchResult = ko.observableArray();
    this.goHouseList = function (record) {
      app.util.goTo('houseList.htm', { type: self.searchType(), keyWord: record.title });
    };
  }

  function search() {
    app.request.postAction('tdwr', dataPack.requestUrl, { cityId: cityId, keyWord: vm.keyWord() }, function (response) {
      if (response.result === 'success') {
        vm.searchResult.removeAll();
        if (response.houseList.length) {
          var houseList = response.houseList;
          for (var i = 0; i < houseList.length; i++) {
            vm.searchResult.push(houseList[i]);
          }
        }
      }
    });
  }

  function events() {
    $('.select-list .mui-radio,#dropdown').on('tap', function () {
      $('.select-list').toggleClass('mui-hidden');
    });

    $('#search').on('input propertychange', function () {
      vm.keyWord($('#search').val());
      search();
    });

    $(".input-group").on('tap', '.mui-icon-clear', function () {
      vm.keyWord('');
      search();
    });

    document.getElementById('search').addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
        app.util.goTo('houseList.htm', { type: vm.searchType(), keyWord: $('#search').val() });
      }
    }, false);

    document.getElementById('search').addEventListener('focus', function(e) {
      $('.select-list').addClass('mui-hidden');
    });
  }

  mui.init();

  function initialize() {
    vm = new ViewModel();
    dataPack = new(new DataPack()[vm.searchType()])();
    ko.applyBindings(vm);
    events();
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko, _)