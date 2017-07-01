$(go);

var sun = new Image();
var moon = new Image();
var earth = new Image();

var roomsList = [];

var ctx;

var width = 400;
var height = 600;

var goalDistance = 100;
var safeDistance = 120;

function go () {
  ctx = document.getElementById('canvas').getContext('2d');
  ctx.font="15px Georgia";
  ctx.textAlign='center';
  ctx.baseline='middle';

  draw();

  $.ajax({
      url:'/rooms/json',
      type:"GET",
      dataType:"json",
      success: function(data){
          roomsList = data;
          roomsList.forEach(function(room) {
              SetupRoom(room);
          });

      },
      error: function (e) {
          console.log(e);
      }
  });
}


function draw() {
//  var ctx = document.getElementById('canvas').getContext('2d');

  ctx.fillStyle = 'rgb(240, 240, 255)';
  ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
  ctx.fillRect(0,0, width, height);

  RepulseRooms();

  roomsList.forEach(function(room) {
    DrawRoomBox(room);
  });
  roomsList.forEach(function(room) {
    UpdateRoom(room);
  });

  //  ctx.fillRect(100,199 ,30, 30);
  window.requestAnimationFrame(draw);
}

function SetupRoom (room) {
  room.x = Math.random() * 200 + width / 2 - 100;
  room.y = Math.random() * 200 + width / 2 - 100;
  room.dx = room.x;
  room.dy = room.y;
}

function DrawRoomBox (room) {
  ctx.strokeStyle = 'rgb(0,0,0)';
  ctx.fillStyle='rgb(0,0,0)';
  ctx.fillText(room.title,room.x,room.y -25);
  ctx.fillStyle='rgb(255,255,255)';
  ctx.fillRect(room.x- 20, room.y -20,40, 40);
  ctx.strokeRect(room.x- 20, room.y -20,40, 40);
}

function UpdateRoom (room) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  room.x += (Math.random() - 0.5) * 0.05;
  room.y += (Math.random() - 0.5) * 0.05;

  room.exits.forEach(function(exit) {
    target = FindRoom(exit.room);
    if(target){
      var dis = Distance(room, target);
      var change = (goalDistance -dis) * 0.01;
      var angle = AngleTo(target, room);
      Move (room, angle, change * 0.5);
      Move (target, angle, change * -0.5);

      if(ExitInRoom(room._id, target)) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgb(0,0,0)';
      } else {
          ctx.strokeStyle = 'rgb(255,0,0)';
        ctx.lineWidth= 1;
      }
      DrawLine(room.x, room.y, target.x, target.y);

    }
  });

  var tempX = room.x;
  var tempY = room.y;
  room.x += (room.x - room.dx)*0.98;
  room.y += (room.y - room.dy)*0.98;
  room.dx = tempX;
  room.dy = tempY;

  room.x = Math.max(25, Math.min(width - 25, room.x));
  room.y = Math.max(25, Math.min(height -25, room.y));
}

function RepulseRooms () {
  for(var i = 0; i < roomsList.length; i++ ){
    var room1 = roomsList[i];
    for(var k = 0; k < roomsList.length; k++ ){
      var room2 = roomsList[k];
      if(room1 != room2) {
        var dis = Distance(room1, room2);
        if(dis < safeDistance) {
          var change = (safeDistance -dis) * 0.002;
          var angle = AngleTo(room2, room1);
          Move (room1, angle, change * 0.5);
          Move (room2, angle, change * -0.5);
        }
      }
    }
  }
}


function FindRoom(id) {
  for(var i =0 ; i < roomsList.length; i++){
    if(roomsList[i]._id == id) {
      return roomsList[i];
    }
  }
  return null;
}

function DrawLine (x,y, gx,gy){
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(gx, gy);
  ctx.stroke();
}

function Distance(room, room2) {
  var a = room.x - room2.x;
  var b = room.y - room2.y;
  return Pyth(a,b);
}

function Pyth(a, b) {
  return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
}

function AngleTo(room1, room2) {
  return Math.atan2(room2.y - room1.y, room2.x-room1.x);
}

function Move(room, angle, distance) {
  room.x += Math.cos(angle) * distance;
  room.y += Math.sin(angle) * distance;
}

function ExitInRoom (id, room) {
  for(var i = 0; i < room.exits.length; i++) {
    var exit = room.exits[i];
  //  console.log(exit.room + " " + id + ((exit.room == id) ? ' TRUEEEEEE' : ''));
    if(exit.room == id) {
      return true;
    }
  }
  return false;
}
