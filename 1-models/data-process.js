var isAndroid = kendo.support.mobileOS.android;
var loadcoupons = false;

// override datasources
couponDataSource = new kendo.data.DataSource({
  transport: {
    read: function (data) { 
            getCouponData(couponDataSource);
            getCouponHistory(couponHistorySource);
          }
  },
//  sort: {
//    field: "優惠券名稱",
//    dir: "asc"
//  },
  requestStart: function () {
    kendo.ui.progress($("#loading"), true);
  },
  requestEnd: function () {
    kendo.ui.progress($("#loading"), false);
  },

  schema: {
    total: function () {
      console.log("couponDataSource scheme total");
      取得經緯度(1);    
      return 77;
    }
  },
  serverPaging: true,
  pageSize: 40,
  //group: { field: "section" }
})

couponHistorySource = new kendo.data.DataSource({
  transport: {
    read: function (data) { getCouponHistory(data); }
  },
//  sort: {
//    field: "優惠券名稱",
//    dir: "asc"
//  },
  requestStart: function () {
    kendo.ui.progress($("#loading"), true);
  },
  requestEnd: function () {
    kendo.ui.progress($("#loading"), false);
  },

  schema: {
    total: function () {
      console.log("couponHistorySource scheme total");
      取得經緯度(2);    
      return 77;
    }
  },
  serverPaging: true,
  pageSize: 40,
  //group: { field: "section" }
})

searchDataSource = couponDataSource;

function getCouponData(data) {
  console.log("getting data");
  
  if (loadcoupons == false) return 1;
  
  allDataReady = 0;
  readCoupons();

  var checkDataReady = setInterval(function(){
    if (allDataReady==4) {
      clearInterval(checkDataReady);
      //console.log("Set up data for listview")
      var dataTemp =[];
      notInCoupon.forEach(function(coupon, index, array){
        couponData.forEach(function(item, ind, arr){
          if (coupon==item[0]) {
            //console.log(coupon, ind);
            var couponTitle = {
              "優惠券名稱": couponData[ind][0] + ": " +
                         couponData[ind][1],
              //"老師姓名": couponData[ind][2] + " 老師",
              "優惠券時間": couponData[ind][2], 
              "url": "2-views/couponDetail.html?couponId=" + couponData[ind][0],
            };
            dataTemp.push(couponTitle);
          }
        });
      });
   
      //console.log(dataTemp);
      
      data.success( dataTemp);      
    }
    
  }, 100);

}

function getCouponHistory(data) {
  console.log("getting couponHistory", loadcoupons);
  
  if (loadcoupons == false) return 1;
  
//  allDataReady = 0;
//  readCoupons();

  var checkDataReady = setInterval(function(){
    //console.log("in history", allDataReady);
    if (allDataReady==4) {
      clearInterval(checkDataReady);
      //console.log("in xxx", myHistory)
      var dataTemp =[];
      
      var couponTitle;
      inCoupon.forEach(function(coupon, index, array){
        couponData.forEach(function(item, ind, arr){
          if (coupon==item[0]) {
            //console.log(coupon, ind);
            couponTitle = {
              "優惠券名稱": couponData[ind][0] + ": " + couponData[ind][1],
              "優惠券時間": couponData[ind][2], 
              "url": "2-views/couponDetail.html?couponId=" + couponData[ind][0], 
              "狀態": "未知",
            };
            //dataTemp.push(couponTitle);
          }
        });
        
        couponMember.forEach(function(item, ind, arr){
          if (coupon==item[0]) {
            for (var i=1; i< item.length; i++) {
              if (item[i][4] == userPhoneNumber){
                console.log(item[i][2]);
                couponTitle.狀態 = "已使用";
                                
//                console.log(item[i][2]);
//                if (item[i][2]=="未確認") {
//                  couponTitle.狀態 = "請到櫃台核銷";
//                } else {
//                  couponTitle.狀態 = "已核銷";
//                }
              }
            }
          }
        });
        
        dataTemp.push(couponTitle);
        
      });      
      
      couponTitle = {};
      myHistory.forEach(function(coupon, index, array){
        couponHistory.forEach(function(item, ind, arr){
          if (coupon==item[0]) {
            //console.log(coupon, ind);
            couponTitle = {
              "優惠券名稱": couponData[ind][0] + ": " + couponData[ind][1],
              "優惠券時間": couponData[ind][3], 
              "url": "2-views/couponDetail.html?couponId=" + couponData[ind][0],
              "狀態": "已到期",  
            };
            dataTemp.push(couponTitle);
          }
        });
      });
   
      //console.log(dataTemp);
      
      data.success( dataTemp);      
    }
    
  }, 100);

}


function nullForNow(e) {
  console.log("nullForNow");
  //currentExample = nullForNow;
}

function removeView(e) {
  //console.log("removeView", e);  
  if (reloadcouponNeeded) {
    readCoupons(); 
    reloadcouponNeeded = false;
  }
  if (!e.view.element.data("persist")) {
    //console.log(e);
    
    // KPC: 找不到 persist 如何設定，只好用粗暴的做法
    if (e.view.id != "#forms") e.view.purge();
    
    //e.view.purge();
  }

}

function initSearch(e) {
  console.log("initSearch");
  var searchBox = e.view.element.find("#demos-search");

  searchBox.on("input", function () {
    searchForcoupon(searchBox.val()); //, product);
  });

  searchBox.on("blur", function () {
    //        if (searchBox.val() == "") {
    //            hideSearch();
    //        }
    searchBox.val("");
    searchForcoupon("");
    hideSearch();
  });
}

var desktop = !kendo.support.mobileOS;

function showSearch() {
  $("#normal").addClass("navbar-hidden");
  $("#search").removeClass("navbar-hidden");
  if (desktop) {
    setTimeout(function () {
      $("#demos-search").focus();
    });
  } else {
    $("#demos-search").focus();
  }
}

function hideSearch() {
  $("#normal").removeClass("navbar-hidden");
  $("#search").addClass("navbar-hidden");
}

function checkSearch(e) {
  if (!searchDataSource.filter()) {
    e.preventDefault();
    this.replace([]);
    $("#search-tooltip").show();
  } else {
    $("#search-tooltip").hide();
  }
}

function searchForcoupon(value){ 
  if (value.length < 2) {
        searchDataSource.filter(null);
    } else {
        var filter = { logic: "and", filters: []};
        var words = value.split(" ");

        for (var i = 0; i < words.length; i ++) {
            var word = words[i];
            filter.filters.push({
                logic: "or",
                filters: [
                    //{ field: "section", operator: "contains", value: word },
                    { field: "優惠券名稱", operator: "contains", value: word },
                    //{ field: "title", operator: titleContains(word) }
                ]
            });
        }

        searchDataSource.filter(filter);
    }
}

window.app = new kendo.mobile.Application($(document.body), {
  layout: "couponDiv",
  transition: "slide",
  skin: "nova",
  icon: {
    "": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "72x72": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "76x76": '@Url.Content("~/content/mobile/AppIcon76x76.png")',
    "114x114": '@Url.Content("~/content/mobile/AppIcon72x72@2x.png")',
    "120x120": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")',
    "152x152": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")'
  }
});