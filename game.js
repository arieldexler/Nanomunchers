/**
 * Created by islam on 12/6/15.
 */
'use strict';
angular.module('myApp')
      .controller('Ctrl', ['$scope','Logic','$interval',
        function ($scope, Logic, $interval) {
                var board = Logic.getBoard();
                var winningScore;
                var winningPlayer;
                var stored;
                var intervalpromise
                $scope.isVoid = function(row,column){
                        return board[row][column].status === "void";
                };

                $scope.isFree = function(row,column){
                        return board[row][column].status === "free";
                };

                $scope.isConnectedLeft = function(row,column){
                        return board[row][column].left === true;
                };

                $scope.isConnectedRight = function(row,column){
                        return board[row][column].right === true;
                };

                $scope.isConnectedTop = function(row,column){
                        return board[row][column].up === true;
                };

                $scope.isConnectedBottom = function(row,column){
                        return board[row][column].down === true;
                };

              /*  $scope.isTakenPlayerOne=function(row,column){
                        return board[row][column].status === "captured_one" ||
                            board[row][column].status === "occupied_one";
                };

                $scope.isTakenPlayerTwo=function(row,column){
                        return board[row][column].status === "captured_two" ||
                            board[row][column].status === "occupied_two";
                };*/
                $scope.isTakenbyPlayer=function(row,column,playerid){
                        return board[row][column].ownedby==playerid
                }

                $scope.shouldShowImage=function(row,column){
                        return board[row][column].status === "occupied"
                };

                $scope.imageLink=function(row,column){

                        if(board[row][column].status === "occupied"){
                              var name =   "player"+board[row][column].ownedby +".png";
                              return name;
                        }
                };

                function update (row,column,directions){
                        stored = null;
                        var player = Logic.currentPlayer();
                        if(Logic.isValidMove(row,column,player)){
                                Logic.makeMove(row,column,player,format(directions));
                        }
                        console.log(row + " " + column);
                        console.log(Logic.getBoard()[row][column])
                        console.log("PLAYER1:" + Logic.getScore(0) + "PLAYER2:" + Logic.getScore(1));
                        if (Logic.getRemainingMoves(player)==0)
                                $scope.completeTurn();


                }

                $scope.setGameMode=function(gameMode){
                        Logic.setGameMode(gameMode);
                };

                $scope.completeTurn=function(){
                        console.log("TURN COMPLETE");
                        Logic.completeTurn();
                        console.log(Logic.getBoard());

                        if (Logic.noMorePieces()){
                                 intervalpromise = $interval(playtoend,1000);
                        }
                };
                  function playtoend(){
                        if (Logic.isGameOver()){
                            getWinner()
                            $interval.cancel(intervalpromise)
                                alert("Winner: " + winningPlayer +"!")
                        }
                        else {
                                Logic.advanceTime()
                        }
                  }
                $scope.store = function(row,column){
                        stored = {r:row,c:column};
                };

                $scope.showDirectionInput = function(){
                     if(stored){
                             return true;
                     }else{
                             return false;
                     }
                };

                $scope.getLeft=function(){
                        if(stored){
                                return stored.c * 6.66 * .75;
                        }
                };

                $scope.getTop=function(){
                        if(stored){
                                return stored.r * 6.66;
                        }
                };

                $scope.test = function(element){
                        if(element.keyCode == 13){
                                var elem = element.srcElement || element.target;
                               validateProgram(elem.value);
                                elem.value = '';
                        }
                };

                function validateProgram(value){
                        if(value==='') value = 'UDLR';          
                        value = value.toUpperCase();
                        var chars = value.split('');

                        if(isValidInputString(chars)){
                                update(stored.r, stored.c,chars)
                        }

                }

                function isValidInputString(value){
                        //Check the length of the string
                        if(value.length !== 4){
                                return false;
                        }

                        //Check that it has one of each type
                        return value.includes("U") && value.includes("D") &&
                            value.includes("L") && value.includes("R");
                }

                function format(direction){
                        var returnVals = [];
                        for(var i = 0; i < direction.length; i++){
                                var val = direction[i];
                                if(val === "U"){
                                        returnVals.push("UP");
                                }else if(val === "D"){
                                        returnVals.push("DOWN");
                                }else if(val === "R"){
                                        returnVals.push("RIGHT");
                                }else if(val === "L"){
                                        returnVals.push("LEFT");
                                }
                        }
                        return returnVals;
                }

                function newGame (playersDict){
                        Logic.newGame(playersDict);
                        board = Logic.getBoard();
		         winningScore=0;
                           
                }

                function getWinner(){
                    var winner = Logic.getWinner()
                    winningPlayer=winner[0];
                    winningScore=winner[1];
                }

                function getNumPlayers(){
                   return Logic.getNumPlayers()
                }

                $scope.getScore = function(playerNumber){
                       return Logic.getScore(playerNumber);
                };

                $scope.getWinningScore = function (){
                   return winningScore;
                }

                $scope.getWinningPlayer = function(){
                   return winningPlayer;
                }

                $scope.isGameOver = function(){

                    var gameover = Logic.isGameOver()
                        if (gameover){
                                console.log("GAME OVER")
                        }
                        return gameover
                }

                $scope.getRemainingMoves = function(playerNumber){
                       return Logic.getRemainingMoves(playerNumber);
                };


                $scope.numPlayers = 2

                $scope.start = function(){
                        var playersDict=[]
                        for (var i=1;i<parseInt($scope.numPlayers)+1;i++){
                            var pname =   document.getElementById("p"+i+"Name").value
                            var isRobot =   document.getElementById("p"+i+"Robot").checked?false:true
                                playersDict.push([pname,isRobot])

                        }
                        newGame(playersDict);
                        stored = null;
                };

                  $scope.isTurn = function(player){
                        if(player === Logic.currentPlayer()){
                                return "background-color:#337ab7";
                        }else{
                               return "background-color:transparent"
                        }
                }
                  $scope.isPlaying = function (playerid){
                         return playerid<getNumPlayers()
                  }
               $scope.postScore = function () {
		       if (winningScore>0)	{
			  console.log(winningPlayer +":" + winningScore);
			  document.location.href="/drecco/index.php?task=NanomunchersV2&winner="+winningPlayer+"&ws="+winningScore;
}
else
alert("Game is not over yet!")
}			
            }]);
//test
