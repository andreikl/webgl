describe('Tutorial1', function() {
    // inject the HTML fixture for the tests
    beforeEach(function(done) {
        var html = '<div id="content"></div>';
        document.body.insertAdjacentHTML('afterbegin', html);

        document.addEventListener('readyEvent', function () {
            done();
        }, false);


        // configure tutorial 1
        window.defaultView = "tutorial1";
        window.app.config.baseUrl = "http://localhost:8080";
        window.app.init(document.getElementById('content'));
    });
    // remove the html fixture from the DOM
    afterEach(function() {
        //document.body.removeChild(document.getElementById('content'));
    });

    it('should load tutorial 1 content', function() {
        var $tutorial1 = document.getElementById('tutorial1');
        var length = $tutorial1.innerHTML.length;
        expect(length).toBeGreaterThan(0);
        expect(length).toBeLessThan(1000);

        //expect(spy).toHaveBeenCalled();
    });
});
