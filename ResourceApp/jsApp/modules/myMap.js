(function (app, mui, ko) {
  var
    type, // 房源类型参数
    dataPack,
    module = {},
    opened, // filterWebview 状态
    types = 'saleHouse,rentHouse,newHouse'.split(',');

//function DataPack() {
//  var self = this;
//  this.DataBase = function () {
//    
//  };
//
//  this.SaleHouseData = function () {
//    
//  };
//
//  this.RentHouseData = function () {
//    
//  };
//
//  this.NewHouseData = function () {
//  
//  };
//
//  function Price(upper, lower, between) {
//    this.unitUpper = upper;
//    this.unitLower = lower;
//    this.unitBetween = between;
//  }

//  var pack = { Price: Price };
//  for (var i = 0; i < types.length; i++) {
//    pack[types[i]] = this[_.capitalize(types[i]) + 'Data'];
//  }
//  return pack;
//}
  (function () {
    function HouseList() {}

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
      this.filter = new app.module.Filter(this.dataPack);
      this.filter.initialize();
      this.filter.keywordPlaceHolder = this.dataPack.keywordPlaceHolder;
      this.filterSource = new app.module.FilterSource(this.dataPack);
      this.source = new app.module.Source(this.dataPack);

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

  // Filter
  (function () {
    function Filter() {
      this.keyWord = ko.observable('');
    }
    module.Filter = Filter;
  })();

  function initialize() {
    //  events();
    var houseList = app.module.houseList;
    type = app.util.getExtrasValue('type');
    console.log(type)
    dataPack = new(new DataPack()[type])();
    houseList.initialize(document.getElementById('filter-section'));

  }

  function search() {
    app.util.fire(filterWebview, 'change-filter', ko.toJS(app.module.houseList.filter));
  }

  app.plusReady(initialize);

  mui.init();

  //function events() {
  //  //小区选择
  //  $('#search').on('input propertychange', function () {
  //    app.module.houseList.filter.keyWord(this.value);
  //    search();
  //  });
  //
  //  window.addEventListener('hide-dropdown', function () {
  //    $('#filter-section .filter').find('div').removeClass('red').find('i').addClass('iconfont icon-triangle');
  //    filterWebview.hide();
  //    opened = undefined;
  //  });
  //
  //}

})(app, mui, ko);