(function (app, mui, $, ko, _) {

  var vm;
  function Message() {
    this.theAssociatedType = '';
    this.theAssociatedId = '';
    this.pageNumber = 1;
    this.countPerPage = 20;
  }

  //super("tuNoticeListForMe.tuhtml", callBack);
	//map.put("p1", theAssociatedType);
	//map.put("p2", theAssociatedId);
	//map.put("p3", pageNumber);
	//map.put("p4", countPerPage);
  function ViewModel() {
    this.message = new Message();
    var self = this;
    // 获取数据
    this.getNoticeList = function () {
      // Integer p1 关联通知源类型：0：全部；1：出售； 2：出租； 3：求购； 4：求租； 5：贷款； 6：订单； 7：系统。
      // Integer p2 关联通知源Id
      // Integer p3 页码
      // Integer p4 每页显示个数
      app.request.postAction('tdwr', 'NoticeListForMe', {
        p1: self.message.theAssociatedType,
        p2: self.message.theAssociatedId,
        p3: self.message.pageNumber,
        p4: self.message.countPerPage
      }, function (response) {
        app.messager.toast(response.info);
        if (response.result === 'success') {
          
        }
      });
    };
  }

  function initialize() {
    $.vm = vm = new ViewModel();
    ko.applyBindings(vm);
    events();
  }

  function events() {

  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)