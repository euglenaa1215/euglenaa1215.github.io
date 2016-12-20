window.onload = function(){
  const app = document.getElementById('app');
  var audio = new Audio("gacha_result.mp3");
  audio.play();
  
  const myRand = () =>{
    let r = 50;
    while(40 < r && r < 60){
      r = Math.random() * 100;
    }
    return r;
  }

  for(let i=0;i<50;i++){
    const delay = Math.random() + 's';
    const el = document.createElement('span');
    el.innerHTML = '*';
    el.className = "glitter-star";
    el.style.top = myRand() + 'vh';
    el.style.left = myRand() + 'vw';
    el.style.animationDelay = delay;
    el.style.msAnimationDelay = delay;
    el.style.webkitAnimationDelay = delay;
    el.style.monAnimationDelay = delay;
    app.appendChild(el);
    // console.log(el);
  }

  discount();
  function discount() {
    var rand = Math.floor( Math.random() * 11 ) + 1;
    $('#ten').html(rand);
  }

  function viewImage(img_url) {
    $('#img').attr("src", img_url);
  }

  function viewStoreName(name) {
    $('#storeName').html(name);
  }

  getElement();
  function getElement() {
   get = $.ajax({
      type: 'GET',
      url: 'http://sparql.odp.jig.jp/api/v1/sparql?output=json&force-accept=text%2Fplain&query=select+%3Fid+%3Fimg+%3Fname+%3Flocate+%7B%0D%0A++%3Fs+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type%3E+%3Chttp%3A%2F%2Fpurl.org%2Fjrrk%23CivicPOI%3E%3B%0D%0A+++%3Chttp%3A%2F%2Fpurl.org%2Fjrrk%23address%3E+%3Faddress.%0D%0A++filter%28regex%28%3Faddress%2C+%22%E5%BA%83%E5%B3%B6%E7%9C%8C%E5%B0%BE%E9%81%93%E5%B8%82%22%29%29%0D%0A++%3Fs+%3Chttp%3A%2F%2Fodp.jig.jp%2Fodp%2F1.0%23genre%3E+%3Chttp%3A%2F%2Fodp.jig.jp%2Fres%2Fcategory%2F%25E9%25A3%259F%25E3%2581%25B9%25E3%2582%258B%3E.%0D%0A++%3Fs+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fidentifier%3E+%3Fid.%0D%0A++%3Fs+%3Fp+%3Fid.%0D%0A++%3Fs+%3Chttp%3A%2F%2Fschema.org%2Fimage%3E+%3Fimg.%0D%0A++%3Fs+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label%3E+%3Fname.%0D%0A++%3Fs+%3Chttp%3A%2F%2Fimi.ipa.go.jp%2Fns%2Fcore%2Frdf%23%E5%9C%B0%E7%90%86%E5%BA%A7%E6%A8%99%3E+%3Flocate.%0D%0A++filter%28lang%28%3Fname%29+%3D+%22ja%22%29%0D%0A%7Dorder+by+rand%28%29+limit+100'
    });

    get.done(function(result) {
        var json = JSON.parse(result);
        var locate;
        $.each(json.results.bindings, function(i, val) {
          // console.log(val.id.value);

          // console.log(val.img.value);
          viewImage(val.img.value);
          // val.locate.value = getCoord(val.locate.value);
          // console.log(val.locate.value);
          // console.log(val.name.value); 
          viewStoreName(val.name.value);
        });
      }).fail(function(result) {
        console.log("Failured");
      }
    );
  }

  function split(str, regexp) {
   return str.split(regexp);
  }

  function getCoord(locate) {
    var splitted = locate.split(/\//);
    splitted.splice(0, 5);
    splitted.pop();
  return splitted;
}
}
