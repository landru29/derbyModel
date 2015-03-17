(function () {
    if ('undefined' !== typeof angular) {
        angular.module('roller-derby', []);

        angular.module('roller-derby').provider('rollerDerbyModel', [function () {

            var model = new _DerbySimulator();

            this.$get = [function () {
                return model;
            }];
        }]);

        angular.module('roller-derby').directive('rollerDerbyGame', [function () {
            return {
                restrict: 'A',
                replace: false,
                scope: {
                    rollerDerbyGame: '=',
                    interactive: '='
                },

                link: function (scope, element, attrs) {
                    console.log(scope.rollerDerbyGame);
                    element[0].appendChild(scope.rollerDerbyGame.getElement());
                    
                    /** INTERACTIVE **/
                    if (scope.interactive) {
                        var movingPlayer = null;
                        var allPlayers = scope.rollerDerbyGame.allHumans;
                        for (var i in allPlayers) {
                            (function(player) {
                                angular.element(player.getElement()).bind('mousedown', function(event) {
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
                            console.log('mouse move');
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
                    
                    
                }
            };
        }]);
    }
})();