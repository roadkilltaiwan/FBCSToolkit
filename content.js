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
  along with this program.  If not, see <//www.gnu.org/licenses/>.
*/

var app_domain = "roadkill.tw";
var app_group = 238918712815615;
var app_context = ".";
var isCtrlPressed = false;

var actOpts = "<option value=''>無</option>"; // 這行是重要的開頭, 不要更動 
actOpts += "<option value='2014端午節蛇類調查'>2014端午節蛇類調查</option>";
// 直接刪除單行或在行前加上兩個斜線以移除單行, 例如此行與以下二行
// 下面這行是參考範例與說明
// actOpts += "<option value='會存進資料庫的內容'>會顯示在小工具選單裡的內容</option>";

var partnerOpts = "<option value=''>無</option>"; // 這行是重要的開頭, 不要更動
var partnerArr = [
  'YMSNP陽管處',
  'KTNP墾管處',
  '新竹林管處',
  '東勢林管處',
  '南投林管處',
  '嘉義林管處',
  '屏東林管處',
  '羅東林管處',
  '花蓮林管處',
  '台東林管處',
];

for (var partner_i=0; partner_i < partnerArr.length; partner_i++) {
  partnerOpts += "<option value='" + partnerArr[partner_i] + "'>" + partnerArr[partner_i] + "</option>";
}



/*
var killOptsArr = [
  {code:0, txt:"沒死或沒動物"},
  {code:100, txt:"路殺"},
  {code:10200, txt:"疑似窗殺"},
  {code:200, txt:"窗殺"},
  {code:300, txt:"死於鳥網"},
  {code:10400, txt:"疑似中毒"},
  {code:10500, txt:"疑似疾病死亡"},
  {code:10600, txt:"疑似他殺"},
  {code:610, txt:"人殺"},
  {code:620, txt:"寵物殺"},
  {code:650, txt:"野動殺"},
  {code:900, txt:"其它死因"}
];
//*/

var killOptsArr = [
  {code:0, txt:"沒死或沒動物"},
  {code:100, txt:"路殺"},
  {code:200, txt:"窗殺"},
  {code:300, txt:"死於鳥網"},
  {code:400, txt:"中毒"},
  {code:500, txt:"疾病死亡"},
  {code:600, txt:"他殺"},
  {code:610, txt:"人殺"},
  {code:620, txt:"寵物殺"},
  {code:650, txt:"野動殺"},
  {code:900, txt:"其它死因"}
];


var profOpts = "<option value=''>無</option>";

function profSelected (dop) {
  var selected_profile = '';
  chrome.runtime.sendMessage({query: "get"}, function(response) {
    selected_profile = response.selected_profile;
    setProfile(selected_profile);
    runTheFlow(dop);
  });
}

function setProfile (val) {
  chrome.runtime.sendMessage({query: "set", selected_profile: val}, function(response) { return; });
  selected_profile = val;
  switch(selected_profile) {
    case 'rk':
      profOpts = "<option value='rk' selected>路殺社</option>"; 
      profOpts += "<option value='dbf'>端午節蛇類調查</option>";
      app_domain = "cs.roadkill.tw";
      app_group = 238918712815615;
      app_context = ".";
            
      break;
    case 'dbf':
      profOpts = "<option value='rk'>路殺社</option>"; 
      profOpts += "<option value='dbf' selected>端午節蛇類調查</option>";
      app_domain = "roadkill.tw";
      app_group = 177775625714412;
      app_context = "dbf";
            
      break;
  }    
}


var fill_data_link_label = '資料載入中請稍後';

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

function backToSpotlight() {
  current_oid = -1;
  var targetURL = Tipped.atURL.replace('&theater', '');
  var thumbFound = $f("a.uiMediaThumb[href='"+targetURL+"']");
  if (thumbFound.length > 0) {
    thumbFound.children().click();
  }
  else {
    window.location.href = Tipped.atURL; 
  }
  Tipped.atURL = '';
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

//  $f("#profile_select_" + oid).html(profOpts);
//  $f("#server_" + oid).html("//" + app_domain + "/" + app_context);
  
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

  function fillDataFromTaiRON (nid) {
    if (!isNaN(Number(nid)) && nid !== null&& nid !== 0) {
      if (document.forms['tipForm_'+oid].trid.value == '') {
        document.forms['tipForm_'+oid].trid.value = nid;
      }
      $f('#to_tairon_link').attr('href', 'https://roadkill.tw/occurrence/' + nid);
      $f.get("https://roadkill.tw/drupalgap/node/" + nid, function(data){
        if ((superX === 0 || superX === '' || superX === undefined || superX === null || isNaN(superX)) && (superX === 0 || superX === '' || superX === undefined || superX === null || isNaN(superX))) {
          if (data.field_collected_location_coord && data.field_collected_location_coord.und && data.field_collected_location_coord.und[0]) {
            var rkLat = data.field_collected_location_coord.und[0].lat;
            var rkLng = data.field_collected_location_coord.und[0].lng;
            if (rkLat && rkLng) {
              document.forms['tipForm_'+oid].x.value = rkLng;
              document.forms['tipForm_'+oid].y.value = rkLat;
              if ((document.forms['tipForm_'+oid].p1.value === '' || document.forms['tipForm_'+oid].p1.value === null || document.forms['tipForm_'+oid].p1.value === undefined)||(document.forms['tipForm_'+oid].p2.value === '' || document.forms['tipForm_'+oid].p2.value === null || document.forms['tipForm_'+oid].p2.value === undefined)) {
                $f.get("https://roadkill.tw/api/getgeo?latlng=" + rkLat + ',' + rkLng, function (geoAdminData) {
                  if (geoAdminData.results.length > 0) {
                    document.forms['tipForm_'+oid].p1.value = geoAdminData.results[0].county;
                    document.forms['tipForm_'+oid].p2.value = geoAdminData.results[0].town;
                  }
                },'json')
              }    
            }
          }
        }
        
        
        // 如果大表沒有死因就讀官網的死因唷
        if (data.field_cause_of_death && data.field_cause_of_death.und && data.field_cause_of_death.und[0]) {
          var cod = data.field_cause_of_death.und[0].value;
          var killOpts = "";
          var isConfirmedChecked = 'checked';
          var isConfirmedNotChecked = '';
          var isConfirmedCSS = 'style=\'color:red\'';
          var isConfirmedNotCSS = '';      
          killOptsArr.forEach (function (optObj){
            if (optObj.code == cod) {
              killOpts += "<option value='"+optObj.code+"' selected>"+optObj.txt+"</option>";
              isConfirmedChecked = 'checked';
              isConfirmedNotChecked = '';
              isConfirmedCSS = 'style=\'color:red\'';
              isConfirmedNotCSS = '';
              $f('.is_confirmed_'+oid+'[name="isConfirmed"][value="yes"]').click();      
            }
            //*
            else if (optObj.code == (parseInt(cod)-10000)) {
              killOpts += "<option value='"+optObj.code+"' selected>"+optObj.txt+"</option>";
              isConfirmedChecked = '';
              isConfirmedNotChecked = 'checked';
              isConfirmedCSS = '';
              isConfirmedNotCSS = 'style=\'color:red\'';
              $f('.is_confirmed_'+oid+'[name="isConfirmed"][value="no"]').click();      
            }
            //*/
            else {
              killOpts += "<option value='"+optObj.code+"'>"+optObj.txt+"</option>";
            }
          });
        }
        $f('#cause_of_death_' + oid).html(killOpts);
        
        
        // 當詳細地點未填時到官網抓資訊
        if (data.field_collected_location && data.field_collected_location.und && data.field_collected_location.und[0]) {
          var userInputLoc = data.field_collected_location.und[0].safe_value;
          if (userInputLoc) {
            document.forms['tipForm_'+oid].p3.value = userInputLoc;
          }
        }
        if (data.field_collected_location_alti && data.field_collected_location_alti.und && data.field_collected_location_alti.und[0]) {
          document.forms['tipForm_'+oid].altitude.value = data.field_collected_location_alti.und[0].value;
        }

        // 當使用者是Tw RoadKill且授權方式不明時, 到官網抓資訊
        if (data.field_license_attribute && data.field_license_attribute.und && data.field_license_attribute.und[0]) {
          if (document.forms['tipForm_'+oid].authorName.value == 'Tw  Roadkill' || document.forms['tipForm_'+oid].authorName.value == 'Tw Roadkill') {
            var authorName = message.match(/與(.+?)。讚/);
            if (authorName[1]) {
              document.forms['tipForm_'+oid].authorName.value = authorName[1];
            }
            var attrTo = data.field_license_attribute.und[0].safe_value;
            if (attrTo) {
              // document.forms['tipForm_'+oid].authorName.value = attrTo;
              document.forms['tipForm_'+oid].by.value = attrTo;
            }
          }

          if (data.cs && data.cs.srcuid) {
            document.forms['tipForm_'+oid].authorId.value = data.cs.srcuid;
          }
          if (data.field_license_deed && data.field_license_deed.und && data.field_license_deed.und[0]) {
            if (document.forms['tipForm_'+oid].auth.value === '未授權') {
              if (data.field_license_attribute && data.field_license_attribute.und && data.field_license_attribute.und[0]) {
                document.forms['tipForm_'+oid].by.value = data.field_license_attribute.und[0].safe_value;
              }
              else {
                document.forms['tipForm_'+oid].by.value = document.forms['tipForm_'+oid].by.value.replace(/未授權/,'');
              }
              if (data.field_license_deed.und[0].value === null || data.field_license_deed.und[0].value === 'null') {
                document.forms['tipForm_'+oid].auth.value = 'c';
              }
              else {
                document.forms['tipForm_'+oid].auth.value = data.field_license_deed.und[0].value;
              }
            }
          }

        }
      }, 'json');
    }  
  }



  $f(document).delegate("div#forceXY_" + oid, "click", function() {
    //alert('forceXY is clicked!');
    //$f(this).parent().next()..value = '';
    //$f(this).parent().next().children().attr('value', '');
    if (superX && superY) {
      document.forms['tipForm_'+oid].x.value = superX;
      document.forms['tipForm_'+oid].y.value = superY;
    }
    else {
      $f('#transformXY_' + oid).click();
    }

    var nid = null;
    var rkid_string = message.match(/\[roadkill\: *([0-9]+) *\]/);
    if (rkid_string !== null) {
      nid = rkid_string[1];
    }
    // 當可取得nid時到官網抓/補資訊
    if (!isNaN(Number(nid)) && nid !== null && nid !== 0) {
      fillDataFromTaiRON (nid);
    }
    else {
      $f.ajax({
        type: "HEAD",
        async: true,
        url: "//roadkill.tw/query?row=0&rowsperpage=15&nodetype[0]=occurrence&ft=fbid%3A"+oid+"%20verified%3A2",
        success: function(message, txt, xhr) {
          nid = xhr.getResponseHeader('Link').match(/<(.+?)>/)[1].split('/').pop();
          if (!isNaN(Number(nid)) && nid !== null && nid !== 0) {
            fillDataFromTaiRON (nid);
          }
          // 如果找不到nid的時候, 透過此api取得app scope id以及其他使用者授權資訊
          else if (!(document.forms['tipForm_'+oid].authorId.value === '' || document.forms['tipForm_'+oid].authorId.value === null || document.forms['tipForm_'+oid].authorId.value === undefined)) {
            // $f.get("https://roadkill.tw/api/admonly?f=userfbid&v=" + document.forms['tipForm_'+oid].authorId.value, function (authData) {
            $f.get("https://roadkill.tw/api/admonly?f=userfbidbyphoto&v=" + oid, function (authData) {
              document.forms['tipForm_'+oid].authorId.value = authData.data.fbid;
              if (document.forms['tipForm_'+oid].auth.value === '未授權') {
                if (authData.data.license_deed !== undefined) {
                  document.forms['tipForm_'+oid].auth.value = authData.data.license_deed;
                  document.forms['tipForm_'+oid].by.value = authData.data.name || document.forms['tipForm_'+oid].by.value.replace(/未授權/,'');
                }
                else {
                  document.forms['tipForm_'+oid].auth.value = 'c';
                  document.forms['tipForm_'+oid].by.value = authData.data.name || document.forms['tipForm_'+oid].by.value.replace(/未授權/,'');
                } 
              }
            });
    }    

        }
      })
    }
    if ((document.forms['tipForm_'+oid].p1.value === '' || document.forms['tipForm_'+oid].p1.value === null || document.forms['tipForm_'+oid].p1.value === undefined)||(document.forms['tipForm_'+oid].p2.value === '' || document.forms['tipForm_'+oid].p2.value === null || document.forms['tipForm_'+oid].p2.value === undefined)) {
      if (document.forms['tipForm_'+oid].x.value && document.forms['tipForm_'+oid].y.value) {
        $f.get("https://roadkill.tw/api/getgeo?latlng=" + document.forms['tipForm_'+oid].y.value + ',' + document.forms['tipForm_'+oid].x.value, function (geoAdminData) {
          if (geoAdminData.results.length > 0) {
            document.forms['tipForm_'+oid].p1.value = geoAdminData.results[0].county;
            document.forms['tipForm_'+oid].p2.value = geoAdminData.results[0].town;
          }
        },'json')
      }
    }
  });

  $f(document).delegate("a#mapLookup_" + oid, "click", function() {
    var mapX = document.forms['tipForm_'+oid].x.value;
    var mapY = document.forms['tipForm_'+oid].y.value;
    var gMapLink = "//maps.google.com.tw/maps?q="+mapY+","+mapX;
    var rkMapLink = "http://taibif.tw/vgd/aprxGeoValidation/map.html?latlng="+mapY+","+mapX;
    if ((mapX=='')&&(mapY=='')) {
      alert('沒輸入點位學人看什麼地圖');
      OpenInNewTab(rkMapLink);
    }
    else {
      OpenInNewTab(rkMapLink);
    }
  });

  $f(document).delegate("div#transformXY_" + oid, "click", function() {
    //$f(this).parent().next()..value = '';
    //$f(this).parent().next().children().attr('value', '');
    var tpwCoord = "";
    tpwCoord = document.getElementById('xySource_'+oid).value;
    if (tpwCoord == '') {
      var tpwTmp = document.forms['tipForm_'+oid].dummy.value.match(/[A-HJ-Z]\d{4} ?[A-H][A-E]\d{2,4}/i);
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
    var submit_tf = this;
    var target = '//'+app_domain+'/'+app_context+'/api/api.updateBigTable.php';
    var formalizedDateTime = new Date(document.forms['tipForm_'+oid].ctime_int.value * 1000); // to milliseconds
    var formalizedDateTimeString = formalizedDateTime.toISOString().split('T')[0] + " " + formalizedDateTime.toISOString().split('T')[1].split('.')[0];

    var sdata = {
      photo_id:oid,
      link:"//www.facebook.com/photo.php?fbid="+oid,
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
      count1:((document.forms['tipForm_'+oid].cname1.value==''&&document.forms['tipForm_'+oid].sname1.value=='')?'':document.forms['tipForm_'+oid].count1.value),
      count2:((document.forms['tipForm_'+oid].cname2.value==''&&document.forms['tipForm_'+oid].sname2.value=='')?'':document.forms['tipForm_'+oid].count2.value),
      count3:((document.forms['tipForm_'+oid].cname3.value==''&&document.forms['tipForm_'+oid].sname3.value=='')?'':document.forms['tipForm_'+oid].count3.value),
      tagged:document.forms['tipForm_'+oid].tagged.value,
      inWhiteList:document.forms['tipForm_'+oid].tiw.checked,
      rk:((document.forms['tipForm_'+oid].isConfirmed.value=='yes')?document.forms['tipForm_'+oid].rk.value:parseInt(document.forms['tipForm_'+oid].rk.value)+10000),
      activity:document.forms['tipForm_'+oid].rk.value,
      verified:document.forms['tipForm_'+oid].verified.checked,      
      authState:document.forms['tipForm_'+oid].auth.value,
      byWhom:document.forms['tipForm_'+oid].by.value,
      spid:document.forms['tipForm_'+oid].spid.value,
      coid:document.forms['tipForm_'+oid].coid.value,
      trid:document.forms['tipForm_'+oid].trid.value,
      x:document.forms['tipForm_'+oid].x.value,
      y:document.forms['tipForm_'+oid].y.value,
      altitude:document.forms['tipForm_'+oid].altitude.value,
      p1:document.forms['tipForm_'+oid].p1.value,
      p2:document.forms['tipForm_'+oid].p2.value,
      p3:document.forms['tipForm_'+oid].p3.value,
      remark:document.forms['tipForm_'+oid].remark.value,
      hu:document.forms['tipForm_'+oid].humanUpdated.value,
      activity:document.forms['tipForm_'+oid].activity.value,
      partner:document.forms['tipForm_'+oid].partner.value,
      archive:document.forms['tipForm_'+oid].toTaiRON.checked
    };
    $f.post(target, sdata, function (rdata, status, xhr) {
      // reset all tips
      current_oid = -1;
      if (rdata.state != false) {
        //Tipped.hide($f(tf));
        Tipped.hide(submit_tf);
      }
      else {
        alert("新增/更改資料失敗!!\n"+rdata.SQL);
      }
      //var ffss = 5566;
    }, 'json');
  });
  $f(document).delegate("#tipFormClose_" + oid, "click", function() {
    current_oid = -1;
    //Tipped.hide($f(tf));
    Tipped.hide(this);
  });
  $f(document).delegate("#tipFormCloseAndToGroupAlbum_" + oid, "click", function() {
    Tipped.atURL = window.location.href.replace(/set=gm\.\d+/, 'set=o.'+ app_group);
    current_oid = -1;
    //Tipped.hide($f(tf));
    Tipped.hide(this);
  })
      
}

var postId;
var threadContent;
var xhr;
var post_message;
var message;
var tippedBody;

var exhr;
var placeXHR;
var formData = {
  init:true
};

var placesHTML = {};

function extractAndTip (message, tippedBody, meta, found) {
    var sid = "#places_hierarchy_" + meta.oid;
    var oid = meta.oid;
    if (placesHTML[oid] === undefined) {
      if ((placeXHR == undefined)||(placeXHR.state() != 'pending')) {
        placeXHR = $f.post(
          "//"+app_domain+"/"+app_context+"/api/api.getNames.php",
          {text:message, fastMode:0, withContext:'true'},
          function (data, textStatus, jqXHR) {
            var places = new Array();
            // var v5566 = data;
            if (data.annotation.surfaceForm_pn !== undefined) {
              for (var i=0; i<data.annotation.surfaceForm_pn.length; i++) {
                for (var j=0; j<data.annotation.surfaceForm_pn[i].resource.length; j++) {
                  var pr = data.annotation.surfaceForm_pn[i].resource[j];
                  var place = pr['@county'] +"|" + pr['@town'] + "|" + pr['@label'];
                  if (places.indexOf(place) == -1) {
                    places.push(place);
                  }
                }
              }
            }
            if (places.length > 0) {
              placesHTML[oid] = "";
              places.sort();
              //placesHTML += "<select name='places'>";
              placesHTML[oid] += "<option value='-1'>無</option>";
              for (var k = 0; k < places.length; k++) {
                placesHTML[oid] += "<option value='"+places[k]+"'>"+places[k]+"</option>";
              }
              //placesHTML += "</select>";
              $f(sid).html(placesHTML[oid]);
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

  if (meta.verified == 0) {
    formData.verified = "";
  }
  else if (meta.verified == 1) {
    formData.verified = "checked";
  }

  $f.post(
    //'//lod.tw/cs/api.single_record.php',
    '//'+app_domain+'/'+app_context+'/api/api.single_record.php',
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
      var nfcount1 = (data.match[0]==undefined)?'':((nfcname1==''&&nfsname1=='')?'':1);
      var nfcname2 = (data.match[1]==undefined)?'':data.match[1].cn;
      var nfsname2 = (data.match[1]==undefined)?'':data.match[1].sn;
      var nfcount2 = (data.match[0]==undefined)?'':((nfcname2==''&&nfsname2=='')?'':1);
      var nfcname3 = (data.match[2]==undefined)?'':data.match[2].cn;
      var nfsname3 = (data.match[2]==undefined)?'':data.match[2].sn;
      var nfcount3 = (data.match[0]==undefined)?'':((nfcname3==''&&nfsname3=='')?'':1);
      var nfspid = ((data.extra==undefined)||(data.extra.SpecimenID==undefined))?'':data.extra.SpecimenID;
      var nfcoid = ((data.extra==undefined)||(data.extra.CollectionID==undefined))?'':data.extra.CollectionID;
      var nftrid = data.trid;
      
      var nid = null;
      var rkid_string = message.match(/\[roadkill\: *([0-9]+) *\]/);
      if (rkid_string !== null) {
        nid = rkid_string[1];
      }
      if (!isNaN(Number(nid)) && nid !== null && data.trid === '') {      
        var nftrid = nid;
      }
      
      xcss = '';
      ycss = '';
      bycss = '';
      
      if (!found) {
        var title = '未';
        formData.stime = nfstime;
        formData.cname1 = nfcname1;
        formData.sname1 = nfsname1;
        formData.count1 = nfcount1;
        formData.cname2 = nfcname2;
        formData.sname2 = nfsname2;
        formData.count2 = nfcount2;
        formData.cname3 = nfcname3;
        formData.sname3 = nfsname3;
        formData.count3 = nfcount3;
        formData.tiw = 0; // 目前的方法無法從client端得知
        formData.auth = nfauth;
        formData.by = nfby;
        formData.spid = nfspid;
        formData.coid = nfcoid;
        formData.trid = nftrid;
        formData.lat = (nfy == undefined)?"":nfy;
        formData.lng = (nfx == undefined)?"":nfx;
        formData.alt = '';
        formData.rk = 100; //'checked';
        formData.actOpts = actOpts;
        formData.partnerOpts = partnerOpts;
        formData.toTaiRON = 'checked';
      }      
      else if (found) {

        if (meta.toTaiRON == 1) {
          formData.toTaiRON = 'checked';
        }
        else {
          formData.toTaiRON = '';
        }
        
      
        if ((meta.actOpts != '')&&(meta.actOpts != null)&&(meta.actOpts != 'null')) { 
          formData.actOpts = actOpts  + "<option value='"+meta.actOpts+"' selected>"+meta.actOpts+"</option>";
        }
        else {
          formData.actOpts = actOpts;
        }

        if ((meta.partnerOpts != '')&&(meta.partnerOpts != null)&&(meta.partnerOpts != 'null')) { 
          formData.partnerOpts = partnerOpts  + "<option value='"+meta.partnerOpts+"' selected>"+meta.partnerOpts+"</option>";
        }
        else {
          formData.partnerOpts = partnerOpts;
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
          //if ((formData.tagged == 1)&&(meta.verified != 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.cname1 = nfcname1;
            cname1css = " style='background:pink;' ";
          }
        }
        
        formData.sname1 = (meta.sname[0]==undefined)?'':meta.sname[0];
        var sname1css = "";
        if ((meta.sname[0] != nfsname1)&&(nfsname1!='')&&(nfsname1!=undefined)&&(nfsname1!=null)) {
          //if ((formData.tagged == 1)&&(meta.verified == 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.sname1 = nfsname1;
            sname1css = " style='background:pink;' ";
          }
        }

        formData.count1 = (meta.count[0]==undefined)?(((formData.sname1!='')||(formData.cname1!=''))?1:''):meta.count[0];

        
        formData.cname2 = (meta.cname[1]==undefined)?'':meta.cname[1];
        var cname2css = "";
        if ((meta.cname[1] != nfcname2)&&(nfcname2!='')&&(nfcname2!=undefined)&&(nfcname2!=null)) {
          //if ((formData.tagged == 1)&&(meta.verified != 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.cname2 = nfcname2;
            cname2css = " style='background:pink;' ";
          }
        }
        
        formData.sname2 = (meta.sname[1]==undefined)?'':meta.sname[1];
        var sname2css = "";
        if ((meta.sname[1] != nfsname2)&&(nfsname2!='')&&(nfsname2!=undefined)&&(nfsname2!=null)) {
          //if ((formData.tagged == 1)&&(meta.verified != 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.sname2 = nfsname2;
            sname2css = " style='background:pink;' ";
          }
        }
        
        formData.count2 = (meta.count[1]==undefined)?(((formData.sname2!='')||(formData.cname2!=''))?1:''):meta.count[1];
        
        
        formData.cname3 = (meta.cname[2]==undefined)?'':meta.cname[2];
        var cname3css = "";
        if ((meta.cname[2] != nfcname3)&&(nfcname3!='')&&(nfcname3!=undefined)&&(nfcname3!=null)) {
          //if ((formData.tagged == 1)&&(meta.verified != 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.cname3 = nfcname3;
            cname3css = " style='background:pink;' ";
          }
        }
        
        formData.sname3 = (meta.sname[2]==undefined)?'':meta.sname[2];
        var sname3css = "";
        if ((meta.sname[2] != nfsname3)&&(nfsname3!='')&&(nfsname3!=undefined)&&(nfsname3!=null)) {
          //if ((formData.tagged == 1)&&(meta.verified != 1)&&(formData.tiw == 0)) {
          if ((formData.tagged == 1)&&(meta.verified != 1)) {
            formData.sname3 = nfsname3;
            sname3css = " style='background:pink;' ";
          }
        }
        
        formData.count3 = (meta.count[2]==undefined)?(((formData.sname3!='')||(formData.cname3!=''))?1:''):meta.count[2];
        
        
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

        formData.trid = meta.trid;
        var tridcss = "";
        if ((meta.trid != '')&&(meta.trid != nftrid)) {
          if (meta.hu != 1) {
            formData.trid = nftrid;
            var tridcss = " style='background:pink;' ";
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
        
        var pidcss = "";
        if (meta.pid_conflict) {
          var pidcss = " style='background:pink;' ";
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
          formData.rk = 100; //'checked';
        }
        else if (meta.rk == '') {
          formData.rk = 0; //'';
        }
        else {
          formData.rk = meta.rk;
        }
      }
      
      var killOpts = "";
      var isConfirmedChecked = 'checked';
      var isConfirmedNotChecked = '';
      var isConfirmedCSS = 'style=\'color:red\'';
      var isConfirmedNotCSS = '';      
      killOptsArr.forEach (function (optObj){
        if (optObj.code == formData.rk) {
          killOpts += "<option value='"+optObj.code+"' selected>"+optObj.txt+"</option>";
          isConfirmedChecked = 'checked';
          isConfirmedNotChecked = '';
          isConfirmedCSS = 'style=\'color:red\'';
          isConfirmedNotCSS = '';      
        }
        //*
        else if (optObj.code == (parseInt(formData.rk)-10000)) {
          killOpts += "<option value='"+optObj.code+"' selected>"+optObj.txt+"</option>";
          isConfirmedChecked = '';
          isConfirmedNotChecked = 'checked';
          isConfirmedCSS = '';
          isConfirmedNotCSS = 'style=\'color:red\'';      
        }
        //*/
        else {
          killOpts += "<option value='"+optObj.code+"'>"+optObj.txt+"</option>";
        }
      });
      
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
        tipContent += "<tr><td colspan=2><h3 style='color:white;'>Profile</h3></td><td><select id='profile_select_"+formData.oid+"' style='overflow-x:visible; width:auto;' name='profile' id='profOpts'>"+profOpts+"</select></td><td><div id='server_"+formData.oid+"'>"+app_domain+"/"+app_context+"</div></td></tr>";
        tipContent += "<tr><td colspan=2><h2 style='color:white;'>資料庫中"+title+"標記照片ID</h2></td><td><input name='oid' value='"+formData.oid+"'></td><td>特殊活動</td><td><select style='overflow-x:visible; width:auto;' name='activity'>"+formData.actOpts+"</select></td></tr>";
        tipContent += "<tr><td colspan=2>路殺社ID</td><td><input "+tridcss+" name='trid' value='"+formData.trid+"'/></td><td><a id='to_tairon_link' target='_blank' href='https://roadkill.tw/occurrence/"+formData.trid+"'>TaiRON由此去</a></td><td><select style='overflow-x:visible; width:auto;' name='partner'>"+formData.partnerOpts+"</select></td></tr>";
        tipContent += "<tr><td colspan=2>上傳日期</td><td><input type='text' name='ctime' value='"+formData.ctime+"'></td>";
        tipContent += "<td>拍攝日期</td><td><input type='date' name='stime' value='"+formData.stime+"'></td><td></td><td></td></tr>";
        tipContent += "<tr><td colspan=2>上傳者ID</td><td><input "+pidcss+" name='authorId' value='"+formData.pid+"'></td>";
        tipContent += "<td>上傳者代號</td><td><input name='authorName' value='"+formData.pname+"'></td></tr>";
        tipContent += "<tr><td>物種一<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input type='number' style='width:50px' min=1 name='count1' value='"+formData.count1+"'><img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname1css+" name='cname1' value='"+formData.cname1+"'></td><td>學名1<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname1css+" name='sname1' value='"+formData.sname1+"'></td></tr>";
        tipContent += "<tr><td>物種二<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input type='number' style='width:50px' min=1 name='count2' value='"+formData.count2+"'><img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname2css+" name='cname2' value='"+formData.cname2+"'></td><td>學名2<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname2css+" name='sname2' value='"+formData.sname2+"'></td></tr>";
        tipContent += "<tr><td>物種三<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input type='number' style='width:50px' min=1 name='count3' value='"+formData.count3+"'><img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname3css+" name='cname3' value='"+formData.cname3+"'></td><td>學名3<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname3css+" name='sname3' value='"+formData.sname3+"'></td></tr>";
//        tipContent += "<tr><td colspan=2>物種二<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname2css+" name='cname2' value='"+formData.cname2+"'></td><td>學名2<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname2css+" name='sname2' value='"+formData.sname2+"'></td><td>數量2<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input size=1 name='count2' value='"+formData.count2+"'></td></tr>";
//        tipContent += "<tr><td colspan=2>物種三<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+cname3css+" name='cname3' value='"+formData.cname3+"'></td><td>學名3<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input "+sname3css+" name='sname3' value='"+formData.sname3+"'></td><td>數量3<img style='float:right' class='quick_clean_"+formData.oid+"' src='chrome-extension://"+cepath+"/images/monotone_close_exit_delete_small.png'></td><td><input size=1 name='count3' value='"+formData.count3+"'></td></tr>";
        tipContent += "<tr><td colspan=2>已鑑定</td><td><input type='checkbox' name='tiw' "+formData.tiw+"></td><td>死亡類別<input class='is_confirmed_"+formData.oid+"' type=radio name='isConfirmed' value='yes' "+isConfirmedChecked+"><span "+isConfirmedCSS+">確定</span><input class='is_confirmed_"+formData.oid+"' type=radio name='isConfirmed' value='no'"+isConfirmedNotChecked+"><span "+isConfirmedNotCSS+">疑似</span></td><td><select style='overflow-x:visible; width:auto;' name='rk' id='cause_of_death_"+ formData.oid +"'>"+killOpts+"</select></td></tr>";
        tipContent += "<tr><td colspan=2>已審查</td><td><input name='verified' type='checkbox' "+formData.verified+" cheched='checked'/></td><td>是否需要進TaiRON</td><td><input name='toTaiRON' type='checkbox' "+formData.toTaiRON+" /></td></tr>";
        tipContent += "<tr><td colspan=2>授權方式</td><td><input "+authcss+" name='auth' value='"+(((formData.auth=="")&&(meta.hu != 1))?"未授權":formData.auth)+"'><td>姓名標示</td></td><td><input "+bycss+" name='by' value='"+((formData.by=="")?("未授權"+formData.pname):formData.by)+"'></td></tr>";
        tipContent += "<tr><td colspan=2>標本號</td><td><input "+spidcss+" name='spid' value='"+((formData.spid==undefined)?"":formData.spid)+"'/></td><td>採集編號</td><td><input "+coidcss+" name='coid' value='"+((formData.coid==undefined)?"":formData.coid)+"'/></td></tr>";
        tipContent += "<tr><td colspan=2>x</td><td><input "+xcss+" name='x' value='"+formData.lng.toString().replace(/'/, '&apos;')+"'/></td><td>y</td><td><input "+ycss+" name='y' value='"+formData.lat.toString().replace(/'/, '&apos;')+"'/></td></tr>";
        tipContent += "<tr><td colspan=2>海拔高度</td><td><input name='altitude'/></td><td></td><td><div id='forceXY_"+formData.oid+"'><u><div id='fill_data_"+formData.oid+"'>"+fill_data_link_label+"</div></u></div><a id='mapLookup_"+formData.oid+"'>我要看地圖</a><div id='transformXY_"+formData.oid+"'><u>轉換管它什麼座標</u></div><a id='oPost_"+formData.oid+"'>原po呢????(敲碗)</a></td></tr>";
        tipContent += "<tr><td colspan=2>地名階層</td><td colspan='3'><span id='places_hierarchy_wrap'><select style='overflow-x:visible; width:auto;' id='places_hierarchy_"+meta.oid+"'>"+placesHTML[meta.oid]+"</select></span></td></tr>";
        tipContent += "<tr><td colspan=2>地點縣市</td><td><input id='p1_"+meta.oid+"' name='p1' value='"+p1+"'/></td><td>地點鄉鎮</td><td><input id='p2_"+meta.oid+"' name='p2' value='"+p2+"'/></td></tr>";
        tipContent += "<tr><td colspan=2>地點其他</td><td><input id='p3_"+meta.oid+"' name='p3' value='"+p3.replace(/'/, '&apos;')+"'/></td><td>其它座標</td><td><input id='xySource_"+formData.oid+"' name='xySource'/></td></tr>";
        tipContent += "<tr><td colspan=2>備註</td><td colspan='3'><input style='width:97%;' name='remark' value='"+remark.replace(/</, '&lt;').replace(/>/, '&gt;')+"'/></td></tr>";
        tipContent += "<tr><td colspan='6'><textarea name='dummy' style=\"width:97%;height:200px\" readonly>*****此區訊息僅供確認用, 不允許修改亦不會被傳送*****\n"+message+"</textarea></td></tr>";
        tipContent += "<tr><td colspan=2/><td style='text-align:center;'><div id='tipFormSubmit_"+meta.oid+"'><b><u>送出</u></b></div></td><td style='text-align:center;'><div id='tipFormClose_"+meta.oid+"'><b><u>關閉不送</u></b></div></td><td style='text-align:center;'><div id='tipFormCloseAndToGroupAlbum_"+meta.oid+"'><b><u>傳送門</u></b></div></td></tr>";
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
        $f("#profile_select_"+meta.oid).change(
          function () {
            var oid = this.id.split('_').pop();
            setProfile(this.options[this.selectedIndex].value);
            current_oid = -1;
            //Tipped.hide($f(tippedBody));
            Tipped.hideAll();
          }
        );
      }

      Tipped.refresh($f(tippedBody), {target:'rigthtop', tooltip:'lefttop'});
      triggerTipForm(meta.oid, tippedBody);
      $f('#fill_data_' + meta.oid).html('補上XY,使用者與授權');
      current_oid = meta.oid;      
      
       
    },
    'json'
  );

        //Tipped.show($f(tippedBody));
}


function runTheFlow (dop /*dataOnPage*/) {
  if ((xhr == undefined)||(xhr.state() != 'pending')||(dop.oid != current_oid)||dop.go) {
    xhr = $f.getJSON(
      //"//lod.tw/cs/api.findFBObj.php",
      "//"+app_domain+"/"+app_context+"/api/api.findFBObj.php",
      {
        oid:  dop.oid
      },
      function(data, textStatus, jqXHR) {
        if (data) {
          //Do something with the data
          //message = '5566bingo';
          data.ctime = dop.ctime;
          var found = true;
          if (data.picture != dop.picture) {
            if (dop.picture != '') {
              data.picture = dop.picture;
            }
          }
          if (data.pid != dop.pid) {
            // data.pid = "留下正確的pid:" + data.pid + "或" + dop.pid;
            // 20150610 決議先留 bigTable裡的id (TaiRON改d7後都會是 app scoped id)
            data.pid = data.pid;
            data.pid_conflict = true;
          }
          else {
            data.pid_conflict = false;
          }            
        }
        else {
          // do something with message;
          // alert(doSomething);
          data = {oid:dop.oid, pid:dop.pid, pname:dop.pname, ctime:dop.ctime, picture:dop.picture, verified:1, pid_conflict:false};
          var found = false;
        }
        if (dop.go) {
          $f.get("//www.facebook.com/" + dop.oid, {}, function (oData, oStatus, oXHR) {
            gmRegex = /set=gm\.(\d+)/;
            gmMatch = gmRegex.exec(oData);
            if (gmMatch != null) {
              oPostURL = "//www.facebook.com/"+gmMatch[1];
              // return gmMatch[1];
              // 在下面這行前面加上//註解可改為抓原post內容的版本
              extractAndTip(dop.message, dop.tippedBody, data, found);
            }
            else {
              extractAndTip(dop.message, dop.tippedBody, data, found);
            }
          });
        }
        else {
          extractAndTip(dop.message, dop.tippedBody, data, found);
        }
      }
    );
  }
}

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
      // cleanStr += str[i];
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


// targetting spotlight, damn fb
$f(document).delegate("div.stage img.spotlight, img#fbPhotoImage", "hover", function(event) {
// $f(document).delegate("img#fbPhotoImage", "hover", function(event) {

  isCtrlPressed = event.ctrlKey;
  if (!isCtrlPressed) {
    return;
  }

  //alert (event.type);
  if (event.type=='mouseenter') {
    // check element and class
    var tagged_person = $f('.fbPhotoTagListTag a.taggee')[0];
    if (tagged_person !== undefined) {
      var tagged_person_name = '與' + tagged_person.innerText + '。讚';
    }
    else {
      var tagged_person_name = '';
    }
    post_message = $f('.fbPhotosPhotoCaption')[0].innerText + ' ' + tagged_person_name + "\n";
    messages_obj = $f('.UFICommentContent');
    messages = [];
    for (var mi in messages_obj) {
      if (messages_obj.hasOwnProperty(mi)) {
        messages.push(messages_obj[mi].innerText);
      }
    } 

//    message_tmp = removePartialTag($f('div.fbPhotoContributor').html()).replace(/<abbr[^<]+<\/abbr>/ig,"");
//    message = message_tmp.replace(/<[^>]+>/ig,"");
//    message = message.replace(/四處爬爬走(路殺社, Reptile Road Mortality)/, "");
    message = post_message + ';' + messages.join(';');
    //var oid = this.src.split('_')[1];
    var oid = document.location.href.match(/fbid=(\d+)/)[1];
    // var picture = this.src.split('?')[0];
    var picture = this.src;
    //var picture = ''; // 待補
    var author_a = $f('div#fbPhotoSnowliftAuthorName a');
    var pname = author_a[0].innerText;
    var pid = author_a.attr('data-hovercard').split('id=').pop()
    /*
    for (var a = 0; a < $f('abbr').length; a++) {
      if ($f('abbr')[a].className == '') {
        var ctime = $f("abbr")[a].attributes['data-utime'].value;
        break;
      }
    }
    */
    
    /*
    var $tmpAbbr = $f(this).find('abbr');
    var $meself = $f(this);
    while ($tmpAbbr.length == 0) {
      $meself = $meself.parent();
      $tmpAbbr = $meself.find('abbr');
    }
    //*/
    
    var ctime = $f('#fbPhotoSnowliftTimestamp a abbr').attr('data-utime');
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


    //tippedBody = this;
    tippedBody = this;
    if ($f(document).find("div#tip_"+oid).length == 0) {
      $f(document).find("div#tip_"+oid).remove();
      //Tipped.create($f(tippedBody), "<div id='tip_"+oid+"'>Loading</div>", {onHide:unsetOid, target:'rigthtop', tooltip:'lefttop', fixed:true, closeButton: true, hideOn:false, showOn:false, closeButton:true});
    }
    Tipped.atURL = window.location.href;
    Tipped.create($f(tippedBody), "<div id='tip_"+oid+"'>Loading</div>", {onHide:backToSpotlight, target:'rigthtop', tooltip:'lefttop', fixed:true, closeButton: true, hideOn:false, showOn:false, closeButton:true});
    Tipped.show($f(tippedBody));
    
    $f( '.t_Tooltip' ).draggable();
//    if ((xhr == undefined)||(xhr.state() != 'pending')||(oid != current_oid)) {

    var dop = {init: true};
    dop.oid = oid;
    dop.ctime = ctime;
    dop.picture = picture;
    dop.message = message;
    dop.pid = pid;
    dop.pname = pname;
    dop.tippedBody = tippedBody;
    dop.go = true;

    profSelected (dop);

//    }
  }
});



//*/
/*
$f(document).keydown(function (e) {
  // console.log(e.keyCode);
  var focused = $f(':focus');
  console.log(focused);
  console.log(focused.length);
  if ((e.type=='keydown')&&(focused.length===0)) {
    switch (e.keyCode) {
      case 37:
        if ($f('.photoPagePrevNav').length) {
          $f('.photoPagePrevNav')[0].click();
        }
        break;
      case 39:
        if ($f('.photoPageNextNav').length) {
          $f('.photoPageNextNav')[0].click();
        }
        break;
    }
  }
});
//*/