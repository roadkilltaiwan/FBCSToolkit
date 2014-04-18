/*
  This program is designed for data managers to create/update Facebook group data on chrome browser. 
  Copyright (C) 2013  Jason Guan-Shuo Mai

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var app_domain = "roadkill.tw";
var app_group = 238918712815615;

var actOpts = "<option value=''>無</option>"; // 這行是重要的開頭, 不要更動 
actOpts += "<option value='2013夏季蛇類大調查'>2013夏季蛇類大調查</option>";
actOpts += "<option value='2013端午節蛇類調查'>2013端午節蛇類調查</option>";
actOpts += "<option value='2013日月潭大泡茶'>2013日月潭大泡茶</option>";
// 直接刪除單行或在行前加上兩個斜線以移除單行, 例如此行與以下二行
// 下面這行是參考範例與說明
// actOpts += "<option value='會存進資料庫的內容'>會顯示在小工具選單裡的內容</option>";

var userInput = "";
var content = "";
var commonNames = "";
var selectedElement = "";
var thisElement = "";
var fromChild = false;
var page = "";
var empty = true;
var elmnt = null;
var rcol = null;
var temp = "";
var length = "";
var pos = 0;
var final_pos = 0;
var pre = "";
var post = "";


var superX;
var superY;

var current_oid = 0;

$f = jQuery.noConflict();
var cepath = chrome.i18n.getMessage("@@extension_id");

function unsetOid() {
  current_oid = -1;
}

function OpenInNewTab(url) {
  var win=window.open(url, '_blank');
  win.focus();
}

var oPostURL = '';
function getFBPostId (oid) {
}


var bound = new Array();
function triggerTipForm (oid, tf_tmp) {
  var tf = tf_tmp;
  if (bound.indexOf(oid)!=-1) {
    return;
  }
  else {
    bound.push(oid);
  }

  $f(document).delegate("img.quick_clean_" + oid, "click", function() {
    //$f(this).parent().next()..value = '';
    $f(this).parent().next().children().attr('value', '');
  });

  $f(document).delegate("#oPost_" + oid, "click", function() {
    OpenInNewTab(oPostURL);
  });

  $f(document).delegate("div#forceXY_" + oid, "click", function() {
    //$f(this).parent().next()..value = '';
    //$f(this).parent().next().children().attr('value', '');
    var ffss = 5566;
    document.forms['tipForm_'+oid].x.value = superX;
    document.forms['tipForm_'+oid].y.value = superY;
  });

  $f(document).delegate("a#mapLookup_" + oid, "click", function() {
    var mapX = document.forms['tipForm_'+oid].x.value;
    var mapY = document.forms['tipForm_'+oid].y.value;
    var gMapLink = "https://maps.google.com.tw/maps?q="+mapY+","+mapX;
    if ((mapX=='')&&(mapY=='')) {
      alert('沒輸入點位學人看什麼地圖');
      OpenInNewTab(gMapLink);
    }
    else {
      OpenInNewTab(gMapLink);
    }
  });

  $f(document).delegate("div#transformXY_" + oid, "click", function() {
    //$f(this).parent().next()..value = '';
    //$f(this).parent().next().children().attr('value', '');
    var tpwCoord = "";
    tpwCoord = document.getElementById('xySource_'+oid).value;
    if (tpwCoord == '') {
      var tpwTmp = document.forms['tipForm_'+oid].dummy.value.match(/[A-HJ-Z]\d{4}[A-H][A-E]\d{2,4}/i);
      if (tpwTmp != null) {
        document.getElementById('xySource_'+oid).value = tpwTmp[0];
      }
    }

//    var ffss = 5566;
    transform(oid);
    //document.forms['tipForm_'+oid].x.value = superX;
    //document.forms['tipForm_'+oid].y.value = superY;
  });

  $f(document).delegate("#tipFormSubmit_" + oid, "click", function() {
    //var target = 'http://lod.tw/cs/api.updateBigTable.php';
    var target = 'http://'+app_domain+'/cs/api/api.updateBigTable.php';
    var formalizedDateTime = new Date(document.forms['tipForm_'+oid].ctime_int.value * 1000); // to milliseconds
    var formalizedDateTimeString = formalizedDateTime.toISOString().split('T')[0] + " " + formalizedDateTime.toISOString().split('T')[1].split('.')[0];

    var sdata = {
      photo_id:oid,
      link:"http://www.facebook.com/photo.php?fbid="+oid,
      picture:document.forms['tipForm_'+oid].picture.value,
      created_time:formalizedDateTimeString,
      shot_date:(document.forms['tipForm_'+oid].stime.value == '')?'0000-00-00':document.forms['tipForm_'+oid].stime.value,
      person_id:document.forms['tipForm_'+oid].authorId.value,
      name:document.forms['tipForm_'+oid].authorName.value,
      cname1:document.forms['tipForm_'+oid].cname1.value,
      cname2:document.forms['tipForm_'+oid].cname2.value,
      cname3:document.forms['tipForm_'+oid].cname3.value,
      sname1:document.forms['tipForm_'+oid].sname1.value,
      sname2:document.forms['tipForm_'+oid].sname2.value,
      sname3:document.forms['tipForm_'+oid].sname3.value,
      tagged:document.forms['tipForm_'+oid].tagged.value,
      inWhiteList:document.forms['tipForm_'+oid].tiw.checked,
      rk:document.forms['tipForm_'+oid].rk.checked,
      needMore:document.forms['tipForm_'+oid].needMore.checked,      
      authState:document.forms['tipForm_'+oid].auth.value,
      byWhom:document.forms['tipForm_'+oid].by.value,
      spid:document.forms['tipForm_'+oid].spid.value,
      coid:document.forms['tipForm_'+oid].coid.value,
      x:document.forms['tipForm_'+oid].x.value,
      y:document.forms['tipForm_'+oid].y.value,
      altitude:document.forms['tipForm_'+oid].altitude.value,
      p1:document.forms['tipForm_'+oid].p1.value,
      p2:document.forms['tipForm_'+oid].p2.value,
      p3:document.forms['tipForm_'+oid].p3.value,
      remark:document.forms['tipForm_'+oid].remark.value,
      hu:document.forms['tipForm_'+oid].humanUpdated.value,
      activity:document.forms['tipForm_'+oid].activity.value,
      archive:document.forms['tipForm_'+oid].toTaiRON.checked
    };
    $f.post(target, sdata, function (rdata, status, xhr) {
      // reset all tips
      current_oid = -1;
      if (rdata.state != false) {
        Tipped.hide($f(tf));
      }
      else {
        alert("新增/更改資料失敗!!\n"+rdata.SQL);
      }
      //var ffss = 5566;
    }, 'json');
  });
  $f(document).delegate("#tipFormClose_" + oid, "click", function() {
    current_oid = -1;
    Tipped.hide($f(tf));
  });
}

var postId;
var threadContent;
var xhr;
var message;
var tippedBody;

var exhr;
var placeXHR;
var formData = {
  init:true
};

function extractAndTip (message, tippedBody, meta, found) {

    var sid = "#places_hierarchy_" + meta.oid;
    if (($f(sid).html()==null)||($f(sid).html()=="")) {
      if ((placeXHR == undefined)||(placeXHR.state() != 'pending')) {
        placeXHR = $f.post(
          "http://"+app_domain+"/cs/api/api.getNames.php",
          {text:message, fastMode:0, withContext:'true'},
          function (data, textStatus, jqXHR) {
            var places = new Array();
            var v5566 = data;
            for (var i=0; i<data.annotation.surfaceForm_pn.length; i++) {
              for (var j=0; j<data.annotation.surfaceForm_pn[i].resource.length; j++) {
                var pr = data.annotation.surfaceForm_pn[i].resource[j];
                var place = pr['@county'] +"|" + pr['@town'] + "|" + pr['@label'];
                if (places.indexOf(place) == -1) {
                  places.push(place);
                }
              }
            }
            if (places.length > 0) {
              var placesHTML = "";
              places.sort();
              //placesHTML += "<select name='places'>";
              placesHTML += "<option value='-1'>無</option>";
              for (var k = 0; k < places.length; k++) {
                placesHTML += "<option value='"+places[k]+"'>"+places[k]+"</option>";
              }
              //placesHTML += "</select>";
              $f(sid).html(placesHTML);
            }
          },
          'json'
        );
      }
    }
  
  if ((meta.ctime != undefined)&&(meta.ctime != null)&&(meta.ctime != "")&&(meta.ctime != 0)) {
    var d = new Date(meta.ctime * 1000); // to milliseconds
    d = new Date((meta.ctime - (60 * d.getTimezoneOffset())) * 1000); // to milliseconds
    var dateString = d.toISOString().split('T')[0] + " " + d.toISOString().split('T')[1].split('.')[0];
  }
  else {
    dateString = "";
  }

  // geo data in database
  var x = ((meta.x == null)||(meta.x == undefined))?"":meta.x;
  var y = ((meta.y == null)||(meta.y == undefined))?"":meta.y;
  var p1 = ((meta.p1 == null)||(meta.p1 == undefined))?"":meta.p1;
  var p2 = ((meta.p2 == null)||(meta.p2 == undefined))?"":meta.p2;
  var p3 = ((meta.p3 == null)||(meta.p3 == undefined))?"":meta.p3;
  var remark = ((meta.remark == null)||(meta.remark == undefined))?"":meta.remark;

  if (meta.needMore == 0) {
    formData.needMore = "";
  }
  else if (meta.needMore == 1) {
    formData.needMore = "checked";
  }

  $f.post(
    //'http://lod.tw/cs/api.single_record.php',
    'http://'+app_domain+'/cs/api/api.single_record.php',
    {message:message, group:app_group, username:meta.pid},
    function (data, textStatus, jqXHR) {
    
      formData.oid = meta.oid;
      formData.pname = meta.pname;
      formData.pid = meta.pid;
      formData.ctime = dateString;
    
      if (data.tagged == true) {
        formData.tagged = 1;
      }
      else {
        formData.tagged = 0;
      }                   
      
      var nfx = (data.xy==null)?'':data.xy.x;
      superX = (nfx == undefined)?"":nfx;
      var nfy = (data.xy==null)?'':data.xy.y;
      superY = (nfy == undefined)?"":nfy;
      var nfauth = data.auth.authState;
      var nfby = (data.auth.byWhom==null)?'':data.auth.byWhom;
      
      var nfstime = data.date;
      var nfcname1 = (data.match[0]==undefined)?'':data.match[0].cn;
      var nfsname1 = (data.match[0]==undefined)?'':data.match[0].sn;
      var nfcname2 = (data.match[1]==undefined)?'':data.match[1].cn;
      var nfsname2 = (data.match[1]==undefined)?'':data.match[1].sn;
      var nfcname3 = (data.match[2]==undefined)?'':data.match[2].cn;
      var nfsname3 = (data.match[2]==undefined)?'':data.match[2].sn;
      var nfspid = ((data.extra==undefined)||(data.extra.SpecimenID==undefined))?'':data.extra.SpecimenID;
      var nfcoid = ((data.extra==undefined)||(data.extra.CollectionID==undefined))?'':data.extra.CollectionID;
      
      xcss = '';
      ycss = '';
      bycss = '';
      
      if (!found) {
        var title = '未';
        formData.stime = nfstime;
        formData.cname1 = nfcname1;
        formData.sname1 = nfsname1;
        formData.cname2 = nfcname2;
        formData.sname2 = nfsname2;
        formData.cname3 = nfcname3;
        formData.sname3 = nfsname3;
        formData.tiw = 0; // 目前的方法無法從client端得知
        formData.auth = nfauth;
        formData.by = nfby;
        formData.spid = nfspid;
        formData.coid = nfcoid;
        formData.lat = (nfy == undefined)?"":nfy;
        formData.lng = (nfx == undefined)?"":nfx;
        formData.alt = '';
        formData.rk = 'checked';
        formData.actOpts = actOpts;
        formData.toTaiRON = 'checked';
      }      
      else if (found) {

        if (meta.toTaiRON == 1) {
          formData.toTaiRON = 'checked';
        }
        else {
          formData.toTaiRON = '';
        }
        
      
        if (meta.actOpts != '') { 
          formData.actOpts = actOpts  + "<option value='"+meta.actOpts+"' selected>"+meta.actOpts+"</option>";
        }
        else {
          formData.actOpts = actOpts;
        }
      
        data = meta;
        var title = '已';
        var stimecss = "";
        formData.stime = (meta.stime==undefined)?'':meta.stime;
        if ((meta.stime != nfstime)&&(nfstime!='')&&(nfstime!=undefined)&&(nfstime!=null)) {
          if (meta.hu != 1) {
            formData.stime = nfstime;
            var stimecss = " style='background:pink;' ";
          }
        }

        formData.tiw = meta.tiw;        
        formData.cname1 = (meta.cname[0]==undefined)?'':meta.cname[0];
        var cname1css = "";
        if ((meta.cname[0] != nfcname1)&&(nfcname1!='')&&(nfcname1!=undefined)&&(nfcname1!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.cname1 = nfcname1;
            cname1css = " style='background:pink;' ";
          }
        }
        
        formData.sname1 = (meta.sname[0]==undefined)?'':meta.sname[0];
        var sname1css = "";
        if ((meta.sname[0] != nfsname1)&&(nfsname1!='')&&(nfsname1!=undefined)&&(nfsname1!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.sname1 = nfsname1;
            sname1css = " style='background:pink;' ";
          }
        }
        
        formData.cname2 = (meta.cname[1]==undefined)?'':meta.cname[1];
        var cname2css = "";
        if ((meta.cname[1] != nfcname2)&&(nfcname2!='')&&(nfcname2!=undefined)&&(nfcname2!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.cname2 = nfcname2;
            cname2css = " style='background:pink;' ";
          }
        }
        
        formData.sname2 = (meta.sname[1]==undefined)?'':meta.sname[1];
        var sname2css = "";
        if ((meta.sname[1] != nfsname2)&&(nfsname2!='')&&(nfsname2!=undefined)&&(nfsname2!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.sname2 = nfsname2;
            sname2css = " style='background:pink;' ";
          }
        }
        
        formData.cname3 = (meta.cname[2]==undefined)?'':meta.cname[2];
        var cname3css = "";
        if ((meta.cname[2] != nfcname3)&&(nfcname3!='')&&(nfcname3!=undefined)&&(nfcname3!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.cname3 = nfcname3;
            cname3css = " style='background:pink;' ";
          }
        }
        
        formData.sname3 = (meta.sname[2]==undefined)?'':meta.sname[2];
        var sname3css = "";
        if ((meta.sname[2] != nfsname3)&&(nfsname3!='')&&(nfsname3!=undefined)&&(nfsname3!=null)) {
          if ((formData.tagged == 1)&&(meta.needMore == 1)&&(formData.tiw == 0)) {
            formData.sname3 = nfsname3;
            sname3css = " style='background:pink;' ";
          }
        }
        
        formData.auth = meta.auth;
        if ((meta.auth == null)||(meta.auth == undefined)||(meta.auth == 'undefined')||(meta.auth == '')||(meta.auth == '未授權')||(meta.auth == '未受權')) {
          formData.by = (meta.by==null||meta.by==undefined||meta.by=='undefined'||meta.by=='')?('未授權'+meta.pname):meta.by;
        }
        else {
          formData.by = (meta.by==null||meta.by==undefined||meta.by=='undefined'||meta.by=='')?(meta.pname):meta.by;
        }
        
        formData.spid = (meta.spid==null||meta.spid==undefined)?'':meta.spid;
        var spidcss = "";
        if ((meta.spid == null)||(meta.spid == '')||(meta.spid == undefined)) {
          if (meta.hu != 1) {
            formData.spid = nfspid;
            var spidcss = " style='background:pink;' ";
          }
        }

        formData.coid = (meta.coid==null||meta.coid==undefined)?'':meta.coid;
        var coidcss = "";
        if ((meta.coid == null)||(meta.coid == '')||(meta.coid == undefined)) {
          if (meta.hu != 1) {        
            formData.coid = nfcoid;
            var coidcss = " style='background:pink;' ";
          }
        }

        var authcss = "";
        if ((meta.auth != nfauth)&&(meta.hu != 1)) {
          formData.auth = nfauth;
          var authcss = " style='background:pink;' ";
        }

        var bycss = "";
        if (meta.by != nfby) {
          if ((meta.by == '')||(meta.by=='null')||(meta.by==null)) {
            if (meta.hu != 1) {
              formData.by = (nfby==null)?'':nfby;
              var bycss = " style='background:pink;' ";
            }
          }
        }

        formData.lng = parseFloat(x);
        if (isNaN(formData.lng)) {
          formData.lng = '';
        } 
        var xcss = "";
        if ((parseFloat(nfx) != parseFloat(x))&&(meta.hu != 1)) {
          formData.lng = ((nfx == undefined)||(nfx == ''))?x:nfx;
          var xcss = " style='background:pink;' ";
        }

        formData.lat = parseFloat(y);
        if (isNaN(formData.lat)) {
          formData.lat = '';
        } 
        var ycss = "";
        if ((parseFloat(nfy) != parseFloat(y))&&(meta.hu != 1)) {
          formData.lat = ((nfy == undefined)||(nfy == ''))?y:nfy;
          var ycss = " style='background:pink;' ";
        }

        formData.alt = meta.alt;
        if (meta.rk == 1) {
          formData.rk = 'checked';
        }
        else {
          if (meta.hu != 1) {
            formData.rk = 'checked';
          }
          else {
            formData.rk = '';
          }
        }
      }
      
      // 20131105 依討論結果修正: 只要有tag#*的  fbcs就自動勾選已鑑定 由資料輸入者確認正確性 並勾選是否路死
      if (formData.tagged == 1) {
        formData.tiw = 'checked';
      }
      else {
        formData.tiw = '';
      }
      
      //var tipContent = "<form><table><tr><td>"+oid+"</td></tr><tr><td>"+authorName+"</td></tr><tr><td>"+authorId+"</td></tr><tr><td>"+data['match']+"</td></tr><tr><td>"+oid+"</td></tr><tr><td>"+oid+"</td></tr></table></form>";
      if (($f("#tipForm_"+meta.oid).html()==null)||(meta.oid != current_oid)) {
        var tipContent = "<form id='tipForm_"+formData.oid+"'><table>";
        tipContent += "<tr><td><h2 style='color:white;'>資料庫中"+title+"標記照片ID</h2></td><td><input name='oid' value='"+formData.oid+"'></td><td>特殊活動</td><td><select style='overflow-x:visible; width:auto;' name='activity'>"+formData.actOpts+"</select></td></tr>";
        tipContent += "<tr><td>上傳日期</td><td><input type='text' name='ctime' value='"+formData.ctime+"'></td>";
        tipContent += "<td>拍攝日期</td><td><input type='date' name='stime' value='"+formData.stime+"'></td></tr>";
        tipContent += "<tr><td>上傳者ID</td><td><input name='authorId' value='"+formData.pid+"'></td>";
        tipContent += "<td>上傳者代號</td><td><input name='authorName' value='"+formData.pname+"'></td></tr>";
        tipContent += "<tr><td>物種一<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname1css+" name='cname1' value='"+formData.cname1+"'></td><td>學名1<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname1css+" name='sname1' value='"+formData.sname1+"'></td></tr>";
        tipContent += "<tr><td>物種二<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname2css+" name='cname2' value='"+formData.cname2+"'></td><td>學名2<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname2css+" name='sname2' value='"+formData.sname2+"'></td></tr>";
        tipContent += "<tr><td>物種三<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname3css+" name='cname3' value='"+formData.cname3+"'></td><td>學名3<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname3css+" name='sname3' value='"+formData.sname3+"'></td></tr>";
        tipContent += "<tr><td>已鑑定</td><td><input type='checkbox' name='tiw' "+formData.tiw+"></td><td>是否路死</td><td><input type='checkbox' name='rk' "+formData.rk+"/></td></tr>";
        tipContent += "<tr><td>是否需要後續人工補充更新</td><td><input name='needMore' type='checkbox' "+formData.needMore+" /></td><td>是否需要進TaiRON</td><td><input name='toTaiRON' type='checkbox' "+formData.toTaiRON+" /></td></tr>";
        tipContent += "<tr><td>授權方式</td><td><input "+authcss+" name='auth' value='"+(((formData.auth=="")&&(meta.hu != 1))?"未授權":formData.auth)+"'><td>姓名標示</td></td><td><input "+bycss+" name='by' value='"+((formData.by=="")?("未授權"+formData.pname):formData.by)+"'></td></tr>";
        tipContent += "<tr><td>標本號</td><td><input "+spidcss+" name='spid' value='"+((formData.spid==undefined)?"":formData.spid)+"'/></td><td>採集編號</td><td><input "+coidcss+" name='coid' value='"+((formData.coid==undefined)?"":formData.coid)+"'/></td></tr>";
        tipContent += "<tr><td>x</td><td><input "+xcss+" name='x' value='"+formData.lng.toString().replace(/'/, '&apos;')+"'/></td><td>y</td><td><input "+ycss+" name='y' value='"+formData.lat.toString().replace(/'/, '&apos;')+"'/></td></tr>";
        tipContent += "<tr><td>海拔高度</td><td><input name='altitude'/></td><td></td><td><div id='forceXY_"+formData.oid+"'><u>補上XY</u></div><a id='mapLookup_"+formData.oid+"'>我要看地圖</a><div id='transformXY_"+formData.oid+"'><u>轉換管它什麼座標</u></div><a id='oPost_"+formData.oid+"'>原po呢????(敲碗)</a></td></tr>";
        tipContent += "<tr><td>地名階層</td><td colspan='3'><span id='places_hierarchy_wrap'><select style='overflow-x:visible; width:auto;' id='places_hierarchy_"+meta.oid+"'></select></span></td></tr>";
        tipContent += "<tr><td>地點縣市</td><td><input id='p1_"+meta.oid+"' name='p1' value='"+p1+"'/></td><td>地點鄉鎮</td><td><input id='p2_"+meta.oid+"' name='p2' value='"+p2+"'/></td></tr>";
        tipContent += "<tr><td>地點其他</td><td><input id='p3_"+meta.oid+"' name='p3' value='"+p3.replace(/'/, '&apos;')+"'/></td><td>其它座標</td><td><input id='xySource_"+formData.oid+"' name='xySource'/></td></tr>";
        tipContent += "<tr><td>備註</td><td colspan='3'><input style='width:97%;' name='remark' value='"+remark.replace(/</, '&lt;').replace(/>/, '&gt;')+"'/></td></tr>";
        tipContent += "<tr><td colspan='4'><textarea name='dummy' style=\"width:97%;height:200px\" readonly>*****此區訊息僅供確認用, 不允許修改亦不會被傳送*****\n"+message+"</textarea></td></tr>";
        tipContent += "<tr><td/><td style='text-align:center;'><div id='tipFormSubmit_"+meta.oid+"'><b><u>送出</u></b></div></td><td style='text-align:center;'><div id='tipFormClose_"+meta.oid+"'><b><u>關閉不送</u></b></div></td><td/></tr>";
        tipContent += "</table>";
        tipContent += "<input type='hidden' name='tagged' value='"+formData.tagged+"' />";
        tipContent += "<input type='hidden' name='picture' value='"+meta.picture+"' />";
        tipContent += "<input name='humanUpdated' type='hidden' value='true' />";
        tipContent += "<input name='ctime_int' type='hidden' value='"+meta.ctime+"' />";
        // tipContent += "<input name='tagged' type='hidden' value='false' />";
        tipContent += "</form>";
        //Tipped.create($f(tippedBody), tipContent, {target:'mouse', fixed:true, closeButton: true, hideOn:false, showOn:false, closeButton:true});
        $f("div#tip_"+meta.oid).html(tipContent);
        $f("#places_hierarchy_"+meta.oid).change(
          function () {
            var oid = this.id.split('_').pop();
            var hps = this.options[this.selectedIndex].value.split("|");
            if (this.options[this.selectedIndex].value=="無") {
              $f('#p1_'+oid).attr('value', "");
              $f('#p2_'+oid).attr('value', "");
              $f('#p3_'+oid).attr('value', "");
            }
            else {
              $f('#p1_'+oid).attr('value', hps[0]);
              $f('#p2_'+oid).attr('value', hps[1]);
              var tmp_p3 = $f('#p3_'+oid).attr('value');
              if ((tmp_p3 == '')||(tmp_p3 == undefined)||(tmp_p3 == null)||(tmp_p3 == 'undefined')) {
                $f('#p3_'+oid).attr('value', hps[2]);
              }
            }              
          }
        );
      }
      Tipped.refresh($f(tippedBody), {target:'rigthtop', tooltip:'lefttop'});
      triggerTipForm(meta.oid, tippedBody);
      current_oid = meta.oid;      
      
       
    },
    'json'
  );

        //Tipped.show($f(tippedBody));
}

var supplMessage = '';
// 用縮圖搞der
$f(document).delegate("i.uiMediaThumbImg, div.uiScaledImageContainer, div.photoRedesignLink, div.photoRedesign, a.uiMediaThumb, div.fbMainStreamAttachment, div.uiMediaThumb, img.img, div a", "hover", function(event) {
  if ((this.className != undefined)&&(this.className.indexOf('fbPhotoImage') != -1)) {
    return;
  }
  event.stopPropagation();
  var isCtrlPressed = event.ctrlKey;
  if (!isCtrlPressed) {
    return;
  }
  supplMessage = '';
  tippedBody = this;
  if (event.type=='mouseenter') {

    if (false) {
      var tmpPost = this.parentNode;
      while ((tmpPost != null)&&(tmpPost.attributes['role'] == undefined)) {
        tmpPost = tmpPost.parentNode;
      }
      if ((tmpPost != null)&&(tmpPost.attributes['role'] != undefined)) {
        if (tmpPost.attributes['role'].value == 'article') {
          // $f(data).find("span.fbPhotosPhotoCaption").html().replace(/<abbr[^<]+<\/abbr>/ig,"");
          supplMessage = removePartialTag($f(tmpPost).html()).replace(/<abbr[^<]+<\/abbr>/ig,"").replace(/(<[^>]+)>/ig,"");
          // var gg = 5566;
        }
        else if (tmpPost.attributes['role'].value == 'main') {
          supplMessage = removePartialTag($f(tmpPost).html()).replace(/<abbr[^<]+<\/abbr>/ig,"").replace(/(<[^>]+)>/ig,"");
        }
      }
    }
    else if ((this.className.indexOf("uiMediaThumb") != -1)||(this.className.indexOf("uiScaledImageContainer") != -1)||(this.className.indexOf("photoRedesignLink") != -1)||(this.className.indexOf("photoRedesign") != -1)||(this.className.indexOf("uiMediaThumbImg") != -1)) {
      var tmpPost = this.parentNode;
      while ((tmpPost != null)&&((tmpPost.className == undefined)||(tmpPost.className.indexOf('mainWrapper')==-1))) {
        tmpPost = tmpPost.parentNode;
      }
      if (tmpPost == null) {
        tmpPost = this.parentNode;
        while ((tmpPost.className != null)&&((tmpPost.className == undefined)||(tmpPost.className.indexOf('fbTimelinePhotoAlbum')==-1))) {
          tmpPost = tmpPost.parentNode;
        }
      }
      if (tmpPost != null) {
        if ($f(tmpPost).html() != null) {
          supplMessage = removePartialTag($f(tmpPost).html()).replace(/<abbr[^<]+<\/abbr>/ig,"").replace(/(<[^>]+)>/ig,"");
        }
      }
    }
    else if ((this.className.indexOf("img") != -1)||(this.tagName == 'A')) {
      tmpPost = this.parentNode;
      while ((tmpPost != null)&&((tmpPost.className == undefined)||(tmpPost.className.indexOf('userContentWrapper')==-1))) {
        tmpPost = tmpPost.parentNode;
      }
      if (tmpPost != null) {
        if ($f(tmpPost).html() != null) {
          supplMessage = removePartialTag($f(tmpPost).html()).replace(/<abbr[^<]+<\/abbr>/ig,"").replace(/(<[^>]+)>/ig,"");
        }
      }
    }

    //var target = this.parentElement.attributes['ajaxify'].value;
    if (this.attributes['ajaxify'] == undefined) {
      if (this.parentNode.attributes['ajaxify'] == undefined) {
        if (this.parentNode.parentNode.attributes['ajaxify'] == undefined) {
          if ($f(this).find('a').attr('ajaxify') != undefined) {
            target = $f(this).find('a').attr('ajaxify');
          }
          else {
            alert("FB更動顯示結構了, 請聯絡程式設計師修改程式!!");
            return;
          }
        }
        else {
          target = this.parentNode.parentNode.attributes['ajaxify'].value;
        }
      }
      else {
        target = this.parentNode.attributes['ajaxify'].value;
      }
    }
    else {
      target = this.attributes['ajaxify'].value;
    }
    
    var paramString = target.split('?')[1];
    var paramVals = paramString.split('&');
    for (var c=0; c<paramVals.length; c++) {
      var param = paramVals[c].split('=')[0];
      var val = paramVals[c].split('=')[1];
      if (param == 'fbid') {
        target = "http://www.facebook.com/photo.php?fbid=" + val; 
      }
    }
    
    $f.get(target,
      {},
      function (data, thumbSTATUS, thumbXHR) {
        message = "";
        commentsObj = $f.parseJSON(data.split('require("InitialJSLoader").handleServerJS(')[1].split(");\n")[0]);
        for (var a=0; a<commentsObj.instances.length; a++) {
          if (commentsObj.instances[a] != undefined)
          for (var b=0; b<commentsObj.instances[a].length; b++) {
            if (commentsObj.instances[a][b] != undefined)
            for (var c=0; c<commentsObj.instances[a][b].length; c++) {
              if (commentsObj.instances[a][b][c] != undefined)
              if (commentsObj.instances[a][b][c].comments != undefined) {
                for (var d=0; d<commentsObj.instances[a][b][c].comments.length; d++) {
                  message = message + "\n" + commentsObj.instances[a][b][c].comments[d].body.text;
                }
              }
            }
          }
        }
        
        message_tmp = removePartialTag($f(data).find("span.fbPhotosPhotoCaption").html()).replace(/<abbr[^<]+<\/abbr>/ig,"");
        postMessage = message_tmp.replace(/<[^>]+>/ig,"");
        
        message = postMessage + message + supplMessage;
        message.replace(/'四處爬爬走(路殺社, Reptile Road Mortality)'/, "");
        
        var picture = $f(data).find("img.fbPhotoImage").attr('src').split('?')[0];

        var paramString = this.url.split('?')[1];
        var paramVals = paramString.split('&');
        for (var c=0; c<paramVals.length; c++) {
          var param = paramVals[c].split('=')[0];
          var val = paramVals[c].split('=')[1];
          if (param == 'fbid') {
            var oid = val; 
          }
        }
/*        
        var oid = this.url.split('_')[1];
        if ((tippedBody.className.indexOf("photoRedesignLink") != -1)||(tippedBody.className.indexOf("photoRedesign") != -1)||(tippedBody.className.indexOf("uiMediaThumbImg")!=-1)) {
          oid = this.url.split('_')[2];
        }
        if (tippedBody.className.indexOf("fbMainStreamAttachment") != -1) {
          oid = this.url.split('_')[2];
        }
        if (tippedBody.className.indexOf("uiScaledImageContainer") != -1) {
          oid = this.url.split('_')[2];
        }
*/        
        var pname = removePartialTag($f(data).find("div#fbPhotoPageAuthorName a").html()).replace(/(<[^>]+)>/ig,"");
        if ($f(data).find("div#fbPhotoPageAuthorName a").attr('href').indexOf('=') != -1) {
          var pid = $f(data).find("div#fbPhotoPageAuthorName a").attr('href').split('=')[1];
        }
        else {
          var pid = $f(data).find("div#fbPhotoPageAuthorName a").attr('href').split('/').pop();
        }
        // var ctime = $f(data).find("abbr")[0].attributes['data-utime'].value;
        var $tmpAbbr = $f(tippedBody).find('abbr');
        var $meself = $f(tippedBody);
        while ($tmpAbbr.length == 0) {
          $meself = $meself.parent();
          $tmpAbbr = $meself.find('abbr');
        }
        var ctime = $tmpAbbr[0].attributes['data-utime'].value;
        /*
        for (var a = 0; a < $tmpAbbr.length; a++) {
          if ($tmpAbbr[a].className == '')||($tmpAbbr[a].className.indexOf('') {
            var ctime = $tmpAbbr[a].attributes['data-utime'].value;
            break;
          }
        }
        */
        
        var stime = null;
        var cname = '';
        var sname = '';
        var tiw = 0;
        var auth = '';
        var spid = '';
        var location = '';
        var town = '';
        var city = '';
        var lat = null;
        var lng = null;
        if ($f(document).find("div#tip_"+oid).length == 0) {        
          Tipped.create($f(tippedBody), "<div id='tip_"+oid+"'>Loading</div>", {onHide:unsetOid, target:'rigthtop', tooltip:'lefttop',fixed:true, closeButton: true, hideOn:false, showOn:false, closeButton:true});
        }
        Tipped.show($f(tippedBody));
        
        if ((xhr == undefined)||(xhr.state() != 'pending')||(oid != current_oid)) {
          xhr = $f.getJSON(
            //"http://lod.tw/cs/api.findFBObj.php",
            "http://"+app_domain+"/cs/api/api.findFBObj.php",
            {
              oid:  oid
            },
            function(data, textStatus, jqXHR) {
              if (data) {
                data.ctime = ctime;
                //Do something with the data
                //message = '5566bingo';
                var found = true;
                if (data.picture == '') {
                  if (picture != '') {
                    data.picture = picture;
                  }
                }
              }
              else {
                // do something with message;
                // alert(doSomething);
                data = {oid:oid, pid:pid, pname:pname, ctime:ctime, picture:picture, needMore:1};
                var found = false;
              }
              extractAndTip(message, tippedBody, data, found);
            }
          );
        }        
      }
    );
  }
});

function removePartialTag (str) {
  var len = str.length;
  var isPair = true;
  var inQuote = false;
  var cleanStr = "";
  for (i=0; i<len; i++) {
    if (str[i] == '"') {
      if (!isPair) {
        inQuote = ! inQuote;
      }
      cleanStr += str[i];
    }
    if (isPair) {
      if (str[i] == '<') {
        if (!inQuote) {
          isPair = false;
          cleanStr += str[i];
        }
      }
      else if (str[i] == '>'){
      }
      else {
        cleanStr += str[i];
      }
    }
    else if (!isPair) {
      if (str[i] == '>') {
        if (!inQuote) {
          cleanStr += str[i];
          isPair = true;
        }
      }
      else if (str[i] == '<') {
      }
      else {
        cleanStr += str[i];
      }
    }
  }
  return cleanStr;
}

// 不處理spotlight的情況可能會簡單一點
// $f(document).delegate("img.spotlight, img#fbPhotoImage", "hover", function(event) {
$f(document).delegate("img#fbPhotoImage", "hover", function(event) {

  var isCtrlPressed = event.ctrlKey;
  if (!isCtrlPressed) {
    return;
  }

  //alert (event.type);
  if (event.type=='mouseenter') {
    // check element and class
    if (this.className.indexOf('fbPhotoImage') != -1 ) {
      message_tmp = removePartialTag($f('div.fbPhotoContributor').html()).replace(/<abbr[^<]+<\/abbr>/ig,"");
      message = message_tmp.replace(/<[^>]+>/ig,"");
      message.replace(/'四處爬爬走(路殺社, Reptile Road Mortality)'/, "");
      //var oid = this.src.split('_')[1];
      var oid = document.location.href.match(/fbid=(\d+)/)[1];
      var picture = this.src.split('?')[0];
      //var picture = ''; // 待補
      var pname = removePartialTag($f('div#fbPhotoPageAuthorName a').html()).replace(/(<[^>]+)>/ig,"");
      if ($f('div#fbPhotoPageAuthorName a').attr('href').indexOf('=') != -1) {
        var pid = $f('div#fbPhotoPageAuthorName a').attr('href').split('=')[1];
      }
      else {
        var pid = $f('div#fbPhotoPageAuthorName a').attr('href').split('/').pop();
      }
      /*
      for (var a = 0; a < $f('abbr').length; a++) {
        if ($f('abbr')[a].className == '') {
          var ctime = $f("abbr")[a].attributes['data-utime'].value;
          break;
        }
      }
      */
      var $tmpAbbr = $f(this).find('abbr');
      var $meself = $f(this);
      while ($tmpAbbr.length == 0) {
        $meself = $meself.parent();
        $tmpAbbr = $meself.find('abbr');
      }
      var ctime = $tmpAbbr[0].attributes['data-utime'].value;
      var stime = null;
      var cname = '';
      var sname = '';
      var tiw = 0;
      var auth = '';
      var spid = '';
      var location = '';
      var town = '';
      var city = '';
      var lat = null;
      var lng = null;
    }
    else if (this.className.indexOf('spotlight') != -1 ) {
      message_tmp = removePartialTag($f('form.fbPhotosSnowliftFeedbackForm').html()).replace(/<abbr[^<]+<\/abbr>/ig,"");
      message = message_tmp.replace(/<[^>]+>/ig,"");
      message.replace(/'四處爬爬走(路殺社, Reptile Road Mortality)'/, "");
      var oid = this.src.split('_')[1];
      var picture = this.src.split('?')[0];
      var pname = removePartialTag($f('div#fbPhotoSnowliftAuthorName a').html()).replace(/(<[^>]+)>/ig,"");
      if ($f('div#fbPhotoSnowliftAuthorName a').attr('href').indexOf('=') != -1) {
        var pid = $f('div#fbPhotoSnowliftAuthorName a').attr('href').split('=')[1];
      }
      else {
        var pid = $f('div#fbPhotoSnowliftAuthorName a').attr('href').split('/').pop();
      }
      var ctime = $f("abbr")[0].attributes['data-utime'].value;
      var stime = null;
      var cname = '';
      var sname = '';
      var tiw = 0;
      var auth = '';
      var spid = '';
      var location = '';
      var town = '';
      var city = '';
      var lat = null;
      var lng = null;
    }

    tippedBody = this;
    if ($f(document).find("div#tip_"+oid).length == 0) {
      Tipped.create($f(tippedBody), "<div id='tip_"+oid+"'>Loading</div>", {onHide:unsetOid, target:'rigthtop', tooltip:'lefttop', fixed:true, closeButton: true, hideOn:false, showOn:false, closeButton:true});
    }
    Tipped.show($f(tippedBody));
//    if ((xhr == undefined)||(xhr.state() != 'pending')||(oid != current_oid)) {
      xhr = $f.getJSON(
        //"http://lod.tw/cs/api.findFBObj.php",
        "http://"+app_domain+"/cs/api/api.findFBObj.php",
        {
          oid:  oid
        },
        function(data, textStatus, jqXHR) {
          if (data) {
            //Do something with the data
            //message = '5566bingo';
            data.ctime = ctime;
            var found = true;
            if (data.picture == '') {
              if (picture != '') {
                data.picture = picture;
              }
            }
          }
          else {
            // do something with message;
            // alert(doSomething);
            data = {oid:oid, pid:pid, pname:pname, ctime:ctime, picture:picture, needMore:1};
            var found = false;
          }
          $f.get("http://www.facebook.com/" + oid, {}, function (oData, oStatus, oXHR) {
            gmRegex = /set=gm\.(\d+)/;
            gmMatch = gmRegex.exec(oData);
            if (gmMatch != null) {
              // return gmMatch[1];
              oPostURL = "https://www.facebook.com/"+gmMatch[1];

              // 在下面這行前面加上//註解可改為抓原post內容的版本
              extractAndTip(message, tippedBody, data, found); /*
                
              $f.get(oPostURL, {}, function (oPostData, oPostStatus, oPostXHR) {
                message = message + "\n=====以下資訊抓自原post=====";
                var ffss = 'we are 56';
                
                codeRegex = /\<code.+?\<\/code\>/g;
                codeMatch = oPostData.match(codeRegex);
                codeTmp = "";
                for (ci = 0; ci < codeMatch.length; ci++) {
                  if (codeMatch[ci].match(/userContentWrapper/) != null) {
                    codeTmp = codeMatch[ci].replace(/<[^>]+>/ig,"");
                    break; 
                  }
                }
                if (codeTmp != "") {
                  message = message + "\n" + codeTmp;
                }

                bigPipeRegex = /bigPipe\.onPageletArrive\(.+?\)\<\/script\>/g;
                bigPipeMatch = oPostData.match(bigPipeRegex); 
                for (oi = 0; oi < bigPipeMatch.length; oi++) {
                  if (bigPipeMatch[oi].match(/"comments"\:/) != null) {
                    commentsObjTmp = $f.parseJSON(bigPipeMatch[oi].split('bigPipe.onPageletArrive(')[1].split(")</script>")[0]);
                    commentsObj = commentsObjTmp.jsmods;
                    break; 
                  }
                }
                for (var a=0; a<commentsObj.instances.length; a++) {
                  if (commentsObj.instances[a] != undefined)
                  for (var b=0; b<commentsObj.instances[a].length; b++) {
                    if (commentsObj.instances[a][b] != undefined)
                    for (var c=0; c<commentsObj.instances[a][b].length; c++) {
                      if (commentsObj.instances[a][b][c] != undefined)
                      if (commentsObj.instances[a][b][c].comments != undefined) {
                        for (var d=0; d<commentsObj.instances[a][b][c].comments.length; d++) {
                          message = message + "\n" + commentsObj.instances[a][b][c].comments[d].body.text;
                        }
                      }
                    }
                  }
                }
                //message_tmp = $f(data).find("span.fbPhotosPhotoCaption").html().replace(/<abbr[^<]+<\/abbr>/ig,"");
                //postMessage = message_tmp.replace(/<[^>]+>/ig,"");
                extractAndTip(message, tippedBody, data, found);
              });
              //*/
              
            }
            else {
              extractAndTip(message, tippedBody, data, found);
            }
          });
        }
      );
//    }
  }
});
//*/
