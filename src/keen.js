define(['lib/util', 'lib/keen.min'], function(util) {
    var self = {
        enable: false
    };

    self.init = function() {
        self.keen_session = sss.util.uuid();
        self.start_time = new Date();
    };

    self.track = function(name, parameters, cbk) { 
        //additional parameters added to every track 
        parameters.user_agent = navigator.userAgent; 
        parameters.ms_elapsed = new Date() - self.start_time;
        parameters.referrer = document.referrer;
        parameters.keen_session = self.keen_session;

        var 
            req = new XMLHttpRequest(),
            reqData = new FormData(),
            data = [name, parameters];

        reqData.append('data',util.base64.encode(JSON.stringify(
            [name,parameters]
        )));


         [name, parameters]);

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