(function (mui, app, ko, $, _) {

  function ViewModel() {
    var self = this;
    this.certificateType = ko.observable('');
    self.administrativeArea = app.cache.get('administrativeArea');
    self.choiceCertificateType = function () {
      app.util.goTo('ctrlCertificateType.htm', { selected: self.certificateType() });
    }
    self.choose = function (data) {
      console.log(data);
      app.util.goTo('transferAgentChoose.htm', { data: data });
    }
  };

  $('#step').on('click', function () {
    mui("#input_example input").each(function () {
      if (!this.value || this.value.trim() === "") {
        var label = this.previousElementSibling;
        mui.alert(label.innerText + "不允许为空");
        //check = false;
        return false;
      }
      return null;
    }); //校验通过，继续执行业务逻辑
    if (check) {
      //跳转
      mui.alert('验证通过!');
    }

  });

  var vm;
  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    events();
  }

  function events() {
    window.addEventListener('choice-selected', function (event) {
      var detail = event.detail,
      	type = detail.type,
        selected = detail.selected;
        console.log(type)
      if (type === 'certificateType') {
        vm.certificateType(selected);
      }
    });
  }

  app.plusReady(initialize);

})(mui, app, ko, jQuery, _);