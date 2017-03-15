var type = app.util.getExtrasValue('type');

// DataPacks
(function (app, mui, $, ko, _) {
    function DataPacks() {
        // var types = 'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(',');
        var self = this;
        this.DataBase = function () {
            this.requestUrl = '';
            this.responseData = '';
            this.keyword = '请你输入地址和小区名';
        };

        this.SaleHouseData = function () {
            self.DataBase.call(this);
            this.requestUrl = 'SaleHouseListForMap';
            this.responseData = 'saleHouseList';

        };

        this.RentHouseData = function () {
            self.DataBase.call(this);
            this.requestUrl = 'rentHouseListForMap';
            this.responseData = 'rentHouseList';

        };

        this.NewHouseData = function () {
            self.DataBase.call(this);

            this.requestUrl = 'newHouseListForMap';
            this.responseData = 'theNewHouseList';
        };
    }

    app.module.DataPacks = DataPacks;

})(app, mui, jQuery, ko, _);

// HouseList
(function () {
    function HouseList() {
    }

    HouseList.prototype.initialize = function () {
        this.filter = new app.module.Filter(type);
        this.result = new app.module.Result(type);
        this.filter.initialize();
        this.filter.keyWord = type.keyWord;
    }
    app.module.houseList = new HouseList();

})();

//Fifter
(function () {
    function Filter() {
    }

    Filter.prototype.initialize = function (communityId) {
        this.communityId = communityId;
        this.keyWord = '';
        this.isUnlimited = true;
        this.pageNumber = 1;
        this.countPerPage = 20;
    }
    app.module.filter = new Filter();

})();


(function (app, mui, ko, _) {
    var vm, listWb, community, type, dataPack;

    mui.init();
    //
    // var dataPack = {
    //   saleHouse: {
    //     requestUrl: 'SaleHouseListForMap',
    //     responseData: 'saleHouseList'
    //   },
    //   rentHouse: {
    //     requestUrl: 'RentHouseListForMap',
    //     responseData: 'rentHouseList'
    //   },
    //   newHouse: {
    //     requestUrl: 'NewHouseListForMap',
    //     responseData: 'theNewHouseList'
    //   }
    // }

    function ViewModel(type) {
        this.result = new app.module.Result(type);
        //this.houseList = new app.module.HouseList(type);
        //this.result.initialize(document.getElementById('house-list'));
        //this.searchForm = new SearchModel(communityId);
        this.goHouseList = function () {
            //			console.log(plus.webview.currentWebview().opener())
            //mui.back();
            //var opener = plus.webview.currentWebview().opener();
            //opener.evalJS('mui&&mui.back();');
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
        search();

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
        app.module.DataPacks();
        app.module.filter.initialize();

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