var myPos;//自分の座標

window.onload = function(){
  var testPositionData = new Array();
  var coord = new Array();
  coord = getData().done(function(coord){
    $.each(coord, function(i, content) {
      testPositionData[i] = new google.maps.LatLng(content[0], content[1]);
      console.log("testPosition" + testPositionData[i]);
    });
    // testPositionData[0] = new google.maps.LatLng(34.411,133.2035872,15);
    // testPositionData[1] = new google.maps.LatLng(34.412,133.2037672,15);
    // testPositionData[2] = new google.maps.LatLng(34.413,133.2039572,15);//ここのデータをオープンデータから撮ってきたものにする

    var testRGBData = [100,10,5];

    var teamName = ["江戸", "戦国", "平安"];

    var map = intiMap();//マップのロード
    console.log("testPositionData" + testPositionData[0]);
    console.log("map" + map);
    console.log("teamName" + teamName);
    setMarker(testPositionData, map, teamName);
    startTrackPosition(map);
  });

  // 自チームの表示
  var val = getUrlVars();
  viewMyTeam(val["group"]);
}


//オープンデータの取得
function getData(){
  var coords = new Array();
  var dfd = $.Deferred();

  get = $.ajax({
    type: 'GET',
    url: 'https://sparql.odp.jig.jp/api/v1/sparql?output=csv&force-accept=text%2Fplain&query=select+%3Fo+%7B%0D%0A++%3Fs+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type%3E+%3Chttp%3A%2F%2Fpurl.org%2Fjrrk%23CivicPOI%3E%3B%0D%0A+++%3Chttp%3A%2F%2Fpurl.org%2Fjrrk%23address%3E+%3Faddress.%0D%0A++filter%28regex%28%3Faddress%2C+%22%E5%BA%83%E5%B3%B6%E7%9C%8C%E5%B0%BE%E9%81%93%E5%B8%82%22%29%29%0D%0A++%3Fs+%3Chttp%3A%2F%2Fodp.jig.jp%2Fodp%2F1.0%23genre%3E+%3Chttp%3A%2F%2Fodp.jig.jp%2Fres%2Fcategory%2F%25E9%25A3%259F%25E3%2581%25B9%25E3%2582%258B%3E.%0D%0A++%3Fs+%3Chttp%3A%2F%2Fimi.ipa.go.jp%2Fns%2Fcore%2Frdf%23%E5%9C%B0%E7%90%86%E5%BA%A7%E6%A8%99%3E+%3Fo.%0D%0A%7Dorder+by+rand%28%29+limit+100'
  });

  get.done(function(result) {
    var splitted = split(result, /\r\n|\r|\n/);
    var loc = new Array();
    var coord = new Array();
    splitted.shift();
    $.each(splitted, function(i, content) {
      loc.push(split(content, /^http:\/\/odp.jig.jp\/res\/geopoint\//));
      loc[i].shift();
    });
    $.each(loc, function(i, content) {
      coord.push(split(content + '', /\//));
    });
    $.each(coord, function(i, val) {
      console.log(i + ': ' + val);
    });
    coord.pop();
    coords = coord;
    return dfd.resolve(coords);
  }).fail(function(result) {
    console.log("Failured");
  }
  );

  console.log("!!!!!HERE!!!!!!!!!" + coords);
  return dfd.promise();
}

function split(str, regexp) {
  return str.split(regexp);
}

//地図表示　マップを返す
function intiMap(){
  var preLatlng = new google.maps.LatLng(34.408699,133.2037253, 18.19);//尾道市役所の緯度経度
  var mapOptions = {
    zoom: 18,
    center: preLatlng,
    mapTypeControl: false,
    streetViewControl: false,
  };
  var map = new google.maps.Map($("#map").get(0), mapOptions ) ;
  return map;
}

var line;
//マーカーの設置
function setMarker(latlngs, map, teamName){//latlngsは[[latlng, id], [latlng, id]...]という形式
  var latlng;
  var image = {
    url : "cat.png",
    scaledSize : new google.maps.Size(40 + map.getZoom(), 40 + map.getZoom()),

  }
  for(latlng of latlngs){
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: image
    });

    marker.seeingID = 0;//適当なid
    //設置したマーカーのポップアップを設定
    marker.addListener('click', function(){
      //現在力合クリックしたマーカーへのルートを表示する
      var path = [myPos.toUrlValue(), this.getPosition().toUrlValue()];
      $.get("https://roads.googleapis.com/v1/snapToRoads", {//snapToRoadsメソッドにリクエストを送る
				interpolate: true,//補間のためにノードを増やす？
				key:"AIzaSyCuaxH-7F2GKakj-U0GE9s2qKN1y_qhN-g",//APIのキー
				path: path.join('|'),
			},function(data) {
        var snappedNodes = [];//スナップされたノードを格納する latlng型が入る
        if(line){
          line.setMap(null);
        }
        for (var i = 0; i < data.snappedPoints.length; i++) {
          var latlng = new google.maps.LatLng(data.snappedPoints[i].location.latitude,data.snappedPoints[i].location.longitude);
          snappedNodes.push(latlng);
        }
        line = new google.maps.Polyline({
  				map:map,
  				path:snappedNodes,
  				clickable : false,
  				draggable : false,
  				strokeColor:"#00F",
  				strokeWeight:2,
  			});
			});

      var score;
      /*
      //サーバからのデータの取得（動作確認まだ）
      var url = "/api?uuid";
      $.get(url, {id: this.seeingID}, function(data){
        score = [data.red, data.blue, data.green];
      });
      */
      score = [100, 0, 10];

      var cont = [];//ポップアップの内容
      cont.push('<span id="info">Score');
      for(var i=0;i<3;i++){
        cont.push(teamName[i] + '<span class="score"> ' + score[i] + "</span><br>");
      }

      var distance = google.maps.geometry.spherical.computeDistanceBetween(myPos, this.getPosition());
      if(distance < 100){//距離が一定以下ならアクセスボタンが出るようにする
        cont.push('<button type="button" class="btn btn-primary" onclick = "gotoNext()">アクセス可能</button>');
      }

      cont.push("</span>");
      var contTxt = cont.join("<br>");
      var infowindow= new google.maps.InfoWindow({
        position: this.getPosition(),
        content: contTxt,
      });
      removeInfo();

      infowindow.open(map);
    });
  }
}



//位置情報の連続取得＆マップの中心に自分を表示。自分の位置はマーカーで表示する
var circle;
var point;
function startTrackPosition(map){
  function successed(position){//位置情報取得に成功したとき、その座標をマップの中心にする
    myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if(circle){
      circle.setMap(null);
    }
    if(point)
      point.setMap(null);
    circle = new google.maps.Circle({
      center: myPos,
      map: map,
      fillOpacity: 0.3,
      radius: 100,
      strokeColor: "blue",
      fillColor: "#0000FF",
      strokeOpacity: 1,
      strokeWeight: 1,
    });//円を描画
    point = new google.maps.Circle({
      center: myPos,
      map: map,
      fillOpacity: 0.3,
      radius: 5,
      strokeColor: "blue",
      fillColor: "#0000FF",
      strokeOpacity: 1,
      strokeWeight: 1,
    });//中心の円を描画
  }

  function failed(){
    alert("位置情報の取得に失敗");
  }
  var options = {
    enableHighAccuracy: true,
    timeout: 100000,
  };
  navigator.geolocation.watchPosition(successed,failed,options);//位置情報の取得
}


function gotoNext(){
  //ここでapi2を叩く
  window.location.href = "gacha.html";
}

function removeInfo() {
  var element = document.getElementById("info");
  if (element) {
    element.parentNode.parentNode.parentNode.parentNode.remove();
  }
}

function viewMyTeam(name) {
  var colors = { red: "#F16868",
                 blue: "#5B73EE",
                 green: "#51E56F" };
  console.log(name);
  if (name == "red") {
    console.log("dddddddddd");
    $("#team-name").html("江戸チーム");
    $("#team-name").css("color", colors["red"]);
  } else if (name == "blue") {
    $("#team-name").css("color", colors["blue"]);
    $("#team-name").html("戦国チーム");
  } else if (name == "green") {
    $("#team-name").css("color", colors["green"]);
    $("#team-name").HTML("平安チーム");
  }
}

/**
 * URL解析して、クエリ文字列を返す
 * @returns {Array} クエリ文字列
 */
function getUrlVars()
{
    var vars = [], max = 0, hash = "", array = "";
    var url = window.location.search;

        //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
    hash  = url.slice(1).split('&');
    max = hash.length;
    for (var i = 0; i < max; i++) {
        array = hash[i].split('=');    //keyと値に分割。
        vars[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
    }

    return vars;
}
