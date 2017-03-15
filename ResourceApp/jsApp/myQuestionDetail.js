(function (app, mui, ko, $, _) {
  var vm;
  function ViewModel(extras) {
    this.question = extras.question;
    this.asktime = extras.asktime;
    this.answer = extras.answer;
    this.answertime = extras.answertime;
  }

  function initialize() {
    var extras = app.util.getExtras();
    vm = new ViewModel(extras);
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);
})(app, mui, ko, jQuery, _);