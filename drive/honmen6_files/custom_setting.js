//jQuery Mobile初期設定
$(document).on("mobileinit", function() {
	  
    //デフォルトのテーマ指定
    $.mobile.page.prototype.options.headerTheme  = "b";
    $.mobile.page.prototype.options.contentTheme = "d";
    $.mobile.page.prototype.options.footerTheme = "b";
     
    //ページ遷移のトランジション（アニメーション）効果を停止
    //$.mobile.defaultPageTransition = "none";
});


// タイマーにてタイムアウト監視処理
window.document.onmousedown = chk;
window.document.onkeydown   = chk;
window.document.onmousemove = chk;

window.document.touchstart = chk;
window.document.touchmove  = chk;

var timecount = 0;
var timeout;
var timer;

//カウンターリセット処理
function chk() {
	timecount = 0;
}

// タイムアウト監視タイマー追加
function addTimer(time) {
	timeout = time;
	clearInterval(timer);
	timer = setInterval('check_timeoutm()', 1000);
}
//メインページタイムアウト処理
function check_timeoutm() {
	timecount++;
	if (timecount >= timeout) {
		location.href = "./timeout.asp";
/*
		document.timeout.submit();
*/
	}
}

document.onmousedown = DisableContextMenu;
document.oncontextmenu=DisableOnContextMenu;

//右クリック処理
function DisableOnContextMenu(ev) {
	return false;
}

function DisableContextMenu(ev) {
	if (ev) {
		if (ev.button && ev.button == 2) {  // W3C DOM2
			return false;
		} else if (!ev.button && ev.which == 3) {  // N4
			return false;
		} else if (navigator.platform.indexOf("Mac")!=-1
		  && navigator.appName == "Netscape") {
			return false;
		}
	} else {
		if (event && event.button && event.button == 2) {  // IE
			return false;
		}
	}
}

if (navigator.appName == "Netscape"
  && !(navigator.platform.indexOf("Mac")!=-1)) {
	document.captureEvents(Event.MOUSEDOWN);
}
