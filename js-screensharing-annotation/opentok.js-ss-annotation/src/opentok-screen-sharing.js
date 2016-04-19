var ScreenSharingAccPack = (function() {


    var self;
    var extensionAvailable;

    /** 
     * Screensharing accerlator pack constructor
     * @param {Object} options
     * @param {String} options.sessionID
     * @param [String] options.extensionID
     * @param [String] options.extentionPathFF
     * @param [String] options.screensharingParent 
     */

    var ScreenSharing = function(options) {

        self = this;

        console.log('options passed to screensharing things', options);

        // Check for required options
        _validateOptions(options);

        // Extend our instance
        var optionsProps = [
            'sessionID',
            'annotation',
            'extensionURL',
            'extensionID',
            'extensionPathFF',
            'screensharingParent'
        ];

        _.extend(this, _.defaults(_.pick(options, optionsProps)), {
            screenSharingParent: '#videoContainer'
        });

        // Register Chrome extension
        _registerExtension(this.extensionID);

        // Do UIy things
        _setupUI(self.screensharingParent);
    };

    var _validateOptions = function(options) {

        if (!_.property('sessionID', options)) {
            throw new Error('Screen Share Acc Pack requires a session ID');
        }

        if (!_.property('extensionID') && !_.get(options, 'extensionPathFF')) {
            throw new Error('Screen Share Acc Pack requires a Chrome or Firefox extension');
        }
    };

    var _registerExtension = function(extensionID) {
        if (OT.$.browser() == 'Chrome') {
            OT.registerScreenSharingExtension('chrome', extensionID, 2);
        }
    };

    // var startScreenSharing = ['<button class="wms-icon-screen" id="startScreenShareBtn"></button>'].join('\n');
    var screenSharingView = [
        '<div class="hidden" id="screenShareView">',
        '<div class="wms-feed-main-video">',
        '<div class="wms-feed-holder" id="videoHolderScreenShare"></div>',
        '<div class="wms-feed-mask"></div>',
        '<img src="/images/mask/video-mask.png"/>',
        '</div>',
        '<div class="wms-feed-call-controls" id="feedControlsFromScreen">',
        '<button class="wms-icon-screen active hidden" id="endScreenShareBtn"></button>',
        '</div>',
        '</div>'
    ].join('\n');
    
    var screenDialogsExtensions = [
        '<div id="dialog-form-chrome" class="wms-modal" style="display: none;">',
        '<div class="wms-modal-body">',
        '<div class="wms-modal-title with-icon">',
        '<i class="wms-icon-share-large"></i>',
        '<span>Screen Share<br/>Extension Installation</span>',
        '</div>',
        '<p>You need a Chrome extension to share your screen. Install Screensharing Extension. Once you have installed, please, click the share screen button again.</p>',
        '<button id="btn-install-plugin-chrome" class="wms-btn-install">Accept</button>',
        '<button id="btn-cancel-plugin-chrome" class="wms-cancel-btn-install"></button>',
        '</div>',
        '</div>',
        '<div id="dialog-form-ff" class="wms-modal" style="display: none;">',
        '<div class="wms-modal-body">',
        '<div class="wms-modal-title with-icon">',
        '<i class="wms-icon-share-large"></i>',
        '<span>Screen Share<br/>Extension Installation</span>',
        '</div>',
        '<p>You need a Firefox extension to share your screen. Install Screensharing Extension. Once you have installed, refresh your browser and click the share screen button again.</p>',
        '<a href="#" id="btn-install-plugin-ff" class="wms-btn-install" href="">Install extension</a>',
        '<a href="#" id="btn-cancel-plugin-ff" class="wms-cancel-btn-install"></a>',
        '</div>',
        '</div>'
    ].join('\n');

    var _initPublisherScreen = function() {
        var self = this;
        var handler = this.onError;

        var createPublisher = function(publisherDiv) {

            var innerDeferred = $.Deferred();

            publisherDiv = publisherDiv || 'videoHolderScreenShare';

            self.options.publishers.screen = OT.initPublisher(publisherDiv, self.options.localScreenProperties, function(error) {
                if (error) {
                    error.message = 'Error starting the screen sharing';
                    innerDeferred.reject(error);
                } else {
                    self.options.publishers.screen.on('streamCreated', function(event) {
                        console.log('streamCreated publisher screen', event.stream);
                    });
                    innerDeferred.resolve();
                }
            });

            return innerDeferred.promise();
        };

        var outerDeferred = $.Deferred();

        if (!!self._annotation) {

            self._annotation.start(self.session, {
                    externalWindow: true
                })
                .then(function() {
                    console.log('resolve annotation start');
                    var annotationWindow = self.comms_elements.annotationWindow;
                    var annotationElements = annotationWindow.createContainerElements();
                    createPublisher(annotationElements.publisher)
                        .then(function() {
                            outerDeferred.resolve(annotationElements.annotation);
                        });
                });
        } else {

            createPublisher()
                .then(function() {
                    outerDeferred.resolve();
                });
        }

        return outerDeferred.promise();
    };

    var checkExtension = function(extensionID, extensionPathFF) {

        // var handler = this.onError;
        if (OT.$.browser() === 'Chrome' && (!extensionID || extensionID.length === 0)) {
            var error = {
                code: 200,
                message: ' Error starting the screensharing. You need to indicate a screensharing Chrome extensionID'
            };
            console.log(error.code, error.message);
            return false;
        }
        if (OT.$.browser() === 'Firefox' && (!extensionPathFF || extensionPathFF.length == 0)) {
            var error = {
                code: 200,
                message: ' Error starting the screensharing. You need to indicate a screensharing extension for Fireforx'
            };
            console.log(error.code, error.message);
            return false;
        }



        OT.checkScreenSharingCapability(function(response) {
            console.log('checkScreenSharingCapability', response);
            if (location.protocol == "http:") {
                alert("Screensharing only works under 'https', please add 'https://' in front of your debugger url.");
            } else {
                if (!response.supported || response.extensionRegistered === false) {
                    alert("This browser does not support screen sharing! Please test with Chrome, Firefox or IE!");
                } else {
                    if (response.extensionInstalled === false) {
                        $("#dialog-form-chrome").toggle();
                    } else {
                        console.log("The screensharing extension is installed");
                        // Screen sharing is available
                        if (response.supportedSources.window || response.supportedSources.application || response.supportedSources.browser) {
                            console.log("Supported sources: window, application  or browser.");
                        } else if (response.supportedSources.screen) {
                            console.log("Supported sources: screen");
                        } else {
                            var whatIsSupported = Object.keys(response.supportedSources).filter(function(source) {
                                return response.supportedSources[source];
                            });
                        }

                        self._initPublisherScreen()
                            .then(function(annotationContainer) {
                                console.log('resolve init publisher screen');
                                self.publisher = self._publish('screen');
                                addPublisherEventListeners();

                                if (!!annotationContainer) {
                                    var annotationWindow = self.comms_elements.annotationWindow;
                                    self._annotation.linkCanvas(self.publisher, annotationContainer, annotationWindow);
                                }
                            });

                        var addPublisherEventListeners = function() {

                            self.publisher.on('streamCreated', function(event) {
                                self._handleStartScreenSharing(event)
                            });

                            self.publisher.on('streamDestroyed', function(event) {
                                console.log('stream destroyed called');
                                self._handleEndScreenSharing(event);
                            });

                            /*this.publisher.on("accessDenied", function() {
                                self._unpublish('screen');
                                alert("Permission to use the camera and microphone are disabled");
                            })*/
                        };

                    }
                }
            }
        });
    }

    var _setupUI = function(parent) {
        $('body').append(screenDialogsExtensions);
        // $(startScreenSharingBtn).append(startScreenSharing);
        $(parent).append(screenSharingView);
    };

    var _startScreenSharing = function() {
        console.log('start screensharing');
        // self._widget.start();
    };

    var _endScreenSharing = function() {
        console.log('end screensharing');
        // self.widget.end();
    };

    var start = function() {


    }

    ScreenSharing.prototype = {
        constructor: ScreenSharing,
        checkExtension: checkExtension,
        start: start,
        end: end,
        onStarted: function() {},
        onEnded: function() {},
        onError: function(error) {
            console.log('OT: Screen sharing error: ', error);
        }
    };

    return ScreenSharing;

})();