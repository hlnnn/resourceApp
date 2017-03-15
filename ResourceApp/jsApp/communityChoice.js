(function (app, mui, ko) {
  var vm,
    businessAreaId,
    city = app.cache.get('city'), //城市Id 
    cityId = city.tableId,
    opener;

  function Choice() {
    var self = this;
    this.selectedItem = app.util.getExtrasValue('selected'); //输入的内容
    this.communityKeyWord = ko.observable(self.selectedItem);
    this.businessAreaId = businessAreaId;
    this.addCommunity = ko.observable(false);
    this.addCommunityTap = function () {
      app.util.fire(opener, 'community-selected', {
        communityId: '',
        communityName: self.communityKeyWord()
      });
      mui.back();
    };
    this.communityName = ko.observable(''); //小区名字
    this.communities = ko.observableArray();


    this.selected = ko.pureComputed({
      read: function () {

      },
      write: function (value) {
        self.communityKeyWord(value.theName);
        app.util.fire(opener, 'community-selected', {
          communityId: value.tableId,
          communityName: value.theName
        });
        mui.back();
      }
    });
  }

  function communities() {
    app.request.postAction('tdwr', 'CommunityListForInput', { p1: cityId, p2: vm.businessAreaId, p3: vm.communityKeyWord() }, function (response) {
      if (response.result === 'success') {
        var communityList = response.communityList;
        if (communityList.length) {
          for (var i = 0; i < communityList.length; i++) {
            vm.communities.push(communityList[i]);
          }
          vm.addCommunity(false);
        } else {
          vm.addCommunity(true);
        }
      }
    });
  }

  function events() {
    $('#search').on('input propertychange', function () {
      vm.communityKeyWord($(this).val());
      if (!vm.communityKeyWord()) {
        console.log(vm.communityKeyWord());
        vm.communities();
      } else {
        setTimeout(communities, 2000);
      }
    });
  }

  function initialize() {
    opener = plus.webview.currentWebview().opener();
    businessAreaId = app.util.getExtrasValue('businessAreaId');
    vm = new Choice();

    events();
    ko.applyBindings(vm);
  }
  app.plusReady(initialize);
})(app, mui, ko);