(function(app, mui, ko, $, _) {


	function ViewModel() {
    }

	function initialize() {

		var viewModel = new ViewModel();
		ko.applyBindings(viewModel);
	}

	app.plusReady(initialize);

})(app, mui, ko, jQuery, _);