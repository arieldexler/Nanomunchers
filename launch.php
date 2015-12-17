<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en" data-framework="angularjs" ng-app="myApp">
<head>
    <title>Dr Ecco</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="../../style.css" media="screen" />

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="Nanomunchers">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

    <script crossorigin="anonymous" src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.js"></script>
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.0/css/bootstrap-toggle.min.css" rel="stylesheet">
    <script src="https://gitcdn.github.io/bootstrap-toggle/2.2.0/js/bootstrap-toggle.min.js"></script>
    <link rel="stylesheet" type="text/css" href="game.css">

    <script src="Logic.js"></script>
    <script src="game.js"></script>

</head>

<body ng-cloak ng-controller="Ctrl">


<div class="post" style="position:absolute; left:0; top:0%; height:30%;width:100%">



    <h1 class="title">Nanomunchers</h1>
    <div style="background-color: #332518">
    <div style="color:white; position:relative;"><br>
        <div class="instr">
            <b>Rules of the game:</b>
            <ul>
                <li><span>#1: </span>Click on a free spot. #2: </span>Type the program: (U)p,(D)own,(L)eft,(R)ight and click Complete Turn when done .</li>
            </ul>
        </div>
        <div>
            <b>The objective of the game is have your nanomunchers eat as many nodes as possible before they run out of nodes and die.</b></div>
    </div>
    </div>
</div>



<div ng-repeat = "row in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]" style="position:absolute; top:{{(row * 6.66) + 30}}%; left:0; width:75%; height:6.66%;">
    <div ng-repeat = "column in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]" style="position:absolute; top:0; left:{{column * 6.66}}%; width:6.66%; height:100%" >
        <div id="row,column"
             ng-click = "store(row,column)"
             ng-class ="{square:true,
                 void: isVoid(row,column),
                 free: isFree(row,column),
                 connectedLeft:isConnectedLeft(row,column),
                 connectedRight:isConnectedRight(row,column),
                 connectedTop:isConnectedTop(row,column),
                 connectedBottom:isConnectedBottom(row,column),
                 takenPlayerOne:isTakenPlayerOne(row,column),
                 takenPlayerTwo:isTakenPlayerTwo(row,column)}">
            <img ng-show="shouldShowImage(row,column)" ng-src="{{imageLink(row,column)}}">
        </div>
    </div>
</div>


<input ng-show="showDirectionInput()" ng-keypress="test($event)" style ="position:absolute; left:{{getLeft()}}%; top:{{getTop() + 30}}%; width: 6.66%; height: 6.66%;;"  type="text" class="form-control" placeholder="UDLR" autofocus>
<input class="">
<div style="position: absolute; right: 0px;top: 30%; width:25%; height: 100%; border: solid;">
    <div ng-if="isGameOver()">"postScore({{getWinningPlayer()}}, {{getWinningScore()}})" </div>
    <button type="button"  ng-click="completeTurn()" class="btn btn-success btn-lg">Complete Turn</button>
    <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">
        New Game
    </button>
    <table class="table" style="color:white">
        <thead>
        <tr>
            <th>Player</th>
            <th>Score</th>
            <th>Remaining Moves</th>
        </tr>
        </thead>
        <tbody>
        <tr style="{{isTurn(0)}}">
            <td><img src="bertleft.png"></td>
            <td>{{getScore(0)}}</td>
            <td>{{getRemainingMoves(0)}}</td>
        </tr>
        <tr style="{{isTurn(1)}}">
            <td><img src="coily.png"> </td>
            <td>{{getScore(1)}}</td>
            <td>{{getRemainingMoves(1)}}</td>
        </tr>
        </tbody>
    </table>
    <div class="post">
        <h2 class="title">Last 10 scores</h2>
        <div style="color: white;">

        <?php
          // functions.php in case of an opening in the same window
          // ../../functions.php in case of an opening in a new window
          include '../../lastScores.php';
          getScores("NanomunchersV2");
        ?>
        </div>
    </div>
    <button id="score2" ng-click="postScore()" type="button" class="btn btn-success btn-lg">Save Score</button>
</div>
</div>

<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <form>
                    Player1:
                    <input id="p1Name" type="text" name="name">
                    <br>
                    Player2:
                    <input id="p2Name" type="text" name="name"><br>
                    Number of Players:
                    <input id="numPlayers" type="checkbox" checked data-toggle="toggle" data-on="Two" data-off="One" data-onstyle="success" data-offstyle="danger" size="large">
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button ng-click="start()" type="button" class="btn btn-primary" data-dismiss="modal">Start</button>

            </div>
        </div>
    </div>
</div>


<div>
    <script>
        function postScore(ws, wr) {
            if (!wr)
                wr = "guest";
            if (wr == "")
                wr = "guest";
            alert("hello!");
            console.log("CHECK!");
            document.location.href="/drecco/index.php?task=NanomunchersV2&winner="+wr+"&ws="+ws;
        }
        // postScore('3','test')
    </script>

</div>


</body>


</html>
