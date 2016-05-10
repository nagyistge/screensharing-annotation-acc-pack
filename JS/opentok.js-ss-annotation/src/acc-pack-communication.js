var Communication = (function() {

    var self;

    /** 
     * @constructor
     * Represents a one-to-one AV communication layer
     * @param {object} options
     * @param {object} options.session
     * @param {string} options.sessionId
     * @param {string} options.apiKey
     * @param {array} options.subscribers
     * @param {array} options.streams
     * @param {boolean} options.annotation
     */
    var CommunicationComponent = function(options) {
        self = this;

        var nonOptionProps = ['accPack', 'session', 'subscribers', 'streams'];
        self.options = _validateOptions(options, nonOptionProps);
        _.extend(self, _.pick(options, nonOptionProps));

        _registerEvents();
        _setEventListeners();
        _logAnalytics();
    };


    /** Private Methods */

    /**
     * Validates options and returns a filtered hash to be added to the instance
     * @param {object} options
     * @param {array} ignore - Properties that should not be included in options
     */
    var _validateOptions = function(options, ignore) {

        if (!options || !options.session) {
            throw new Error('No session provided.');
        }

        return _.omit(options, ignore);
    };

    var _triggerEvent;
    var _registerEvents = function() {

        var events = [
            'startCall',
            'endCall',
            'startViewingSharedScreen',
            'endViewingSharedScreen'
        ];

        _triggerEvent = self.accPack.registerEvents(events);
    };

    var _setEventListeners = function() {
        self.accPack.registerEventListener('streamCreated', _handleStreamCreated);
        self.accPack.registerEventListener('streamDestroyed', _handleStreamDestroyed);
    };

    var _logAnalytics = function() {

        var _otkanalyticsData = {
            sessionId: self.options.sessionId,
            connectionId: self.session.connection.connectionId,
            partnerId: self.options.apiKey,
            clientVersion: '1.0.0'
        };

        var _otkanalytics = new OTKAnalytics(_otkanalyticsData);

        var _loggingData = {
            action: 'one-to-one-sample-app',
            variation: ''
        };

        _otkanalytics.logEvent(_loggingData);
    };

    var _publish = function(type) {

        currentSource = type;

        var handler = self.onError;

        _initPublisherCamera();

        return self.session.publish(self.publisher, function(error) {
            if (error) {
                console.log("Error starting a call " + error.code + " - " + error.message);
                error.message = "Error starting a call";
                if (error.code === 1010) {
                    var errorStr = error.message + ". Check your network connection.";
                    error.message = errorStr;
                }
                _handleError(error, handler);
            }
        });
    };

    var _unpublish = function() {
        if (self.publisher) {
            self.session.unpublish(self.publisher);
        }
    };

    var _initPublisherCamera = function() {
        if (self.options.user) {
            self.options.localCallProperties.name = self.options.user.name;
        }
        self.publisher = OT.initPublisher('videoHolderSmall', self.options.localCallProperties, function(error) {
            if (error) {
                error.message = "Error starting a call";
                _handleError(error, handler);
            }
            //self.publishers.camera.on('streamDestroyed', self._publisherStreamDestroyed);
        });
    };

    var _publisherStreamDestroyed = function(event) {
        console.log('publisherStreamDestroyed', event);
        event.preventDefault();
    };

    var _subscribeToStream = function(stream) {
        var handler = self.onError;
        if (stream.videoType === 'screen') {
            var options = self.options.localScreenProperties
        } else {
            var options = self.options.localCallProperties
        }

        var videoContainer = stream.videoType === 'screen' ? 'videoHolderSharedScreen' : 'videoHolderBig';

        var subscriber = self.session.subscribe(stream,
            videoContainer,
            options,
            function(error) {
                if (error) {
                    console.log('Error starting a call ' + error.code + ' - ' + error.message);
                    error.message = 'Error starting a call';
                    if (error.code === 1010) {
                        var errorStr = error.message + '. Check your network connection.'
                        error.message = errorStr;
                    }
                    _handleError(error, handler);
                } else {

                    self.streams.push(subscriber);

                    if (stream.videoType === 'screen' && !!self.options.annotation) {
                        _triggerEvent('startViewingSharedScreen', subscriber);
                    }
                }
            });

        self.subscriber = subscriber;
    };

    var _unsubscribeStreams = function() {
        _.each(self.streams, function(stream) {
            self.session.unsubscribe(stream);
        })
    };

    // Private handlers
    var _handleStart = function(event) {

    };

    var _handleEnd = function(event) {

    };

    var _handleStreamCreated = function(event) {
        //TODO: check the joined participant
        self.subscribers.push(event.stream);
        if (self.options.inSession) {
            // TODO Is this required???
            self._remoteParticipant = event.connection;
            _subscribeToStream(event.stream);
        }

    };

    var _handleStreamDestroyed = function(event) {
        console.log('Participant left the call');
        var streamDestroyedType = event.stream.videoType;

        //remove to the subscribers list
        var index = self.subscribers.indexOf(event.stream);
        self.subscribers.splice(index, 1);

        if (streamDestroyedType === 'camera') {
            self.subscriber = null; //to review
            self._remoteParticipant = null;

        } else if (streamDestroyedType === 'screen') {
            _triggerEvent('endViewingSharedScreen');
        } else {
            _.each(self.subscribers, function(subscriber) {
                _subscribeToStream(subscriber);
            });
        }

        //var handler = this.onParticipantLeft(streamDestroyedType);
        // TODO Do we need user date for anything???
        var userData = {
            userId: 'event.stream.connectionId'
        };

    };

    var _handleLocalPropertyChanged = function(event) {

        if (event.changedProperty === 'hasAudio') {
            var eventData = {
                property: 'Audio',
                enabled: event.newValue
            }
        } else {
            var eventData = {
                property: 'Video',
                enabled: event.newValue
            }
        }
    }

    var _handleError = function(error, handler) {
        if (handler && typeof handler === 'function') {
            handler(error);
        }
    };

    // Prototype methods
    CommunicationComponent.prototype = {
        constructor: Communication,
        start: function(recipient) {
            //TODO: Managing call status: calling, startCall,...using the recipient value

            self.options.inSession = true;

            self.publisher = _publish('camera');

            $.when(self.publisher.on('streamCreated'))
                .done(function(event) {
                    _handleStart(event)
                })
                .promise(); //call has been initialized

            self.publisher.on('streamDestroyed', function(event) {
                console.log("stream destroyed");
                _handleEnd(event); //call has been finished
            });

            self.publisher.session.on('streamPropertyChanged', function(event) {
                if (self.publisher.stream === event.stream) {
                    _handleLocalPropertyChanged(event)
                }
            }); //to handle audio/video changes

            _.each(self.subscribers, function(subscriber) {
                _subscribeToStream(subscriber);
            });

            _triggerEvent('startCall');

        },
        end: function() {
            self.options.inSession = false;
            _unpublish('camera');
            _unsubscribeStreams();
            _triggerEvent('endCall');
        },
        enableLocalAudio: function(enabled) {
            self.publisher.publishAudio(enabled);
        },
        enableLocalVideo: function(enabled) {
            self.publisher.publishVideo(enabled);
        },
        enableRemoteVideo: function(enabled) {
            self.subscriber.subscribeToVideo(enabled);
            self.onEnableRemoteMedia({
                media: 'video',
                enabled: enabled
            });
        },
        enableRemoteAudio: function(enabled) {
            self.subscriber.subscribeToAudio(enabled);
            self.onEnableRemoteMedia({
                media: 'audio',
                enabled: enabled
            });
        }
    };

    return CommunicationComponent;

})();