//check the validation of input data
function getTai(oid){
  var inputRe = /[A-HJ-Z]\d{4} ?[A-H][A-E]\d{2,4}/i;
  var taiSource = document.getElementById('xySource_'+oid).value;
  taiSource = taiSource.toUpperCase().replace(' ', '');
  var digiChk = taiSource.length;
  var formatChk = taiSource.search(inputRe);

  if (digiChk == 0) {
    return false;
  }
  else if ((digiChk != 9 && digiChk != 11) || formatChk ==- 1) {
    alert ("座標格式錯誤，請重新檢查後再輸入一次!　");
    return false;
  }
  
  var Chr0 = getFirstChr(oid);
  
  if ( Chr0 == "Z" || Chr0 =="S"){
    alert ("很抱歉，本轉換式目前不適用於金門及馬祖地區!　");
    return false;
  }
  
  return taiSource;
}

//Taipower coordinates system convert
function convertTai(oid){

  var taiGrid = getTai(oid);
  
  if (taiGrid === false) return;
  
  //set the xy original coordinates by divisions
  var divStr = "A B C D E F G H J K L M N O P Q R T U V W X Y Z";
  divStr = divStr.replace(/ /g,"");
  
  var idxOne = divStr.indexOf(taiGrid.charAt(0));
  var idx3x = divStr.indexOf(taiGrid.charAt(5));
  var idx3y = divStr.indexOf(taiGrid.charAt(6));
  
  var xArray = "170000 250000 330000 170000 250000 330000 170000 250000 90000 170000 250000 90000 170000 250000 90000 170000 250000 170000 250000 170000 250000 275000 275000 552700";
  var yArray = "2750000 2750000 2750000 2700000 2700000 2700000 2650000 2650000 2600000 2600000 2600000 2550000 2550000 2550000 2500000 2500000 2500000 2450000 2450000 2400000 2400000 2614000 2564000 2675800";
  var zArray = "0 1 2 3 4 5 6 7";
  
  xArray = xArray.split(" ");
  yArray = yArray.split(" ");
  zArray = zArray.split(" ");
  
  //convert the Taipower grid to t6767/tm2
  var n1x = eval(xArray[idxOne]);
  var n1y = eval(yArray[idxOne]);
  
  var n2x = eval(taiGrid.substr(1,2))*800;
  var n2y = eval(taiGrid.substr(3,2))*500;
  
  var n3x = eval(zArray[idx3x])*100;
  var n3y = eval(zArray[idx3y])*100;
  
  var chr9 = taiGrid.charAt(9);
  chr9 = chr9.replace("","0");
  var chr10 = taiGrid.charAt(10);
  chr10 = chr10.replace("","0");
  
  var n5x = eval(taiGrid.charAt(7))*10 + eval(chr9);
  var n5y = eval(taiGrid.charAt(8))*10 + eval(chr10);
  
  var xT67TM2 = n1x + n2x + n3x + n5x;
  var yT67TM2 = n1y + n2y + n3y + n5y;
  
  var xyT67TM2 = xT67TM2 + ", " + yT67TM2;
  
  return xyT67TM2;

}

//Visit PROJ.4/Proj4js at http://www.proj4js.org/ for source code
//Proj4js.defs["EPSG:3822"] = "+title=經緯度：TWD97/WGS84 +proj=longlat +ellps=GRS80 +units=度 +no_defs"; //TWD97/WGS84 DMS
Proj4js.defs["EPSG:3821"] = "+title=EPSG:3821 +proj=longlat  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +ellps=aust_SA +units=度 +no_defs"; //TWD67 DMS
Proj4js.defs["EPSG:3826"] = "+title=EPSG:3826 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; // TWD97 TM2 Taiwan
Proj4js.defs["EPSG:3825"] = "+title=EPSG:3825 +proj=tmerc  +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; // TWD97 TM2 Penghu
Proj4js.defs["EPSG:3828"] = "+title=EPSG:3828 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=121 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";// TWD67 TM2 Taiwan
Proj4js.defs["EPSG:3827"] = "+title=EPSG:3827 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=119 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺"; // TWD67 TM2 Penghu
//Proj4js.defs["EPSG:4326"] = "+title=經緯度：WGS84 long/lat +proj=longlat +ellps=WGS84 +datum=WGS84 +units=度 +no_defs ";

//Google Mercator projection
//Proj4js.defs["EPSG:900913"]= "+title=EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=公尺 +nadgrids=@null +no_defs"; //Google Mercator

var projHash = {};

function initProj4js() {
  //var crsSource = document.getElementById('crsSource');
  //var crsDest = document.getElementById('crsDest');
  var optIndex = 0;
  for (var def in Proj4js.defs) {
	//create a Proj for each definition
    projHash[def] = new Proj4js.Proj(def);   
  	//revise the label contents
    //var label = (projHash[def].title ? projHash[def].title : '');
	  //var opt = new Option(label, def);
    //crsSource.options[optIndex]= opt;	
	  //var opt = new Option(label, def);
    //crsDest.options[optIndex]= opt;
    ++optIndex;
  }  // for
  //updateCrs('Source');
}


//get the first character of Input
function getFirstChr(oid) {
  var taiGrid = document.getElementById('xySource_' + oid).value;
  taiGrid = taiGrid.toUpperCase();
  return taiGrid.charAt(0);
}

function transform(oid) {

  var tmpString = document.forms['tipForm_'+oid].dummy.value.toUpperCase();
  var sysRegex = /TWD67|T67|\(67\)|TWD97|T97|\(97\)/g;
  var phRegex = /澎湖/;
  var sysMatch = sysRegex.exec(tmpString);
  var phMatch = tmpString.match(phRegex);
  var isTPW = false;

  //decide the crsSource
  //var crsSource = document.getElementById('crsSource');
  var sourceEPSG = null;

  if (sysMatch == null) { // 電力座標
    isTPW = true;
    if ( getFirstChr(oid) == 'X' || getFirstChr(oid) == 'Y' ) {
    	sourceEPSG = 'EPSG:3827'; // T67 TM2 Penghu
    }
    else {
    	sourceEPSG = 'EPSG:3828'; // T67 TM2 Taiwan
    }
  }
  else if ((sysMatch[sysMatch.length-1] == 'TWD67')||(sysMatch[sysMatch.length-1] == 'T67')||(sysMatch[sysMatch.length-1] == '(67)')) {
    if (phMatch != null) {
    	sourceEPSG = 'EPSG:3827'; // T67 TM2 Penghu
    }
    else {
    	sourceEPSG = 'EPSG:3828'; // T67 TM2 Taiwan
    }
  }
  else if ((sysMatch[sysMatch.length-1] == 'TWD97')||(sysMatch[sysMatch.length-1] == 'T97')||(sysMatch[sysMatch.length-1] == '(97)')) {
    if (phMatch != null) {
    	sourceEPSG = 'EPSG:3825'; // T97 TM2 Penghu
    }
    else {
    	sourceEPSG = 'EPSG:3826'; // T97 TM2 Taiwan
    }
  }
  
  var projSource = null;
  if (sourceEPSG) {
    projSource = projHash[sourceEPSG];
  }
  else {
    alert("請選擇欲轉換之座標參考系統!　");
    return;
  }
  
  //decide the crsDest
  //var crsDest = document.getElementById('crsDest');
  var destEPSG = 'WGS84';  
  var projDest = null;
  projDest = projHash[destEPSG];

  //var pointInput = document.getElementById('xySource');
  if (isTPW) { // 電力座標轉換
    var pointInput = convertTai(oid);
  }
  else {
    var tm2Coord = "";
    tm2Coord = document.getElementById('xySource_'+oid).value;
    if (tm2Coord != "") {
      var pointInput = tm2Coord;
    }
    else {
      var tm2Regex = /[0-9]{6}([^0-9]+)[0-9]{7}/g;
      var tm2Match = tm2Regex.exec(tmpString);
      var pointInput = tm2Match[0].replace(tm2Match[1], ', ');
      document.getElementById('xySource_'+oid).value = pointInput;
    }
  }
    
  if (pointInput) {
    var pointSource = new Proj4js.Point(pointInput);
    var pointDest = Proj4js.transform(projSource, projDest, pointSource);
	
  	//check the Dest coordinates
    if ( isNaN(pointDest.x) || isNaN(pointDest.y)) {
      alert("請檢查並重新輸入電力座標!　");
      return;
    }
 
    // convert destPoint to 6-digi/longlat or 0-digi/tm2 decimal
    pointDest.x = (pointDest.x).toFixed(6);
    pointDest.y = (pointDest.y).toFixed(6);
    // convert numeric degrees to deg/min/sec

    document.forms['tipForm_'+oid].x.value = pointDest.x;
    document.forms['tipForm_'+oid].y.value = pointDest.y;
  }
  else {
    //alert("請檢查並重新輸入電力座標!　");
    return;
  }
}

initProj4js();