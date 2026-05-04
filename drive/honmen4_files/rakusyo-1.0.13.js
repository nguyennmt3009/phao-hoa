// 初回表示の際、ルビOFFに
//$(document).on("pageinit", function () {
//	toggleRuby();
//});


// スコアパネルに関する動作設定
$(document).on("pageinit", function () {

	// スワイプ判定を200pxに（デフォルト30px）
	var agent = navigator.userAgent;
	if (agent.search(/Android/) != -1) {
		$.event.special.swipe.horizontalDistanceThreshold = 50;
	} else {
		$.event.special.swipe.horizontalDistanceThreshold = 200;
	}

	// スワイプ時設定  左スコアパネルが隠れている場合のみスワイプする
	$("div:jqmData(role='page')").on("swipeleft", function () {
		if (isSwipeOk()) nextQuestion();
	}).on("swiperight", function () {
		if (isSwipeOk()) prevQuestion();
	});

	// 左スコアパネル（#Qnavi）のリストビュー配下のリンク（idに設定された番号に該当する問題へ移動）
	$("#Qnavi li a").click(function () {
		jumpQuestion(Number($(this).attr("id")));
		$("#scoreboard").panel("close");
		return false;
	});
});

// ボタンクリック時動作設定
$(document).on("pageinit", function () {

	$(":jqmData(role='content') .ui-block-b img").click(function () { // 解答ボタン群クリック
		selectAnswer($(this));
		return false;
	})
	$(":jqmData(role='content') .ans_img img").click(function () { // 解答ボタン群クリック
		selectAnswer($(this));
		return false;
	})
	$("#prev_btn").click(function () {		// 「前へ」ボタンクリック
		prevQuestion();
	});
	$("#next_btn").click(function () {		// 「次へ」ボタンクリック
		nextQuestion();
	});
	$("#next_btn2").click(function () {		// 「次へ」ボタンクリック(危険予測用)
		nextQuestion();
	});
//	$("#ruby_btn").click(function () {		// 「ルビ」ボタンクリック
//		toggleRuby();
//	});
	$("#review_btn").click(function () {	// 「後で見直す」ボタンクリック
		clickReview();
//		nextQuestion();
	});
	$("#checkAnswer").click(function () {	// 「採点」ボタン押下後「OK」クリック
		if ( $("#bkmkBtn").length ) $("#bkmkBtn").hide(); // しおりボタン
		checkAnswer();
	});
	$("#checkBtn").click(function () {		// 「採点」ボタンクリック

		if (!isChecked) {
			if (endQ <= answerCount) $("#popupMsg").text("採点しますか？");
			$("#checkPopup").popup("open");
		}
	});
	$("#cancelBtn").click(function () {		// 「キャンセル」ボタンクリック
//		if (isChecked) $("#cancelMsg").text("終了しますか？");
		$("#cancelPopup").popup("open");
	});
	$("#scoreboard").panel({		// 左スコアパネルを開く際、ページトップへスクロールする
		open: function (event, ui) {
			$.mobile.silentScroll();
		}
	});
	$("#endOK").click(function () {		// 問題終了後の案内でOKクリック
		if ( $("#bkmkBtn").length ) $("#bkmkBtn").hide(); // しおりボタン
		checkAnswer();
	});
	$("#endNG").click(function () {		// 問題終了後の案内でNGクリック
		jumpQuestion(nowQ);
	});
	$("#selectDisplay").change(function() {	// 全問表示・不正解のみ表示
		selectDisplay();
	});

	$("#bkmkBtn").click(function () {		// 「しおり」ボタンクリック
		$("#bkmkPopup").popup("open");
	});
	$("#okBkmk").click(function () {		// 「しおり」登録ボタンクリック
		fBookMark();
	});
	$("#sendAgain").click(function () {	// 「再送信」ボタンクリック
		registerData();
	});
	$("#sendCancel").click(function () {	// 再送信「キャンセル」ボタンクリック
		sendCancel();
	});
});

var BTN_ARRAY = new Array("wrong", "right", "probawrong", "probaright");
var IMG_DIR = "/img/";
var DONE_IMG   =   CORRECT_IMG = IMG_DIR + "guide_right.png";
var REVIEW_IMG = INCORRECT_IMG = IMG_DIR + "guide_wrong.png";
var NO_ANSWER_IMG = IMG_DIR + "guide_nothing.png";
var DONE_STR      = "（解答済み）";
var REVIEW_STR    = "（見直す）";
var CORRECT_STR   = "（正解）";
var INCORRECT_STR = "（不正解）";
var NO_ANSWER_STR = "（未解答）";
var Q_STR = "問";
var CORRECT_TBL   = "score_done";
var INCORRECT_TBL = "score_review";
var NO_ANSWER_TBL = "score_notyet";


var answers; // 解答
var matches; // 正誤
var correctCount = 0; // 正解数
var answerCount  = 0; // 解答数

var disableAnswer = false;
var isImmediate = false; // 即時判定かどうか
var isMaybeLock = false; // たぶんボタンを表示しないかどうか
var displayType = '';

var nowQ = 1;			// 現問題インデックスNo(問題番号と必ずしも一致しない)
var startQ = 1;			// 開始問題インデックスNo
var endQ = 1;			// 終了問題インデックスNo
var isChecked = false;	// 採点が終了したかどうか
var isEndQ = false;		// 最後に到達して採点意思確認画面表示中かどうか

var limitTime = 1;	// 試験の制限時間（分）
var time = 0;		// 経過時間（分）
var examTimer;
var pct = 90;

var isEffectAnswer = true;
var isEffectGokaku = true;

// 表示データ初期化
function dataInitial() {
	$("#totalQ").text("全" + endQ + "問");
	$("#correctCount").text("0/" + endQ);
	$("#limitTime").text("10");
	if (isImmediate) {
		$("#review_btn").hide();
	} else {
		$("#correctDisplay").hide();
	}
}


function addExamLimitTimer(limit) {
	limitTime = limit;
	examTimer = setInterval("intervalmin()", 60000);// 分単位
	$("#spendTime").text(time);
}

function intervalmin() {
	time += 1;
	$("#spendTime").text(time);
	//タイムオーバー
	if (time == limitTime) {
		clearInterval(examTimer);

		// 採点
		checkAnswer();
	}
}

// 解答ボタンのリセット（未選択状態に）
function resetAnswer() {
	var strProba;
	if (isBranchQ(nowQ)) {
		var isAnswered = true;
		for (var j = 1 ; j <= 3 ; ++j) {
			if (answers[nowQ][j] == undefined) isAnswered = false;
			answers[nowQ][j] = undefined;
			for (var i = 0; i < BTN_ARRAY.length ; ++i) {
				strProba = i >= 2 ? "2" : "";
				var selector = $("#" + BTN_ARRAY[i] + "_" + nowQ + "_" + j);
				if (selector.size() > 0) { // 対象の存在確認
					selector.attr("src", IMG_DIR + BTN_ARRAY[i] + "_off" + strProba + ".png"); // ボタンをoffに
				}
			}
		}
		if (isAnswered) answerCount--;

	} else {
		if (answers[nowQ] != undefined) answerCount--;
		answers[nowQ] = undefined;
		for (var i = 0; i < BTN_ARRAY.length ; ++i) {
				strProba = i >= 2 ? "2" : "";
			var selector = $("#" + BTN_ARRAY[i] + "_" + nowQ);
			if (selector.size() > 0) {
				selector.attr("src", IMG_DIR + BTN_ARRAY[i] + "_off" + strProba + ".png"); // ボタンをoffに
			}
		}
	}
}

//---------------------------------------------
// 解答ボタンの制御
//---------------------------------------------
function selectAnswer(target) { // targetはJQueryセレクタ
	if (disableAnswer) return;

	var splitStr = target.attr("id").split('_');
	var targetId = splitStr[0];
	var targetNo = splitStr[1];
	var targetBranch;
	var hasBranch = false;


	if (isBranchQ(targetNo)) { // 枝問あり
		hasBranch = true;
		targetBranch = splitStr[2];

		if( !$.isArray(answers[targetNo]) ) answers[targetNo] = new Array(4); // idx:0は未使用
	}

	var strProba;
	for (var i = 0; i < BTN_ARRAY.length ; ++i) {
		strProba = i >= 2 ? "2" : "";
		if (targetId == BTN_ARRAY[i]) target.attr("src", IMG_DIR + targetId + "_sel" + strProba + ".png"); // 該当ボタンを選択状態に
		else {
			var selector = "#" + BTN_ARRAY[i] + "_" + targetNo;
			if ( hasBranch ) selector += "_" + targetBranch;
			$(selector).attr("src", IMG_DIR + BTN_ARRAY[i] + "_off" + strProba + ".png"); // その他ボタンはoffに
		}
	}

	// 左naviの該当問題部分を変更
	const naviDone = function(){
		$("#tbl" + targetNo).attr("class", CORRECT_TBL);

		var naviSelector = "#" + targetNo;
		$(naviSelector + " img").attr("alt", DONE_STR).attr("src", DONE_IMG); // リストビューアイコンの代替テキスト、アイコン変更
		$(naviSelector + " span").text("　" + DONE_STR);// リストビューの文字列変更
	}

	targetNo = Number(targetNo);
	var isAnswerRight = targetId.lastIndexOf("right") >= 0;

	if (hasBranch) {
		var isNewAnswer = (answers[targetNo][targetBranch] == undefined);

		answers[targetNo][targetBranch] = isAnswerRight + 0; // 解答を保存（+0 は数値変換）
		Answer_array[targetNo][targetBranch] = isAnswerRight ? 1 : 2;

		if (!isMaybeLock && targetId.indexOf("proba") == 0) {
			answers[targetNo][targetBranch] += 10; // 2進数　0:× 1:○ 2:たぶん× 3:たぶん○
			Probably_array[targetNo][targetBranch] = 1;
		}

		if (isNewAnswer
		&& answers[targetNo][1] >= 0
		&& answers[targetNo][2] >= 0
		&& answers[targetNo][3] >= 0) {
			answerCount++;
			naviDone();
		}
	} else {
		naviDone();
		if (answers[targetNo] == undefined) answerCount++;
		answers[targetNo] = isAnswerRight + 0; // 解答を保存（+0 は数値変換）

		Answer_array[targetNo][1] = isAnswerRight ? 1 : 2;
		if (!isMaybeLock && targetId.indexOf("proba") == 0) {
			answers[targetNo] += 10; // 2進数　0:× 1:○ 2:たぶん× 3:たぶん○
			Probably_array[targetNo][1] = 1;
		}
	}
	if (isImmediate) {	// 即時判定の場合
		disableAnswer = true;

		/*** 正誤判定  */
		checkAnswerByNo(targetNo)
		$("#answer" + targetNo).after($("#question" + targetNo)).show(); // 解答・解説部分を問題部分より前に移動して表示
		$("#Q" + targetNo).prepend("Q. "); // 問題文の前に"Q."を追加
	}
	// 即時判定以外は次の問題へ
	else {
		if ( hasBranch ) {
		  if ( answers[targetNo][1] >= 0
		  	&& answers[targetNo][2] >= 0
		  	&& answers[targetNo][3] >= 0 ) {
				  // nextQuestion();
				  $("#next_btn2").show();
				  var speed = 400;
				  var position = $("#next_btn2").offset().top;
				  $("body,html").animate({scrollTop:position},speed,"swing");
		  	}
		} else {
			nextQuestion();
		}
	}
}

// 採点する
function checkAnswer() {
	clearInterval(examTimer);

	$("#prev_btn").hide(); // 「前へ」ボタン
	$("#next_btn").hide(); // 「次へ」ボタン
	$("#review_btn").hide(); // 「後で見直す」ボタン
	$("#top_qnumber").hide(); // 問題番号
//	$("#ruby_btn").parent().before("問題文の確認は問題番号から！");
	$("#dataWindow").hide();
	$("#answerTitle").show();
	if ( isEffectAnswer )  $("#afterCheckNavi").show();
	
	$("#qa" + nowQ).hide();
	$("#endQ").hide();		// 問題終了後の採点案内
	$("#upperNavi").show();	// QA表示の選択

	for (var i = startQ ; i <= endQ ; ++i) {
		checkAnswerByNo(i); // 答え合わせ
//		$("#question" + i).hide(); // 問題を非表示に
		$("#qno" + i).show(); // 問題番号を表示
		if ( isEffectAnswer ) $("#qa" + i).show();　// QA枠を表示
	}
	// スワイプ動作を解除
	$("div:jqmData(role='page')").unbind("swipe-left").unbind("swipe-right");

	// 左スコアパネルの問題番号クリック時の動作を解除
	$("#Qnavi li a").unbind("click");
	$("#Qnavi li a").click(function () {
		var position = $("#qa" + $(this).attr("id")).offset().top;

		$("body,html").animate({ scrollTop: position }, "fast");
		$("#scoreboard").panel("close");

		return false;
	});
	$("#tbl_right + span").text(" 正解");
	$("#tbl_wrong + span").text(" 不正解");

	// 問題番号表示部分をクリックすると問題を表示する
	$("div .qnum-back").click(function () {
		var numStr = $(this).find(".qnum:first").text();// div.qnum-backの要素 span.qnum("問1"など)から問題番号を得る
		var num = numStr.replace(Q_STR, "");
		$("#question" + num).toggle();
	}).css("cursor", "pointer"); // カーソルはポインタに

	disableAnswer = true;
	isChecked = true;
	clearInterval(timer); // 無操作タイマークリア
	if ( displayType == '' || displayType == '1' || displayType == '6' ) registerData();
}


function getCorrect(qNo) { // 問題の正解を取得
	
	if (q_type_array[qNo] != undefined && Correct_array[qNo] != undefined ) {
		return (q_type_array[qNo] == "M") ? Correct_array[qNo] : Correct_array[qNo][1];
	}
	alert("正解が設定されていません");
	return -1;
	//return corrects[qNo];
}
function isBranchQ(qNo) { // 枝問題ありかどうか
	if (q_type_array[qNo] != undefined) {
		return q_type_array[qNo] == "M";
	}
	return false;
	//return $.isArray(corrects[qNo]);
}

// 問題ごとの答え合わせ
function checkAnswerByNo(qNo) {

	if ($("#answer" + qNo).isVisible()) return; // 解答表示している場合

	var isCorrect = getCorrect(qNo); // 問題の正解
	var strProba  = "";

	if ( isBranchQ(qNo) ) { // 枝問題あり
		if (!$.isArray(matches[qNo])) matches[qNo] = new Array(4); // idx:0は問としての正誤
		matches[qNo][0] = 1;

		for (var i = 1; i < isCorrect.length ; ++i) {
			matches[qNo][i] = 0;

			if ($.isArray(answers[qNo]) && $.isNumeric(answers[qNo][i])) { // 解答済み
				var ansWithProba = parseInt("0" + answers[qNo][i], 2); // 2進数を10進数数値へ変換
				var selector = "#" + BTN_ARRAY[ansWithProba] + "_" + qNo + "_" + i;
				strProba = ansWithProba >= 2 ? "2" : "";

				isCorrect[i] = (isCorrect[i] == 0) ? 1 : 0;
				if (!(isCorrect[i] ^ (ansWithProba & 1))) { // 正解＆解答 が 正＆正、誤＆誤　XOR == 0 (先にたぶんのビットを除去 →&1)
					$(selector).attr("src", IMG_DIR + "res_" + BTN_ARRAY[ansWithProba] + "_ok" + strProba + ".png");
					matches[qNo][i] = 1;
					if ( matches[qNo][0] == 1 ) matches[qNo][0] = 1; // 問全体正解を継続中
				} else {
					$(selector).attr("src", IMG_DIR + "res_" + BTN_ARRAY[ansWithProba] + "_ng" + strProba + ".png");
					if ( matches[qNo][0] == 1 ) matches[qNo][0] = 0; // 問全体正解を継続中
				}
			} else { // 未解答の場合
				$("#" + BTN_ARRAY[1] + "_" + qNo + "_" + i).parent().before("<img src=\"" + IMG_DIR + "res_answer_ng.png\" />");
				$("#" + BTN_ARRAY[2] + "_" + qNo + "_" + i).hide();
				$("#" + BTN_ARRAY[3] + "_" + qNo + "_" + i).hide();
				matches[qNo][i] = -1;
				matches[qNo][0] = -1; // 一つでも未解答があれば問全体未解答
				isCorrect[i] = (isCorrect[i] == 0) ? 1 : 0;
			}
			var answerStr = isCorrect[i] ? "right" : "wrong";
			var answerAlt = isCorrect[i] ? "○" : "×";
			$("#answerImg" + qNo + "_" + i).attr("src", IMG_DIR + "answer_" + answerStr + ".png").attr("alt", answerAlt);
		}
	} else {
		isCorrect = (isCorrect == 0) ? 1 : 0;
		if ($.isNumeric(answers[qNo])) { // 解答済み
			var ansWithProba = parseInt("0" + answers[qNo], 2); // 2進数を10進数数値へ変換
			var selector = "#" + BTN_ARRAY[ansWithProba] + "_" + qNo;
			strProba = ansWithProba >= 2 ? "2" : "";

			if (!(isCorrect ^ (ansWithProba & 1))) { // 正解＆解答 が 正＆正、誤＆誤　XOR == 0 (先にたぶんのビットを除去 →&1)
				$(selector).attr("src", IMG_DIR + "res_" + BTN_ARRAY[ansWithProba] + "_ok" + strProba + ".png");
				matches[qNo] = 1;
			} else {
				$(selector).attr("src", IMG_DIR + "res_" + BTN_ARRAY[ansWithProba] + "_ng" + strProba + ".png");
				matches[qNo] = 0;
			}
		} else { // 未解答の場合
			$("#" + BTN_ARRAY[1] + "_" + qNo).parent().before("<img src=\"" + IMG_DIR + "res_answer_ng.png\" />");
			$("#" + BTN_ARRAY[2] + "_" + qNo).hide();
			$("#" + BTN_ARRAY[3] + "_" + qNo).hide();
			matches[qNo] = -1;
		}
		var answerStr = isCorrect ? "right" : "wrong";
		var answerAlt = isCorrect ? "○" : "×";
		$("#answerImg" + qNo).attr("src", IMG_DIR + "answer_" + answerStr + ".png").attr("alt", answerAlt);
	}

	$("#answer" + qNo).show(); // 解答を表示


	// 左naviの該当問題部分を変更
	var matchType= CORRECT_TBL; // 正解
	var matchStr = CORRECT_STR;
	var matchImg = CORRECT_IMG;

	var matchTarget = isBranchQ(qNo) ? matches[qNo][0] : matches[qNo];

	if (matchTarget == 0) { // 不正解
		matchType= INCORRECT_TBL;
		matchStr = INCORRECT_STR;
		matchImg = INCORRECT_IMG;
	}
	else if (matchTarget == -1) { // 未解答
		matchType= NO_ANSWER_TBL;
		matchStr = NO_ANSWER_STR;
		matchImg = NO_ANSWER_IMG;
	}
	else { // 正解
		correctCount++;
		if ( isImmediate ) $("#correctCount").text(correctCount + "/" + endQ);
	}
	$("#tbl" + qNo).attr("class", matchType);

	var naviSelector = "#" + qNo;
	$(naviSelector + " img").attr("alt", matchStr).attr("src", matchImg); // リストビューアイコンの代替テキスト、アイコン変更
	$(naviSelector + " span").text("　" + matchStr);// リストビューの文字列変更
}




// あとで見直すボタン押下時処理
function clickReview() {
	// 左naviの該当問題部分を変更
	$("#Qnavi table #tbl" + nowQ).attr("class", INCORRECT_TBL);

	var naviSelector = "#Qnavi li a[id='" + nowQ + "']";
	$(naviSelector + " img").attr("src", REVIEW_IMG); // リストビューのアイコン変更
	$(naviSelector + " img").attr("alt", REVIEW_STR); // リストビューアイコンの代替テキスト変更
	$(naviSelector + " span").text("　" + REVIEW_STR);// リストビューの文字列変更

	// 本体定義配列
	if (isBranchQ(nowQ)) {
		for (var i = 1; i <= 3 ; ++i) {
			Answer_array[nowQ][i] = 3;
			Probably_array[nowQ][i] = 0;
		}
	} else {
		Answer_array[nowQ][1] = 3;
		Probably_array[nowQ][1] = 0;

	}
	resetAnswer();
}


// スワイプによる問題変更可能かどうか
function isSwipeOk() {
	if ( isEndQ ) return false;
	// 未採点で左スコアパネルが隠れている場合スワイプ可能
	return !isChecked && ($("#scoreboard").css("visibility") == "hidden");
}

function nextQuestion() {
	var nextQ = nowQ + 1;
//	if (nextQ > endQ) nextQ = startQ;
//	jumpQuestion(nextQ);
	if (nextQ <= endQ) {
		jumpQuestion(nextQ);
	} else {
		// 問題終了→最終画面（採点確認画面）表示
		isEndQ = true;
		clearTimeout(examTimer);
		if (endQ == answerCount) $("#endMsg").text("採点しますか？");
		$("#next_btn2").hide();
		$("#qa" + nowQ).hide();
		$("#upperNavi").hide();
		$("#endQ").show();
	}
}
function prevQuestion() {
	var nextQ = nowQ - 1;
	if (nextQ < startQ) nextQ = endQ;
	jumpQuestion(nextQ);
}
// 指定番号問題へ移動する
function jumpQuestion(targetQ) {
	if (targetQ < startQ || targetQ > endQ) return; // 範囲外は問題遷移しない
	if (isEndQ) { // 最終画面表示時
		$("#endQ").hide();
		$("#upperNavi").show();
		isEndQ = false;
		examTimer = setInterval("intervalmin()", 60000);// 分単位
	}
	$("#next_btn2").hide();
	if( targetQ != nowQ ) $("#qa" + nowQ).hide();
	$("#qnum").text("問" + targetQ);
	$("#qa" + targetQ).show();
	nowQ = targetQ;
	// 解答が表示されている場合、解答ボタンを無効にする
	disableAnswer = $("#answer" + targetQ).isVisible();
}
//---------------------------------------------
//ルビふりの表示非表示
//---------------------------------------------
//function toggleRuby() {
//	var showRuby;
//	var rubyBtn = $("#ruby_btn");
//	if (rubyBtn.attr("src") == IMG_DIR + "btn_ruby_off.png") {
//		showRuby = true;
//		rubyBtn.attr("src", IMG_DIR + "btn_ruby_on.png");
//	} else {
//		showRuby = false;
//		rubyBtn.attr("src", IMG_DIR + "btn_ruby_off.png");
//	}
//	if (!showRuby) $("rp").hide();
//	$("rt").toggle(showRuby);
//}


function selectDisplay() {
	var sel = $("#selectDisplay").val();
	if (sel == "1" || sel == "11") {	// 全問表示
		for ( var i=startQ ; i <= endQ ; ++i) {
			$("#qa" + i ).show();
		}
	}
	else if ( sel == "2" || sel == "12" ) { // 不正解のみ表示
		for (var i = startQ ; i <= endQ ; ++i) {
			if ($("#tbl" + i).attr("class") == CORRECT_TBL) {
					$("#qa" + i).hide();
			}
			else {
				$("#qa" + i).show();
			}
		}
	}
}

function setEndQ(cnt,pct) {
	endQ = cnt;
	answers = new Array(endQ);
	matches = new Array(endQ);
	this.pct = pct;
}
function setImmediate(isImmediate) {
	this.isImmediate = (isImmediate == 1);
}
function setMaybeLock(isMaybeLock) {
	this.isMaybeLock = (isMaybeLock == 0);
}
function setDisplayType(displayType) {
	this.displayType = displayType;
}

function setEffectDisplay(isEffectAnswer,isEffectGokaku) {
	this.isEffectAnswer = isEffectAnswer;
	this.isEffectGokaku = isEffectGokaku;
}

var isRecorded = false;

function registerData() {
	if (isRecorded) {
		alert("記録済み");
		return;
	}
	var arr_cnt;
	var right_flg;
	var proba_flg;
	var total_s = 0;
	var nopro_point = 0;
	var pro_point = 0;
	var not_answered = 0;
	//結果フラグを取得

	var w_ar_result = document.resultrec.ar_result.value;
	var w_ar_maybe_flag = document.resultrec.ar_maybe_flag.value;
	var w_ar_reply_flag = document.resultrec.ar_reply_flag.value;

	//解答をチェック
	point_cnt = 0;
	for (arr_cnt = 1; arr_cnt <= endQ ; arr_cnt++) {
		right_flg = true;
		proba_flg = false;
		nothing_flg = false;
		if (q_type_array[arr_cnt] == "M") {
			for (var i = 1; i <= 3; i++) {
				if ( matches[arr_cnt][i] != 1 ) right_flg = false;
				if (Probably_array[arr_cnt][i] == 1) proba_flg = true;

				w_ar_result += ( matches[arr_cnt][i] == 1 ) ? ",0" : ",1"; // 0:正解 1:不正解
				w_ar_maybe_flag += "," + Probably_array[arr_cnt][i]; // 0:通常 1:たぶん
				w_ar_reply_flag += "," + Answer_array[arr_cnt][i]; // 0:未解答 1:○ 2:× 3:後で見直す
			}
			total_s += 2;
			if (right_flg) {
				point_cnt += 2;
				if (proba_flg) pro_point += 2;
				else nopro_point += 2;
			}
			if ( matches[arr_cnt][0] == -1 ) nothing_flg = true;
		} else {
			if ( matches[arr_cnt] != 1 ) right_flg = false;
			if (Probably_array[arr_cnt][1] == 1) proba_flg = true;

			w_ar_result += right_flg ? ",0" : ",1";	// 0:正解 1:不正解
			w_ar_maybe_flag += "," + Probably_array[arr_cnt][1];
			w_ar_reply_flag += "," + Answer_array[arr_cnt][1];
			if ( matches[arr_cnt] == -1 ) nothing_flg = true;

			total_s++;
			if (right_flg) {
				point_cnt++;
				if (proba_flg) pro_point++;
				else nopro_point++;
			}
		}
		if ( nothing_flg ) not_answered++;
	}
	//初めての解答の場合は登録する
	var img;
	if (Math.round(((pro_point + nopro_point) / total_s) * 100) >= parseInt(pct)) {
		document.resultrec.result.value = 0;
		if ( test_type != 1 && displayType != '6' ) img = "gokaku"; //"answer_goukaku.png";
	} else {
		document.resultrec.result.value = 1;
		if ( test_type != 1 && displayType != '6' ) img = "fugokaku"; //"answer_fugoukaku.png";
	}
	if ( isEffectGokaku && img != undefined ) { //$("#answerTitle").after("<img src=\"/img/" + img + "\" style=\"display: block; margin: auto;\" />");
		if ( img === "gokaku" ) {
			$("#gokaku").show();
			$("#fugokaku").hide();
		}
		else if ( img === "fugokaku" ) {
			$("#gokaku").hide();
			$("#fugokaku").show();
		}
	}
	if ( isCheckLowAnswered() ) {
		var answered = endQ - not_answered;
		if ( Math.round((answered/endQ)*100) < 90 ){ // 解答率が低い場合
			$("#answerTitle").append("<br>解答数が少なかったため、データ登録は行いません(解答数："+ answered + ")");
			isRecorded = true;
			return;
		}
	}

	if ( !window.navigator.onLine ) {
		$('#checkPopup').on('popupafterclose', function() {
			$('#checkPopup').unbind('popupafterclose');
			offLineWaring(nopro_point);
		});
		$('#regPopup').on('popupafterclose', function() {
			$('#regPopup').unbind('popupafterclose');
			offLineWaring(nopro_point);
		});
	} else {
		$.mobile.loading("show");
		$.ajax({
				type: "POST",
				url: "register.asp",
				dataType: "html",
				timeout: 10000,
				data: {
					ar_result		: w_ar_result,
					ar_maybe_flag	: w_ar_maybe_flag,
					ar_reply_flag	: w_ar_reply_flag,
					total_s			: total_s,
					maybe_s			: pro_point,
					score			: nopro_point,

					ar_item_no			: $("input[name='ar_item_no']").val(),
					ar_sub_item_no		: $("input[name='ar_sub_item_no']").val(),
					ar_car_class		: $("input[name='ar_car_class']").val(),
					ar_classified_level	: $("input[name='ar_classified_level']").val(),
					ar_classified_no	: $("input[name='ar_classified_no']").val(),
					ar_category			: $("input[name='ar_category']").val(),
					question_cnt		: $("input[name='question_cnt']").val(),
					result				: $("input[name='result']").val(),
					school_code			: $("input[name='school_code']").val(),
					student_code		: $("input[name='student_code']").val(),
					sid					: $("input[name='sid']").val()

				}
		}).done(function (data) {
			$.mobile.loading("hide");
			$("#regPopup").after(data);
			isRecorded = true;
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			$.mobile.loading("hide");
			//$("#answerTitle").append("<br>データ登録できませんでした。得点:" + nopro_point + "点");
			$("#regMsg").html("データ登録できませんでした。<br />再送信しますか？<br />"
			 + new Date().toLocaleDateString('jp') + " " + new Date().toLocaleTimeString('jp')
			 + "<br />得点:" + nopro_point + "点");
			//$("#reg_time").html("(" + new Date().toLocaleDateString('jp') + " " + new Date().toLocaleTimeString('jp')+ ")");
			//$("#u_data").css("display","block");
			$("#regPopup").popup("open");
		});
		
	}
}
function sendCancel() {
	let str = $("#regMsg").text();
	str = str.substring(str.indexOf("得点"));
	$("#answerTitle").append("<br>データ登録できませんでした。" + str);//得点:" + nopro_point + "点");
	$("#reg_time").html("(" + new Date().toLocaleDateString('jp') + " " + new Date().toLocaleTimeString('jp')+ ")");
	$("#u_data").css("display","block");
}
function offLineWaring(point) {
	$("#regMsg").html("接続が見つかりません。<br/>ｲﾝﾀｰﾈｯﾄ接続を有効にしてください。<br />再送信しますか？<br />"
	+ new Date().toLocaleDateString('jp') + " " + new Date().toLocaleTimeString('jp')
	+ "<br />得点:" + point + "点");
	$("#regPopup").popup("open");
}
//---------------------------------------------
//しおりに登録を行う
//---------------------------------------------
function fBookMark(){
	var arr_cnt;
	var i;
	var w_ar_maybe_flag = '';
	var w_ar_reply_flag = '';


	//解答をチェック
	for(arr_cnt=1; arr_cnt <= endQ; arr_cnt++){
		if(q_type_array[arr_cnt]=="M"){
			for(i = 1; i <= 3; i++){
				w_ar_maybe_flag = w_ar_maybe_flag + ',' + Probably_array[arr_cnt][i];
				w_ar_reply_flag = w_ar_reply_flag + ',' +   Answer_array[arr_cnt][i];
			}
		}else{
			w_ar_maybe_flag = w_ar_maybe_flag + ',' + Probably_array[arr_cnt][1];
			w_ar_reply_flag = w_ar_reply_flag + ',' +   Answer_array[arr_cnt][1];
		}
	}

	if ( !window.navigator.onLine ) {
		$('#bkmkPopup').on('popupafterclose', function() {
			$('#bkmkPopup').unbind('popupafterclose');
			$('#errMsg').html('接続が見つかりません。<br/>ｲﾝﾀｰﾈｯﾄ接続を有効にしてください。');
			$('#errPopup').popup("open");
		});
	} else {

		$.mobile.loading("show");
		//しおり登録
		$.ajax({
				type: "POST",
				url: "bkmkreg.asp",
				dataType: "html",
				timeout: 10000,
				data: {
					ar_maybe_flag	: w_ar_maybe_flag,
					ar_reply_flag	: w_ar_reply_flag,

					ar_item_no			: $("input[name='bk_ar_item_no']").val(),
					ar_sub_item_no		: $("input[name='bk_ar_sub_item_no']").val(),
					ar_classified_level	: $("input[name='bk_ar_classified_level']").val(),
					ar_classified_no	: $("input[name='bk_ar_classified_no']").val(),
					ar_category			: $("input[name='bk_ar_category']").val(),
					question_cnt		: $("input[name='bk_question_cnt']").val(),
					regist_date			: $("input[name='bk_regist_date']").val(),
					seq_no				: $("input[name='bk_seq_no']").val(),
					dispnumber			: nowQ

				}
		}).done(function (data) {
			$.mobile.loading("hide");
			$("#bkmkPopup").after(data);
			$("#finCancel").hide();
			$("#cancelPopup").popup("open");
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			$.mobile.loading("hide");
			$('#errMsg').html('登録できませんでした。<br/>時間をおいてやり直してください。');
			$('#errPopup').popup("open");
			//$("#cancelMsg").text("登録できませんでした");
	//			alert("XMLHttpRequest : " + XMLHttpRequest.status + "\n"+"textStatus : " + textStatus + "\n" +  "errorThrown : " + errorThrown.message);
		});
	}
}

// セレクタのvisible判定 例）if ( $("#hoge").isVisible() ) { // 表示してます　 }
$.fn.isVisible = function () {
	return $.expr.filters.visible(this[0]);
};
