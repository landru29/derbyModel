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

                    scope.rollerDerbyGame.setInteractive(scope.interactive);

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
                        },
                        addKeyframe: function (animation) {
                            var keyFrame = animation.addKeyFrame({
                                position: new rollerDerbyModel.Vector({
                                    x: 0,
                                    y: 0
                                })
                            });

                        }

                    };
                    /** API **/


                }
            };
        }]);
    }
})();