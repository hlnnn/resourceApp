// DataPacks
(function (app, mui, $, ko, _) {
  function DataPacks() {
    var types = 'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(',');
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.myText = '';
      this.type = ''; //sale/rent/new
      this.publishType = '';
      this.footerVisible = false;//footer可见
      this.sourceVisible = true;
      this.areaVisible = true;
      this.areaCss = 'mui-col-sm-5 mui-col-xs-5';
      this.timeVisible = true;
      this.countVisible = true;//房源数量
      this.realSupply = false;//真实房源
      this.prospecting = false;//上门实勘
      this.sortVisible = true;
      this.mapVisible = true;
      this.requestUrl = '';
      this.responseData = '';
      this.keywordPlaceHolder = '';
      this.fourSectionVisible = true;
    };

    this.SaleHouseData = function () {
      self.DataBase.call(this);

      this.title = '二手房';
      this.myText = '我的二手房';
      this.publishType = 'sale';
      this.footerVisible = true;
      this.timeVisible = false;
      this.realSupply = true;
      this.prospecting = true;
      this.requestUrl = 'saleHouseList';
      this.responseData = 'saleHouseList';
      this.keywordPlaceHolder = '请你输入地址和小区名';
    };

    this.RentHouseData = function () {
      self.DataBase.call(this);

      this.title = '租房';
      this.myText = '我的租房';
      this.publishType = 'rent';
      this.footerVisible = true;
      this.timeVisible = false;
      this.realSupply = true;
      this.prospecting = true;
      this.requestUrl = 'rentHouseList';
      this.responseData = 'rentHouseList';
      this.keywordPlaceHolder = '请你输入地址和小区名';
    };

    this.NewHouseData = function () {
      self.DataBase.call(this);

      this.title = '新房';
      this.timeVisible = true;
      this.sourceVisible = false;
      this.sortVisible = false;
      this.countVisible = false;
      this.requestUrl = 'newHouseList';
      this.responseData = 'theNewHouseList';
      this.keywordPlaceHolder = '请输入楼盘编号、楼盘名、地址';
      this.fourSectionVisible = false;
    };

    this.SaleShopData = function () {
      self.DataBase.call(this);

      this.title = '商铺出售';
      this.myText = '';
      this.timeVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
      this.requestUrl = 'saleShopList';
      this.responseData = 'saleShopList';
      this.keywordPlaceHolder = '输入商铺、商圈名';
    };

    this.RentShopData = function () {
      self.DataBase.call(this);

      this.title = '商铺出租';
      this.myText = '';
      this.timeVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
      this.requestUrl = 'rentShopList';
      this.responseData = 'rentShopList';
      this.keywordPlaceHolder = '输入商铺、商圈名';
    };

    this.SaleOfficeData = function () {
      self.DataBase.call(this);

      this.title = '写字楼出售';
      this.myText = '';
      this.timeVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
      this.requestUrl = 'saleOfficeList';
      this.responseData = 'saleOfficeList';
      this.keywordPlaceHolder = '输入写字楼、商圈名';
    };

    this.RentOfficeData = function () {
      self.DataBase.call(this);

      this.title = '写字楼出租';
      this.myText = '';
      this.timeVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
      this.requestUrl = 'rentOfficeList';
      this.responseData = 'rentOfficeList';
      this.keywordPlaceHolder = '输入写字楼、商圈名';
    };

    function Price(upper, lower, between) {
      this.unitUpper = upper;
      this.unitLower = lower;
      this.unitBetween = between;
    }

    var pack = {
      Price: Price
    };
    for (var i = 0; i < types.length; i++) {
      pack[types[i]] = this[_.capitalize(types[i]) + 'Data'];
    }
    return pack;
  }

  app.module.DataPacks = DataPacks;

})(app, mui, jQuery, ko, _);

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
    this.filter = new app.module.Filter(this.dataPack.type);
    this.result = new app.module.Result(this.dataPack.type);
    console.log(this.result);
    this.filter.initialize();
    this.filter.keywordPlaceHolder = this.dataPack.keywordPlaceHolder;
    this.filterSource = new app.module.FilterSource(this.dataPack.type);
    this.source = new app.module.Source(this.dataPack.type);

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


// Header
(function (app, ko, _) {
  function Header() {
    var self = this;
    this.title = '';
    this.goMapList = function () {
      app.util.goTo('houseMap.htm', {
        type: self.type
      });
    }
  }

  Header.prototype.initialize = function (title, mapVisible, type, dom) {
    if (title && _.isString(title))
      this.title = title;
    this.type = type;
    this.mapVisible = mapVisible;
    ko.applyBindings(this, dom || document.getElementById('header'));
  };

  app.module.houseList.header = new Header();
})(app, ko, _);

// Footer
(function (app, ko, _) {
  function Footer() {
    var self = this;
    this.publishType = '';
    this.goAgent = function () {
      app.util.goTo('personalList.htm', {
        type: 'agent'
      });
    };
    this.goPublishHouse = function () {
      app.util.goToAuth('publishHouseFirst.htm', {
        type: self.publishType
      });
    };
    this.goMyHouse = function () {
      app.util.goToAuth('myHouse.htm', {
        type: self.type
      });
    };
  }

  Footer.prototype.initialize = function (type, myText, publishType, footerVisible, dom) {
    this.type = type;
    this.publishType = publishType;
    this.myText = myText;
    this.footerVisible = footerVisible;
    ko.applyBindings(this, dom || document.getElementById('nav-footer'));
  };

  app.module.houseList.footer = new Footer();
})(app, ko, _);

(function (app, mui, $, ko, _) {
  // 初始化环境
  mui.init();
  var type, keyWord;

  function initialize() {
    var houseList = app.module.houseList;
    type = app.util.getExtrasValue('type');
    keyWord = app.util.getExtrasValue('keyWord');
    var dataPack = new (new app.module.DataPacks()[type])();
    dataPack.type = type;
    houseList.dataPack = dataPack;
    houseList.initialize(document.getElementById('filter-section'));
    houseList.header.initialize(dataPack.title, dataPack.mapVisible, dataPack.type);
    houseList.footer.initialize(type, dataPack.myText, dataPack.publishType, dataPack.footerVisible);
    ko.applyBindings(houseList.filterSource, document.getElementById('filter-section'));
    ko.applyBindings(houseList.source, document.getElementById('filter-toggle-section'));
    ko.applyBindings(houseList.filter, document.getElementById('search-section'));
    //ko.applyBindings(houseList.result, document.getElementById('house-list'));
    houseList.result.initialize(document.getElementById('house-list'));
    ko.applyBindings(houseList.result, document.getElementById('house-list'));
    ko.applyBindings(houseList.filter, document.getElementById('screening2'));
    if (!dataPack.fourSectionVisible) {
      $('#screening2').remove();
    }
    events();
    app.util.show();
  }

  app.plusReady(initialize);

  function events() {
    //小区选择
    if (keyWord) {
      app.module.houseList.filter.keyWord = keyWord;
      $('#search').focus();
      app.module.houseList.result.search();
    }

    $('#search').on('input propertychange', function () {
      app.module.houseList.filter.keyWord = this.value;
      app.module.houseList.result.search();
    });
  }

})(app, mui, jQuery, ko, _);