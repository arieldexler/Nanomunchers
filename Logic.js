
(function () {
    "use strict";

    angular.module('myApp', []).factory('Logic',
        function () {

            var Direction = Object.freeze({
                UP: 0,
                DOWN: 1,
                LEFT: 2,
                RIGHT: 3
            });

            var Status = Object.freeze({
                EATEN: "captured",
                FREE: "free",
                OCCUPIED: "occupied",
                VOID: "void"
            });


            //initialize game of 2 human plays

            var Player = function (playerId, pieces, playerName, isRobot) {
                var that = this
                this._playerId = playerId;
                this._playerName = playerName;
                this._isRobot = isRobot;
                this._unused = [];
                this._inPlay = [];
                this._dead = [];

                this._nextMove = null;// ["UP","DOWN","LEFT","RIGHT"];//""; //default


                for (var i = 0; i < pieces; i++) {
                    var piece = new Piece(playerId);
                    this._unused.push(piece);
                }

                this.advanceTime = function () {
                    //For all inplay pieces move them
                    this._inPlay.forEach(function (piece) {
                        piece.advance()
                    });
                    //If any of the pieces become dead then remove from the inplay
                    this.clearDead();
                };

                /**
                 * Used to make the initial move for a an unused piece, requires the node and the program for the piece
                 */
                this.place = function (node, program) {
                    //var node = board[x][y];
                    if (node.isFree() && this._unused.length > 0) {
                        var nextPiece = this._unused.splice(0, 1)[0];
                        nextPiece.programPiece(program);
                        nextPiece.placeOnNode(node);
                        //      nextPiece._location = node;
                        //     node.place(nextPiece);
                        node._occupy(nextPiece);
                        //   node.desireOccupancy = [];
                        this._inPlay.push(nextPiece);
                        nextPiece.advance() //claim node for next round
                        return true;
                    } else {
                        return false;
                    }
                };

                this.getPlayerName = function () {
                    return this._playerName;
                };

                this.setNextMove = function (nextMove) {
                    this._nextMove = nextMove;
                };

                this.getNextMove = function () {
                    return this._nextMove;
                };

                this.toString = function () {
                     return null;
                };

                this.clearDead = function () {
                    var i = that._inPlay.length;
                    while (i--) {
                        if (that._inPlay[i].isDead()) {
                            var piece = that._inPlay.splice(i, 1)[0];
                            that._dead.push(piece);
                        }
                    }
                };

                this.getPlayerId = function () {
                    return this._playerId.name();
                };

                this.unusedCount = function () {
                    return this._unused.length;
                };

                this.deadCount = function () {
                    return this._dead.length;
                };

                this.inPlayCount = function () {
                    return this._inPlay.length;
                };

                this.getScore = function () {
                    var score = 0;
                    this._inPlay.map(function (piece) {
                        score = score + piece.getNodesEaten();
                    });
                    this._dead.map(function (piece) {
                        //score = score + piece.getNodesEaten();
                        score = score + piece.getNodesEaten();

                    });

                    return score;
                }

                this.makeRandomMove = function (playerid) {
                    var freenodes = []
                    var board = thisGame.getBoard()
                    var boardSize = board.length
                    for (var i = 0; i < boardSize; i++)
                        for (var j = 0; j < boardSize; j++) {
                            if (board[i][j].isFree())
                                freenodes.push(board[i][j]);
                        }
                    var randint = Math.floor(Math.random() * freenodes.length)
                    makeMove(freenodes[randint].row, freenodes[randint].col, playerid, ["UP", "DOWN", "LEFT", "RIGHT"])
                }

            };

            var Piece = function (playerId) {
                this._playerId = playerId;
                this._location = null;
                this._program = [];
                this._moveCount = 0;
                this._isDead = false;
                this._nodesEaten = 0;


                this.advance = function () {
                    if (this._isDead == false) {
                        var numberOfDirection = 4;
                        Object.freeze(numberOfDirection);
                        if (this._location != null) {
                            //Search for valid move
                            for (var i = this._moveCount; i < this._moveCount + numberOfDirection; i++) {
                                var nextMove = this._program.indexOf((i) % numberOfDirection);

                                if (this._location.canMove(nextMove)) {
                                    this._location.move(nextMove);
                                    this._moveCount = i + 1;
                                    return nextMove;
                                }
                            }

                            //If no valid move available then the piece is dead
                            this._isDead = true;
                            return null;
                        }
                    }
                    return null;
                }
                this.programPiece = function (moveOrder) {
                    //  if (_isValidProgram(moveOrder)) {
                    this._program = moveOrder;
                    // }
                }


                this.placeOnNode = function (node) {
                    this._location = node;
                    //  this._nodesEaten++;
                }

                this.getPlayerId = function () {
                    return this._playerId;
                }

                this.getNodesEaten = function () {
                    return this._nodesEaten;
                }

                this.isDead = function () {
                    return this._isDead;
                }

                this.getPreviousDirection = function () {
                    if (this._moveCount > 0) {
                        return this._program.indexOf((this._moveCount - 1) % 4);
                    } else {
                        return null;
                    }

                }
                this.killPiece = function () {
                    this._isDead = true;
                }

                this.isNewPiece = function () {
                    return this._moveCount == 0;
                }


            }


            var Node = function (row, col) {
                var that = this
                this.row = row
                this.col = col
                // this._xLoc = xLoc;
                //  this._yLoc = yLoc;
                this.status = Status.FREE;
                // @JsonIgnore
                this.up = null;
                // @JsonIgnore
                this.down = null;
                //@JsonIgnore
                this.left = null;
                // @JsonIgnore
                this.right = null;

                this.ownedby = null //who occupied or ate this node
                this.occupant = null;
                this.desireOccupancy = [];

                this.isFree = function () {
                    return this.status === (Status.FREE);
                }

                this.canMove = function (direction) {
                var board = thisGame.getBoard()
                var boardSize = board.length;
                    switch (direction) {
                        case Direction.UP:
                            if (this.up == false || this.row == 0) {
                                return false;
                            } else {
                                return board[this.row - 1][this.col].isFree();
                            }
                        case Direction.DOWN:
                            if (this.down == false || this.row == boardSize - 1) {
                                return false;
                            } else {
                                return board[this.row + 1][this.col].isFree();
                            }
                        case Direction.LEFT:
                            if (this.left == false || this.col === 0) {
                                return false;
                            } else {
                                return board[this.row][this.col - 1].isFree();
                            }
                        case Direction.RIGHT:
                            if (this.right == false || this.col == boardSize - 1) {
                                return false;
                            } else {
                                return board[this.row][this.col + 1].isFree();
                            }
                        default:
                            return false;
                    }
                }

                this.move = function (direction) {
                    var node;
                    var board = thisGame.getBoard()
                    switch (direction) {
                        case Direction.UP:
                            node = board[this.row - 1][this.col]
                            break;
                        case Direction.DOWN:
                            node = board[this.row + 1][this.col];
                            break;
                        case Direction.LEFT:
                            node = board[this.row][this.col - 1];
                            break;
                        case Direction.RIGHT:
                            node = board[this.row][this.col + 1];
                            break;
                    }
                    node.place(this.occupant);
                    this.occupant.placeOnNode(node);
                    //   console.log("row:" + row +",col:" + col + ":" +board);
                }

                this.place = function (piece) {
                    this.desireOccupancy.push(piece);
                }

                /**
                 * After all pieces have moved onto thier desired node decide which ones to keep and which ones to eject
                 */
                    //   this.moveTime = function (playerWithPriority) {
                this.moveTime = function () {
                    //First check if the node is currently occupied. If so then move the occupant along
                    if (this.occupant != null) {
                 //      this.ownedby = this.occupant.getPlayerId();
                        this.status = Status.EATEN;
                    }

                    var occuopantSelected = false;
                    var newPieces = [];
                    var that = this
                    this.desireOccupancy.map(function (piece) {

                            if (piece.getPreviousDirection() != null) {
                                //First order is piece that moved up to get here
                                if (piece.getPreviousDirection() == (Direction.UP)) {
                                    that._occupy(piece);
                                    occuopantSelected = true;
                                }

                                //Second is piece that moved left
                                if (piece.getPreviousDirection() == (Direction.LEFT)) {
                                    if (occuopantSelected) {
                                        piece.killPiece();
                                    } else {
                                        that._occupy(piece);
                                        occuopantSelected = true;
                                    }
                                }

                                //Third is a piece that moved down
                                if (piece.getPreviousDirection() == (Direction.DOWN)) {
                                    if (occuopantSelected) {
                                        piece.killPiece();
                                    } else {
                                        that._occupy(piece);
                                        occuopantSelected = true;
                                    }
                                }

                                //Fourth is a piece that moved right
                                if (piece.getPreviousDirection() == (Direction.RIGHT)) {
                                    if (occuopantSelected) {
                                        piece.killPiece();
                                    } else {
                                        that._occupy(piece);
                                        occuopantSelected = true;
                                    }
                                }
                            }

                            //Fifth is a new piece
                            if (piece.isNewPiece()) {
                                newPieces.push(piece);
                            }
                        }
                    );

                    newPieces.map(function (piece) {
                        if (occuopantSelected || (newPieces.length > 1)) {// && piece.getPlayerId() != playerWithPriority)) {
                            piece.killPiece();
                        } else {
                            that._occupy(piece);
                            occuopantSelected = true;
                        }
                    });

                    this.desireOccupancy = [];

                };


                this._occupy = function (piece) {
                    this.occupant = piece;
                    this.ownedby = piece.getPlayerId();
                    this.status = Status.OCCUPIED;
                    piece._nodesEaten++;
                };

                this.getStatus = function () {
                    return that.status;
                }
            };

            Node.prototype.getId = function () {
                return this.id;
            };

            Node.prototype.toString = function () {
                var up = this.up;
                var down = this.down;
                var left = this.left;
                var right = this.right;

                return this.id + "," + this.row + "," + this.col + "," + this.status + "," + this.up + "," + this.down + "," + this.left + "," + this.right;
            };



            function advanceTime() {
                thisGame.advanceTime();
            }

            /****************************************************************************************
             * Functions at application startup
             ****************************************************************************************/

            function isValidMove(row, column, player) {
                var node = thisGame.getBoard()[row][column];
                return node.status === Status.FREE;
            }

            function makeMove(row, col, player, program) {
                thisGame.makeMove(row, col, player, program)
            }



            function getBoard() {
                return thisGame.getBoard()
            }


            function currentPlayer() {
                return thisGame.playerTurn;
            }

            function completeTurn() {
                if (thisGame.playerTurn == thisGame.players.length - 1) {
                    advanceTime();
                }
                thisGame.playerTurn = thisGame.playerTurn === thisGame.players.length - 1 ? 0 : thisGame.playerTurn+1;
                if (thisGame.players[thisGame.playerTurn]._isRobot) {
                    thisGame.players[thisGame.playerTurn].makeRandomMove(thisGame.playerTurn)
                    completeTurn()
                 }


            }

            function noMorePieces() {
                return thisGame.players.reduce(function (totalunused, player) {
                        totalunused + player.unusedCount()}) == 0
            }


            function getScore(playerID) {
                return thisGame.players[playerID].getScore();
            }

            function getRemainingMoves(playerID) {
                return thisGame.players[playerID].unusedCount();
            }

            function isGameOver() {
                var isOver = false;
                thisGame.players.map(function (player) {
                    var deadcount =player.deadCount()
                    if (deadcount == thisGame.numPieces) {
                        isOver=true
                    }

                })
                return isOver;
            }

            function getWinner() {
                return thisGame.getWinnr()
            }

            function getNumPlayers(){
                return thisGame.players.length
            }
            var Game=function(playersDict) {
                var that = this
                this.players = [];
                var board = [];
                this.playerTurn = 0;
                this.numPieces = 7;
                var boardSize = 15;
                for (var player in Object.keys(playersDict)) {
                    var p = new Player(this.players.length, this.numPieces,playersDict[player][0] ,playersDict[player][1] );
                    this.players.push(p);
                }

                resetboard()
                this.makeMove = function (row, col, player, program) {
                    that.players[player].setNextMove(program)
                    that.move(row, col, player);
                }

                function getmyboard(){
                    return board;
                }
                this.getBoard = function(){
                    return getmyboard()
                }
                this.move=function(row, col, player) {
                    if (that.players[player].getNextMove() != null) {
                        // var nextMove = player.getNextMove();
                        var move = that.players[player].getNextMove();
                        //If pass then do nothing
                        if (move[0].toLowerCase().trim() === ("pass")) {
                            player.setNextMove(null);
                            return;
                        }

                        var program = [];

                        for (var i = 0; i < 4; i++) {
                            var value = move[i].toLowerCase().trim();

                            if (value === "up") {
                                program.push(Direction.UP);
                            } else if (value === "down") {
                                program.push(Direction.DOWN);
                            } else if (value == "left") {
                                program.push(Direction.LEFT);
                            } else if (value === "right") {
                                program.push(Direction.RIGHT);
                            }
                        }

                        var node = board[row][col];

                        thisGame.players[player].place(node, program);

                    }
                }

                this.advanceTime = function () {
                    for (var i = 0; i < boardSize; i++) {
                        for (var j = 0; j < boardSize; j++) {
                            board[i][j].moveTime();
                        }
                    }
                    this.players.map(function (player) {
                        player.advanceTime()
                    });
                }
                function resetboard() {
                    var objectx = new Node();
                    objectx.status = Status.FREE
                    objectx.left = false
                    objectx.right = true
                    objectx.up = true,
                        objectx.down = true

                    //var objectx2  = Object.create(Node);
                    var objectx2 = new Node();
                    objectx2.status = Status.VOID;
                    objectx2.left = false
                    objectx2.right = false
                    objectx2.up = false,
                        objectx2.down = true

                    // var objectx3  = Object.create(Node);
                    var objectx3 = new Node();
                    objectx3.status = Status.FREE;
                    objectx3.left = false
                    objectx3.right = false
                    objectx3.up = false,
                        objectx3.down = true

                    //var objectx4  = Object.create(Node);
                    var objectx4 = new Node();
                    objectx4.status = Status.FREE;
                    objectx4.left = false
                    objectx4.right = false
                    objectx4.up = false,
                        objectx4.down = true

                    board = [];
                    for (var i = 0; i < boardSize; i++) {
                        var row = [];
                        for (var j = 0; j < boardSize; j++) {
                            var obj;
                            var randint = Math.floor(Math.random() * 5)
                            switch (randint) {
                                case 0:
                                    obj = objectx;
                                    break;
                                case 1:
                                    obj = objectx2;
                                    break;
                                case 2:
                                    obj = objectx3;
                                    break;
                                case 3:
                                    obj = objectx4;
                                    break;
                                default:
                                    obj = objectx;
                            }
                            obj.row = i;
                            obj.col = j;
                            row.push(angular.copy(obj))
                        }
                        board.push(row);
                    }
                    for (var i = 0; i < boardSize; i++)
                        for (var j = 0; j < boardSize; j++) {
                            if (i == 0)
                                board[i][j].up = false;
                            if (j === 0)
                                board[i][j].left = false;
                            if (j === boardSize - 1)
                                board[i][j].down = false;

                            if (i === boardSize - 1)
                                board[i][j].right = false;


                            if (board[i][j].up == true && i > 0)
                                board[i - 1][j].down = true;

                            if (board[i][j].down == true && i < boardSize - 1)
                                board[i + 1][j].up = true;

                            if (board[i][j].left == true && j > 0)
                                board[i][j - 1].right = true;

                            if (board[i][j].right == true && j < boardSize - 1)
                                board[i][j + 1].left = true;


                        }
                }

                this.getWinner = function () {
                    var max = 0
                    var playerid = 0;
                    players.map(function (player) {
                        if (max > player.getScore()) {
                            max = player.getScore()
                            playerid = playerid
                        }
                    })
                    return [players[playerid].getPlayerName(), max]
                }

            }

            function newGame(playersDict){
                thisGame = new Game(playersDict);
            }
            var thisGame =  new Game(["Qbert",false], ["Coily",false], ["pinky",true])
            return {
                isValidMove: isValidMove,
                getBoard: getBoard,
                makeMove: makeMove,
                currentPlayer:currentPlayer,
                completeTurn:completeTurn,
                noMorePieces:noMorePieces,
                advanceTime:advanceTime,
                newGame:newGame,
                getScore:getScore,
                getRemainingMoves:getRemainingMoves,
                isGameOver: isGameOver,
                getWinner:getWinner,
                getNumPlayers:getNumPlayers
            };


        })}());
