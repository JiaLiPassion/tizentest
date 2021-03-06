(function(){
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[PlayerHTML5]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = [
            'MediaFastForward',
            'MediaPause',
            'MediaPlay',
            'MediaRewind',
            'MediaStop',
            '1'
        ];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            var seekJump = 5;
            switch (e.keyCode) {
                //key RETURN
                case 10009:
                    log("RETURN");
                    tizen.application.getCurrentApplication().hide();
                    break;

                //key PLAY
                case 415:
                    play();
                    break;

                //key STOP
                case 413:
                    stop();
                    break;

                //key PAUSE
                case 19:
                	pause();
                	break;

                //key FF
                case 417:
                    if (!player.seeking && player.currentTime + seekJump < player.seekable.end(0)) {
                        player.currentTime += seekJump;
                    }
                    break;

                //key REWIND
                case 412:
                    if (!player.seeking && player.currentTime - seekJump > player.seekable.start(0)) {
                        player.currentTime -= seekJump;
                    }
                    break;

                //key 1
                case 49:
                    log("Key 1");
                    changeSource();
                    break;

                default:
                    log("Unhandled key: " + e.keyCode);
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    var posters = ['img/SINTEL_poster.jpg', 'img/BUNNY_poster.jpg'];
    var sources = ['http://media.w3.org/2010/05/sintel/trailer.mp4', 'http://media.w3.org/2010/05/bunny/trailer.mp4'];
    var currentSource = 0;
    var player = null;
    
    /*var assetURL = 'frag_bunny.mp4';
    var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

    function sourceOpen (_) {
    	  //console.log(this.readyState); // open
    	  var mediaSource = this;
    	  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    	  console.log('sourceBuffer', sourceBuffer.addEventListener);
    	  fetchAB(assetURL, function (buf) {
    	    sourceBuffer.addEventListener('updateend', function (_) {
    	      mediaSource.endOfStream();
    	      video.play();
    	      //console.log(mediaSource.readyState); // ended
    	    });
    	    sourceBuffer.appendBuffer(buf);
    	  });
    	}*/

    /**
     * Creates HTML video tag and adds all event listeners
     */
    function createPlayer() {
        var _player = document.createElement('video');
        
        var mediaSource = new MediaSource;
   	 //log('mediaSoruce: '+ mediaSource.addEventListener.toString());
        log('ZonePatched mediaSource:' + mediaSource['__zone_symbol__addEventListener']);
        var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        //_player.src = sources[currentSource];
        _player.src = URL.createObjectURL(mediaSource);
        
        mediaSource.addEventListener('sourceopen', function() {
       	 log('open');
       	 try {
           	 var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

                log('sourceBuffer:'+sourceBuffer);
                log('pathced sourceBuffer.addEventListener exists:' + !!sourceBuffer['__zone_symbol__addEventListener']);
                
                // TODO: uncomment this line will show the sourceBuffer.addEventListener has been patched.
                //log('patched sourceBuffer.addEventListener contents: ' + sourceBuffer.addEventListener);
                
                var obj = sourceBuffer;
                while(true) {
                	
                	obj = Object.getPrototypeOf(obj);
                	if (!obj) {
                		break;
                	}
                	log('sourceBuffer proto:' + obj && obj.constructor && obj.constructor.name);
                }
            } catch (error) {
           	 log('error:' + error);
            }
            
        });
        
        _player.poster = posters[currentSource];
        _player.load();

        _player.addEventListener('loadeddata', function () {
            log("Movie loaded.");
            /*console.log('source', sources[currentSource]);
            console.log('this', this);
            console.log('MediaSource', window['MediaSource']);
            if (window['MediaSource']) {
            	  var mediaSource = new MediaSource;
            	  video.src = URL.createObjectURL(mediaSource);
            	  mediaSource.addEventListener('sourceopen', sourceOpen);

            }*/
        });
        _player.addEventListener('loadedmetadata', function () {
            log("Meta data loaded.");
        });
        _player.addEventListener('timeupdate', function () {
            log("Current time: " + _player.currentTime);
            progress.updateProgress(_player.currentTime, _player.duration);
        });
        _player.addEventListener('play', function () {
            log("Playback started.");
        });
        _player.addEventListener('pause', function () {
            log("Playback paused.");
        });
        _player.addEventListener('ended', function () {
            log("Playback finished.");
            init();
        });

        return _player;
    }

    /**
     * Stop the player when application is closed.
     */
    function onUnload() {
    	log('onUnload');
        stop();
    }

    /**
     * Choose next source video and poster
     */
    function changeSource() {
        currentSource += 1;

        // Last source reached, go to the first one
        if (currentSource >= sources.length) {
            currentSource = 0;
        }

        if (!player) {
            player = createPlayer();
            document.querySelector('.left').appendChild(player);
        }

        init();
    }
    
    /**
     * Function to init video playback.
     */
    function init() {
        player.poster = posters[currentSource];
        player.src = sources[currentSource];
        player.load();
        progress.hide();
        progress.reset();
    }

    /**
     * Function to start video playback.
     * Create video element if it does not exist yet.
     */
    function play() {
        player.play();
    }

    /**
     * Function to pause video playback.
     */
    function pause() {
        player.pause();
    }
    
    /**
     * Function to stop video playback.
     */
    function stop() {
        player.pause();
        player.currentTime = 0;
        
        init();
    }
    
    /**
     * Object handling updating of progress bar
     */
    var progress = {
        init: function () {
            this.dom = document.getElementById('progress');
            this.barEl = document.getElementById('bar');
            
            this.reset();
        },

        reset: function () {
            this.barEl.style.width = 0;
            this.show();
        },

        updateProgress: function (elapsed, total) {
            var progress = 100 * elapsed / total;

            this.barEl.style.width = progress + '%';
        },

        show: function () {
            this.dom.style.visibility = "visible";
        },

        hide: function () {
            this.dom.style.visibility = "hidden";
        }
    };

    /**
     * Start the application once loading is finished
     */
    window.onload = function () {
        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
            return;
        }
        
        log('EventTarget:'+ EventTarget);
        //log('EventTarget.prototype'+ EventTarget && EventTarget.prototype && EventTarget.prototype.addEventListener.toString());
        log('ZonePatched EventTarget:' + EventTarget.prototype['__zone_symbol__addEventListener']);
        //var desc = Object.getOwnPropertyDescriptor(EventTarget.prototype, 'addEventListener');
        //log('desc: ' + desc);
        log('MediaSource:' + window['MediaSource']);
        if (window['MediaSource']) {
        	 
        	 //log('same? ' + mediaSource.addEventListener === EventTarget.prototype.addEventListener);
        }
        progress.init();
        
        displayVersion();
        registerKeys();
        registerKeyHandler();
        player = createPlayer();
        document.querySelector('.left').appendChild(player);
        
        document.body.addEventListener('unload', onUnload);
    };
})();