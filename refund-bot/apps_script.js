/**
 * 返金ステータス Discord 通知 Bot
 * ----------------------------------------
 * ダッシュボードシートの情報を毎朝 Discord に通知します。
 *
 * 【初期設定】
 * 1. DISCORD_WEBHOOK_URL に Webhook URL を貼り付ける
 * 2. 「保存」してから「実行 → sendRefundReport」でテスト
 * 3. 問題なければトリガーを設定（下の setupTrigger 関数を実行）
 */

// ================================
// ★ ここだけ変更してください ★
// ================================
var DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/ここに貼り付け";
var SPREADSHEET_URL     = "https://docs.google.com/spreadsheets/d/1t5m21BI9fRKyiwWHicdjjRiuNvzJgFJvmyvx1GDBVPo/edit?gid=1409127283#gid=1409127283";
// ================================

var DASHBOARD_SHEET = "ダッシュボード";

function sendRefundReport() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DASHBOARD_SHEET);

  if (!sheet) {
    sendToDiscord("⚠️ **返金Botエラー**\nシート「" + DASHBOARD_SHEET + "」が見つかりません。\nシート名を確認してください。");
    return;
  }

  // ── ダッシュボードの値を取得 ──
  var b = function(row) { return sheet.getRange(row, 2).getValue(); };

  var overdueCount    = b(2);   // 発生から1週間以上経過（要対応）の件数
  var overdueNos      = b(3);   // 要対応の返金番号（1週間経過）
  var overdueAmount   = b(4);   // 1週間以上経過した要対応の合計金額
  var highValueCount  = b(6);   // 高額未対応案件（¥5万以上）の件数
  var totalPending    = b(8);   // 現状溜まっている返金金額（合計）
  var incompleteCount = b(9);   // 未完了（要対応含む）の件数
  var incompleteAmt   = b(10);  // 要対応（未完了）件数の合計金額
  var latestDate      = b(12);  // 最新の返金依頼日
  var oldestDate      = b(13);  // 最古の未完了依頼日
  var avgDays         = b(15);  // 平均対応日数（完了分）

  // ── 未完了案件一覧（18行目がヘッダー、19行目から）──
  var lastRow = sheet.getLastRow();
  var caseLines = [];

  if (lastRow >= 19) {
    var caseData = sheet.getRange(19, 1, lastRow - 18, 9).getValues();
    for (var i = 0; i < caseData.length; i++) {
      var row = caseData[i];
      var refundNo  = row[0]; // 返金番号
      var entryDate = row[1]; // 記入日
      var type      = row[2]; // 卸/小売
      var orderNo   = row[3]; // 注文番号
      var priority  = row[4]; // 重要度
      var staff     = row[5]; // 記入者
      var status    = row[6]; // ステータス
      var amount    = row[8]; // 返金金額

      if (!refundNo) continue; // 空行スキップ

      // 日付整形
      var dateStr = "";
      if (entryDate instanceof Date) {
        dateStr = Utilities.formatDate(entryDate, Session.getScriptTimeZone(), "MM/dd");
      } else {
        dateStr = String(entryDate);
      }

      // 金額整形
      var amtStr = (amount !== "" && amount !== null)
        ? "¥" + Number(amount).toLocaleString()
        : "金額未入力";

      // 重要度に応じた絵文字
      var priorityEmoji = priority === "高" ? "🔴" : priority === "中" ? "🟡" : "🟢";

      caseLines.push(
        priorityEmoji + " **No." + refundNo + "** | " + type + " | " + dateStr +
        " | " + staff + " | " + amtStr +
        (orderNo ? " | 注文: " + orderNo : "")
      );
    }
  }

  // ── メッセージ組み立て ──
  var today   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy年MM月dd日");
  var lines   = [];

  lines.push("## 📋 返金ステータス日次レポート（" + today + "）");
  lines.push("🔗 [ダッシュボードを開く](" + SPREADSHEET_URL + ")");
  lines.push("");

  // 緊急アラート（遅延 or 高額）
  var hasAlert = (overdueCount > 0 || highValueCount > 0);
  if (hasAlert) {
    lines.push("### 🚨 要注意アラート");
    if (overdueCount > 0) {
      lines.push("- **1週間以上未対応: " + overdueCount + "件**（合計: ¥" + Number(overdueAmount).toLocaleString() + "）");
      if (overdueNos && overdueNos !== "無し") {
        lines.push("  > 返金番号: " + overdueNos);
      }
    }
    if (highValueCount > 0) {
      lines.push("- **高額未対応（¥5万以上）: " + highValueCount + "件**");
    }
    lines.push("");
  }

  // サマリー
  lines.push("### 📊 サマリー");
  lines.push("- 未完了件数（要対応含む）: **" + incompleteCount + "件**");
  lines.push("- 未完了合計金額: **¥" + Number(incompleteAmt).toLocaleString() + "**");
  lines.push("- 未処理返金残高合計: **¥" + Number(totalPending).toLocaleString() + "**");
  lines.push("- 最新依頼日: " + formatDate(latestDate));
  lines.push("- 最古未完了依頼日: " + formatDate(oldestDate));
  lines.push("- 平均対応日数（完了分）: " + avgDays + "日");
  lines.push("");

  // 未完了案件一覧
  if (caseLines.length > 0) {
    lines.push("### 📝 未完了案件一覧（" + caseLines.length + "件）");
    lines = lines.concat(caseLines);
  } else {
    lines.push("### ✅ 未完了案件: なし");
  }

  var message = lines.join("\n");

  // ── Discord 送信 ──
  sendToDiscord(message);
  Logger.log("送信完了: " + new Date());
}

// 日付整形ヘルパー
function formatDate(val) {
  if (!val || val === "") return "—";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy/MM/dd");
  }
  return String(val);
}

// Discord Webhook 送信（2000文字超えは分割）
function sendToDiscord(message) {
  var chunks = [];
  while (message.length > 1900) {
    var idx = message.lastIndexOf("\n", 1900);
    if (idx === -1) idx = 1900;
    chunks.push(message.substring(0, idx));
    message = message.substring(idx).replace(/^\n/, "");
  }
  chunks.push(message);

  for (var i = 0; i < chunks.length; i++) {
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ content: chunks[i] })
    };
    UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
  }
}

/**
 * 毎朝9時の自動トリガーを設定する関数
 * ★ 一度だけ手動で実行してください（メニュー「実行」→「setupTrigger」）
 */
function setupTrigger() {
  // 既存のトリガーを削除（重複防止）
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendRefundReport") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 毎日 9:00〜10:00 に実行
  ScriptApp.newTrigger("sendRefundReport")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  Logger.log("✅ トリガー設定完了: 毎朝9時に自動実行されます");
}
