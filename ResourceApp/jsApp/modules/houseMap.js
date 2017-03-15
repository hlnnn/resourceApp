(function (app, mui, ko) {
  var type, keyWord,// 房源类型参数
    types = 'saleHouse,rentHouse,newHouse'.split(',');

  // HouseList
  (function () {
    function HouseList() { }

    var selected;
    var hiddenCss = 'icon-triangle';
    var showCss = 'icon-triangle-up';
    var closeMask = function () {
      var els = $('#filter-section').find('a');
      els.removeClass('mui-active');
      els.find('i').removeClass(showCss).addClass(hiddenCss);
      els.each(function () {
        $(this.dataset.toggle).addClass('mui-hidden');
      });
      selected = undefined;
    }
    var mask = mui.createMask(closeMask);

    HouseList.prototype.initialize = function (dom) {
      type = app.util.getExtrasValue('type');
      keyWord = app.util.getExtrasValue('keyWord');
      this.filter = new app.module.Filter(type);
      this.filter.initialize();
      this.filter.keywordPlaceHolder = '';
      this.filterSource = new app.module.FilterSource(type);
      this.source = new app.module.Source(type);

      mui(dom).on('tap', 'a', function (e) {
        e.stopPropagation();
        if (selected === this) {
          closeMask();
          mask.close();
        } else {
          selected = this;
          $(this).toggleClass('mui-active').siblings().removeClass('mui-active');
          $(this).find('i').removeClass(hiddenCss).addClass(showCss).parent().siblings().find('i').addClass(hiddenCss).addClass(showCss);
          $(this.dataset.toggle).toggleClass('mui-hidden').siblings().addClass('mui-hidden');
          mask.show();
        }
      });
    }

    app.module.houseList = new HouseList();
    app.module.houseList.closeMask = closeMask;
    app.module.houseList.mask = mask;

  })();

  // Result
  (function (app) {
    function Result() {
      this.houseList = ko.observableArray();
    }
    Result.prototype.research = function (callback) {
      search(this, callback);
    };

    Result.prototype.search = function (callback) {
      search(this, callback);
    };

    function search(self, callback) {
      type = app.util.getExtrasValue('type');
      if (type === 'saleHouse') {
        this.requestUrl = 'SaleHouseListForCommunity';
      } else if (type === 'rentHouse') {
        this.requestUrl = 'RentHouseListForCommunity';
      } else if (type === 'newHouse') {
        this.requestUrl = 'NewHouseListForMap';
      }
      app.request.postAction('tdwr', this.requestUrl, app.module.houseList.filter, function (response) {
        app.map.load(_.map(response.communityList, function (el) {
          el.itemValue = el.tableId;
          el.itemText = _.sprintf('%(theName)s %(count)s套', el);
          return el;
        }), response.communityList);
        callback && callback();
      });
    }

    app.module.houseList.result = new Result();

  })(app);
  
  function initialize() {
    events();
    mui.init();
    type = app.util.getExtrasValue('type');
    var houseList = app.module.houseList;
    houseList.initialize(document.getElementById('filter-section'));
    ko.applyBindings(houseList.filterSource, document.getElementById('filter-section'));
    ko.applyBindings(houseList.source, document.getElementById('filter-toggle-section'));
    ko.applyBindings(houseList.filter, document.getElementById('search-section'));

    houseList.result.research();
  }
  app.plusReady(initialize);


  function events() {
    //小区选择
    if (keyWord) {
      console.log(keyWord);
      app.module.houseList.filter.keyWord = keyWord;
      $('#search').focus();
      app.module.houseList.result.search();
    }

    $('#search').on('input propertychange', function () {
      app.module.houseList.filter.keyWord = this.value;
      app.module.houseList.result.search();
    });
  }


})(app, mui, ko);