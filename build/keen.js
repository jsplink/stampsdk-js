define(['lib/keen.min'], function() {
    var self = {
        enable: false
    };

    self.init = function() {
        self.keen_session = sss.util.uuid();
        self.start_time = new Date();
    };

    self.track = function(name, parameters, cbk) { 
        var 
          req = new XMLHttpRequest(),
          reqData = new FormData();

        reqData.append('data', [name, parameters]);

        //additional parameters added to every track 
        parameters.user_agent = navigator.userAgent; 
        parameters.ms_elapsed = new Date() - self.start_time;
        parameters.referrer = document.referrer;
        parameters.keen_session = self.keen_session;

        req.addEventListener('load', function(e) {
            cbk(req.resp);
        });

        req.addEventListener('error', function(e) {
            cbk(req.resp);
        });

        if (self.enable) {
            req.open('POST', '/keen/event');
            req.send(reqData);
        }

        Keen.addEvent(name, parameters, cbk, cbk);
    };
   
    return self;
})();