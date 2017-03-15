(function (app, mui, ko, _) {
  var vm, listWb, community, type, dataPack;

  var contentWebviewOption = {
    url: 'houseListContent.htm', //子页面HTML地址，支持本地地址和网络地址
    id: 'houseListContent-MapForCommunity.htm', //子页面标志
    styles: {
      top: '245px',
      bottom: '0px'
    },
    afterShowMethodName: undefined,
    extras: {} //额外扩展参数
  };

  mui.init();

  var dataPack = {
    saleHouse: {
      requestUrl: 'SaleHouseListForMap',
      responseData: 'saleHouseList'
    },
    rentHouse: {
      requestUrl: 'RentHouseListForMap',
      responseData: 'rentHouseList'
    },
    newHouse: {
      requestUrl: 'NewHouseListForMap',
      responseData: 'theNewHouseList'
    }
  }

  function SearchModel(communityId) {
    this.communityId = communityId;
    this.keyWord = '';
    this.isUnlimited = true;
    this.pageNumber = 1;
    this.countPerPage = 20;
  }

  function ViewModel(communityId) {
    this.searchForm = new SearchModel(communityId);
    this.goHouseList = function () {
      //			console.log(plus.webview.currentWebview().opener())
      mui.back();
      var opener = plus.webview.currentWebview().opener();
      opener.evalJS('mui&&mui.back();');
      //			mui.closeAll(plus.webview.currentWebview().opener())
      //			mui.back();
      //			app.util.goTo('houseList.htm', {
      //				type: type
      //			});
    }
  }

  function initialize() {
    app.map.initialize('allmap', 200);
    community = app.util.getExtras();
    app.map.center(community);

    vm = new ViewModel(community.itemValue);
    ko.applyBindings(vm);

    houseList.result.initialize(document.getElementById('house-list'));

    //if (window.plus) {
    //  var options = contentWebviewOption;
    //  listWb = plus.webview.create(options.url, options.id, options.styles, $.extend({
    //    preload: true
    //  }, options.extras));
    //  listWb.addEventListener('loaded', function () {
    //    setTimeout(search, 100);
    //  });
    //  plus.webview.currentWebview().append(listWb);
    //}
  }

  function search() {
    type = app.util.getExtrasValue('type');
    var url = dataPack[type].requestUrl,
      responseData = dataPack[type].responseData;
    app.util.fire(listWb, 'list-research', {
      filter: {
        communityId: vm.searchForm.communityId,
        keyWord: '',
        isUnlimited: true,
        pageNumber: 1,
        countPerPage: 20
      },
      dataPack: {
        requestUrl: url,
        responseData: responseData
      },
      type: type
    });
  }

  app.plusReady(initialize);

})(app, mui, ko, _);