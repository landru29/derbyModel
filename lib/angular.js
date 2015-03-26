(function () {
    if ('undefined' !== typeof angular) {
        angular.module('roller-derby', []);

        angular.module('roller-derby').provider('rollerDerbyModel', [function () {

            var model = new _DerbySimulator();

            this.$get = [function () {
                return model;
            }];
        }]);

        angular.module('roller-derby').directive('rollerDerbyGame', ['rollerDerbyModel', function (rollerDerbyModel) {
            return {
                restrict: 'A',
                replace: false,
                scope: {
                    rollerDerbyGame: '=',
                    interactive: '=',
                    edit: '='
                },

                link: function (scope, element, attrs) {
                    element[0].appendChild(scope.rollerDerbyGame.getElement());
                    
                    var movingElement = null;

                    /** INTERACTIVE **/
                    if (scope.interactive) {
                        
                        var allPlayers = scope.rollerDerbyGame.allHumans;
                        for (var i in allPlayers) {
                            (function (player) {
                                angular.element(player.getElement()).bind('mousedown', function (event) {
                                    movingElement = {
                                        element: player,
                                        clientX: event.clientX,
                                        clientY: event.clientY
                                    };
                                });
                            })(allPlayers[i]);
                        }

                        angular.element(element).bind('mousemove', function (event) {
                            if (movingElement === null) return;
                            movingElement.element.setPosition(null, new $derby.Vector({
                                x: (event.clientX - movingElement.clientX) / scope.rollerDerbyGame.opt.scale,
                                y: (event.clientY - movingElement.clientY) / scope.rollerDerbyGame.opt.scale
                            }));
                            movingElement.clientX = event.clientX;
                            movingElement.clientY = event.clientY;

                        });

                        angular.element(element).bind('mouseup', function () {
                            movingElement = null;
                        });
                    }
                    /** INTERACTIVE **/



                    /** API **/
                    scope.rollerDerbyGame.api = {
                        hideAllKeyframes: function () {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                var elt = keyframes[i].getElement();
                                if (elt) {
                                    rollerDerbyModel.addStyle(elt, {
                                        display: 'none'
                                    });
                                }
                            }
                        },
                        showKeyFrames: function (animation) {
                            if (!animation) return;
                            var keyframes = animation.keyFrames;
                            for (var i in keyframes) {
                                rollerDerbyModel.addStyle(keyframes[i].getElement(), {
                                    display: null
                                });
                            }

                        },
                        lockAllKeyframes: function () {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                keyframes[i].setLock(true);
                            }
                        },
                        unlockKeyFrames: function (animation) {
                            if (!animation) return;
                            var keyframes = animation.keyFrames;
                            for (var i in keyframes) {
                                keyframes[i].setLock(false);
                            }

                        },
                        toggleKeyframeShadow: function (state) {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                keyframes[i].shadowElement(state);
                            }
                        },
                        launchAnimation: function (player, index) {
                            if (scope.edit) {
                                scope.rollerDerbyGame.api.toggleKeyframeShadow(true);
                            }
                            player.selectAnimation(index);
                            player.lauchAnimation(function () {
                                if (scope.edit) {
                                    scope.rollerDerbyGame.api.toggleKeyframeShadow(false);
                                }
                            });
                        },
                        launchAllAnimation: function () {
                            if (scope.edit) {
                                scope.rollerDerbyGame.api.toggleKeyframeShadow(true);
                            }
                            scope.rollerDerbyGame.launchAnimation(0, function () {
                                if (scope.edit) {
                                    scope.rollerDerbyGame.api.toggleKeyframeShadow(false);
                                }
                            });
                        }

                    };
                    /** API **/


                    /** ANIMATION EDITOR **/
                    if (scope.edit) {

                        scope.rollerDerbyGame.api.addKeyframe = function (animation) {
                            var point = new rollerDerbyModel.Vector({
                                x: 0,
                                y: 0
                            });

                            var keyFrame = animation.addKeyFrame({
                                position: point
                            });

                            angular.element(keyFrame.getElement()).bind('mousedown', function (event) {
                                if (keyFrame.lock) {
                                    return;
                                }
                                movingElement = {
                                    element: keyFrame,
                                    clientX: event.clientX,
                                    clientY: event.clientY
                                };
                            });
                        };
                    }
                    /** ANIMATION EDITOR **/


                }
            };
        }]);
    }
})();