const myScript = document.getElementById("widgetScript");
const queryString = myScript.src.replace(/^[^\?]+\??/,'');
const params = parseQuery( queryString );

function parseQuery ( query ) {
  let Params = new Object ();
  if ( ! query ) return Params;
  let Pairs = query.split(/[;&]/);
  for ( let i = 0; i < Pairs.length; i++ ) {
    let KeyVal = Pairs[i].split('=');
    if ( ! KeyVal || KeyVal.length != 2 ) continue;
    let key = unescape( KeyVal[0] );
    let val = unescape( KeyVal[1] );
    val = val.replace(/\+/g, ' ');
    Params[key] = val;
  }
  return Params;
}
// console.log(params);
const procedureId = params.procedureId;

let windowWidth = Math.round(window.innerWidth * 0.95);
let windowHeight = Math.round(window.innerHeight * 0.95);

let bookButton = document.createElement('div');
bookButton.className = "book-button";
bookButton.id = "bookButton";
bookButton.style = "position:absolute; z-index: 777; bottom:2vh; right:2vh; cursor: pointer; background-color: #AA4037; color: #FCFBFD; padding: 12px 24px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; font-size: 1.5vh;";
bookButton.innerHTML = "book a procedure";

let fade = document.createElement('div');
fade.className = "fade";
fade.id = "fade";
fade.style = "display: none";
fade.innerHTML = ""

let bookFrame = document.createElement('div');
bookFrame.className = "book-frame";
bookFrame.id = "bookFrame";
bookFrame.style = "display: none";
//dev
bookFrame.innerHTML = `
  <div style=\" display:flex; align-items: center; justify-content: end; margin:1vh; \">
    <div id=\"closeFrame\" style=\" width: 2vh; cursor:pointer; font-size: 2vh; color: #381D11; \">&#10006;</div>
  </div>
  <div style=\" display: block; width:100vw; height:92%; overflow: hidden; \">
    <iframe src="http://localhost:3000/book?procedureId=${procedureId}&windowWidth=${windowWidth}&windowHeight=${windowHeight}"
          width="100%" height="100%" frameborder="0" class="scroll-none">
    </iframe>
  </div>
`;
// production
// bookFrame.innerHTML = `
  // <div style=\" display:flex; align-items: center; justify-content: end; margin:1vh; \">
  //   <div id=\"closeFrame\" style=\" width: 2vh; cursor:pointer; font-size: 2vh; color: #381D11; \">&#10006;</div>
  // </div>
  // <div style=\" display: block; width:100vw; height:92%; overflow: hidden; \">
  //   <iframe src="http://health.sy-way.com/book?procedureId=${procedureId}&windowWidth=${windowWidth}&windowHeight=${windowHeight}"
  //         width="100%" height="100%" frameborder="0" class="scroll-none">
  //   </iframe>
  // </div>
// `;

window.onload = function(){ 
  document.getElementById("bookButton").onclick = function () {
    document.getElementById("fade").style = "display: block; position: absolute; z-index:555; width: 100vw; height:100vh; margin:0; padding:0; top: 0; left: 0; background-color: rgba(0, 0, 0, 0.5);";
    document.getElementById("bookFrame").style = `
      position: absolute; 
      z-index:999; 
      display: block; 
      padding: 0;
      width: ${windowWidth}px; 
      height: ${windowHeight - 30}px;
      // max-width: 480px;
      top: 30px; 
      left: 50%;
      transform: translate(-50%, 0); 
      overflow: hidden;
      box-shadow: 0 3px 20px 1px rgba(0, 0, 0, .3); 
      background: #FCFBFD url(https://health.sy-way.com/static/elegance_bg.jpg) center center no-repeat;
      background-size: cover;
    `;
  };

  document.getElementById("closeFrame").onclick = function () {
    document.getElementById("fade").style = "display: none;";
    document.getElementById("bookFrame").style = "display: none;";
  };
};

document.body.append(bookButton);
document.body.append(fade);
document.body.append(bookFrame);
console.log('Health.AI widget added..');
