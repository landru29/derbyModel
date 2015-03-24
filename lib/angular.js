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

                    /** INTERACTIVE **/
                    if (scope.interactive) {
                        var movingPlayer = null;
                        var allPlayers = scope.rollerDerbyGame.allHumans;
                        for (var i in allPlayers) {
                            (function (player) {
                                angular.element(player.getElement()).bind('mousedown', function (event) {
                                    var id = player.id;
                                    movingPlayer = {
                                        player: scope.rollerDerbyGame.findObject(id),
                                        clientX: event.clientX,
                                        clientY: event.clientY
                                    };
                                });
                            })(allPlayers[i]);
                        }

                        angular.element(element).bind('mousemove', function (event) {
                            if (movingPlayer === null) return;
                            movingPlayer.player.setPosition(null, new $derby.Vector({
                                x: (event.clientX - movingPlayer.clientX) / scope.rollerDerbyGame.opt.scale,
                                y: (event.clientY - movingPlayer.clientY) / scope.rollerDerbyGame.opt.scale
                            }));
                            movingPlayer.clientX = event.clientX;
                            movingPlayer.clientY = event.clientY;

                        });

                        angular.element(element).bind('mouseup', function () {
                            movingPlayer = null;
                        });
                    }
                    /** INTERACTIVE **/



                    /** API **/
                    scope.rollerDerbyGame.api = {
                        hideAllKeyframes: function () {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                rollerDerbyModel.addStyle(keyframes[i].position.data, {
                                    display: 'none'
                                });
                            }
                        },
                        toggleKeyframeShadow: function (state) {
                            var keyframes = rollerDerbyModel.Keyframe.prototype.all;
                            for (var i in keyframes) {
                                if (state) {
                                    rollerDerbyModel.addClass(keyframes[i].position.data, 'shadow');
                                } else {
                                    rollerDerbyModel.removeClass(keyframes[i].position.data, 'shadow');
                                }
                            }
                        },
                        showKeyFrames: function (animation) {
                            if (!animation) return;
                            var keyframes = animation.keyFrames;
                            for (var i in keyframes) {
                                rollerDerbyModel.addStyle(keyframes[i].position.data, {
                                    display: null
                                });
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
                            scope.rollerDerbyGame.launchAnimation(function () {
                                if (scope.edit) {
                                    scope.rollerDerbyGame.api.toggleKeyframeShadow(false);
                                }
                            });
                        }

                    };
                    /** API **/


                    /** ANIMATION EDITOR **/
                    if (scope.edit) {
                        scope.movingCross = null;

                        angular.element(element).bind('mouseup', function () {
                            scope.movingCross = null;
                        });

                        angular.element(element).bind('mousemove', function (event) {
                            if (scope.movingCross === null) return;
                            var x = (event.clientX - scope.movingCross.clientX) / scope.rollerDerbyGame.opt.scale;
                            var y = (event.clientY - scope.movingCross.clientY) / scope.rollerDerbyGame.opt.scale;

                            scope.movingCross.data.position.x += x;
                            scope.movingCross.data.position.y += y;
                            scope.movingCross.data.position.data.setAttribute('transform', 'translate(' + scope.movingCross.data.position.x + ', ' + scope.movingCross.data.position.y + ')');

                            scope.movingCross.clientX = event.clientX;
                            scope.movingCross.clientY = event.clientY;

                        });

                        scope.rollerDerbyGame.api.addKeyframe = function (animation) {
                            var point = new rollerDerbyModel.Vector({
                                x: 0,
                                y: 0
                            });
                            var cross = new rollerDerbyModel.svgCross(point, 'keyframe', 60, animation.keyFrames.length + 1);
                            point.data = cross;
                            scope.rollerDerbyGame.addElement(cross);

                            var keyFrame = animation.addKeyFrame(point, 1000);

                            angular.element(cross).bind('mousedown', function (event) {
                                scope.movingCross = {
                                    data: keyFrame,
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