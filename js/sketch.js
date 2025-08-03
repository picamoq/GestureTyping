// ジェスチャーの種類
// top, top_right, top_left, bottom, bottom_right, bottom_left, left, right
// one, two, three, four, none
function getCode(left_gesture, right_gesture) {
  // ジェスチャー名をそのまま連結してユニークなコードにする
  return `${left_gesture}_${right_gesture}`;
}

function getCharacter(code) {
  // left_gesture_right_gesture の形でマッピング
  const codeToChar = {
    "bottom_bottom": "backspace", 
    "top_one": "a","top_two": "b","top_three": "c",
    "top_right_one": "d","top_right_two": "e","top_right_three": "f",
    "left_one": "g","left_two": "h","left_three": "i",
    "none_one": "j","none_two": "k","none_three": "l",
    "right_one": "m","right_two": "n","right_three": "o",
    "bottom_left_one": "p","bottom_left_two": "q","bottom_left_three": "r","bottom_left_four": "s",
    "bottom_one": "t","bottom_two": "u","bottom_three": "v",
    "bottom_right_one": "w","bottom_right_two": "x","bottom_right_three": "y","bottom_right_four": "z",
    "top_top": " ", // スペース
    // 必要に応じて他の組み合わせも追加
  };
  return codeToChar[code] || "";
}

// エラー分析のためのヘルパー関数
function getExpectedGestures(targetChar) {
  // 文字から期待される左手・右手のジェスチャーを返す
  const charToGestures = {
    "a": ["top", "one"], "b": ["top", "two"], "c": ["top", "three"],
    "d": ["top_right", "one"], "e": ["top_right", "two"], "f": ["top_right", "three"],
    "g": ["left", "one"], "h": ["left", "two"], "i": ["left", "three"],
    "j": ["none", "one"], "k": ["none", "two"], "l": ["none", "three"],
    "m": ["right", "one"], "n": ["right", "two"], "o": ["right", "three"],
    "p": ["bottom_left", "one"], "q": ["bottom_left", "two"], "r": ["bottom_left", "three"], "s": ["bottom_left", "four"],
    "t": ["bottom", "one"], "u": ["bottom", "two"], "v": ["bottom", "three"],
    "w": ["bottom_right", "one"], "x": ["bottom_right", "two"], "y": ["bottom_right", "three"], "z": ["bottom_right", "four"],
    " ": ["top", "top"],
    "backspace": ["bottom", "bottom"]
  };
  return charToGestures[targetChar] || [null, null];
}

function getBlockFromLeftGesture(leftGesture) {
  // 左手ジェスチャーからブロックを特定
  const gestureToBlock = {
    "top": "ABC/DEF", "top_right": "DEF", "left": "GHI", "none": "JKL", 
    "right": "MNO", "bottom_left": "PQRS", "bottom": "TUV/SPACE/BACKSPACE", "bottom_right": "WXYZ"
  };
  return gestureToBlock[leftGesture] || "unknown";
}

function analyzeError(targetChar, actualLeftGesture, actualRightGesture, inputChar) {
  if (!targetChar || targetChar === inputChar) return; // エラーなし
  
  const [expectedLeft, expectedRight] = getExpectedGestures(targetChar);
  if (!expectedLeft || !expectedRight) return;
  
  errorAnalysis.totalAttempts++;
  
  let errorType = null;
  let errorDetails = "";
  
  // ブロック選択エラー（左手）の判定
  if (actualLeftGesture !== expectedLeft) {
    errorAnalysis.blockSelectionErrors++;
    errorType = "block_selection";
    errorDetails = `Expected left: ${expectedLeft}, Got: ${actualLeftGesture}`;
  }
  // 文字選択エラー（右手）の判定
  else if (actualRightGesture !== expectedRight) {
    errorAnalysis.characterSelectionErrors++;
    errorType = "character_selection";
    errorDetails = `Expected right: ${expectedRight}, Got: ${actualRightGesture}`;
  }
  // 協調エラーの判定（両方間違っている場合）
  else if (actualLeftGesture !== expectedLeft && actualRightGesture !== expectedRight) {
    errorAnalysis.coordinationErrors++;
    errorType = "coordination";
    errorDetails = `Expected: ${expectedLeft}_${expectedRight}, Got: ${actualLeftGesture}_${actualRightGesture}`;
  }
  
  // エラーログに記録
  if (errorType) {
    errorAnalysis.errorLog.push({
      timestamp: millis(),
      targetChar: targetChar,
      actualChar: inputChar,
      errorType: errorType,
      details: errorDetails
    });
    
    console.log(`Error detected: ${errorType} - ${errorDetails}`);
    
    // リアルタイムでエラー分析表示を更新
    updateErrorAnalysisDisplay();
  }
}

function getErrorAnalysisReport() {
  const total = errorAnalysis.totalAttempts;
  return {
    blockSelectionErrors: errorAnalysis.blockSelectionErrors,
    characterSelectionErrors: errorAnalysis.characterSelectionErrors,
    coordinationErrors: errorAnalysis.coordinationErrors,
    totalAttempts: total,
    blockSelectionRate: total > 0 ? (errorAnalysis.blockSelectionErrors / total * 100).toFixed(1) : 0,
    characterSelectionRate: total > 0 ? (errorAnalysis.characterSelectionErrors / total * 100).toFixed(1) : 0,
    coordinationRate: total > 0 ? (errorAnalysis.coordinationErrors / total * 100).toFixed(1) : 0,
    totalErrorRate: total > 0 ? ((errorAnalysis.blockSelectionErrors + errorAnalysis.characterSelectionErrors + errorAnalysis.coordinationErrors) / total * 100).toFixed(1) : 0
  };
}

function updateErrorAnalysisDisplay() {
  const report = getErrorAnalysisReport();
  
  // HTMLの要素を更新
  const blockErrorsElem = document.getElementById('block-errors');
  const charErrorsElem = document.getElementById('char-errors');
  const coordErrorsElem = document.getElementById('coord-errors');
  const totalAttemptsElem = document.getElementById('total-attempts');
  const totalErrorRateElem = document.getElementById('total-error-rate');
  
  if (blockErrorsElem) blockErrorsElem.textContent = report.blockSelectionErrors;
  if (charErrorsElem) charErrorsElem.textContent = report.characterSelectionErrors;
  if (coordErrorsElem) coordErrorsElem.textContent = report.coordinationErrors;
  if (totalAttemptsElem) totalAttemptsElem.textContent = report.totalAttempts;
  if (totalErrorRateElem) totalErrorRateElem.textContent = report.totalErrorRate;
}

// HTMLからアクセスできるようにグローバルに公開
window.getErrorAnalysisReport = getErrorAnalysisReport;

// 入力サンプル文章 
let sample_texts = [
  "the quick brown fox jumps over the lazy dog",
];

// ゲームの状態を管理する変数
// notready: ゲーム開始前 （カメラ起動前）
// ready: ゲーム開始前（カメラ起動後）
// playing: ゲーム中
// finished: ゲーム終了後
// ready, playing, finished
let game_mode = {
  now: "notready",
  previous: "notready",
};

let game_start_time = 0;
let gestures_results;
let cam = null;
let p5canvas = null;

// エラー分析用の変数
let errorAnalysis = {
  blockSelectionErrors: 0,     // ブロック選択エラー（左手）
  characterSelectionErrors: 0, // 文字選択エラー（右手）
  coordinationErrors: 0,       // 協調エラー
  totalAttempts: 0,           // 総試行回数
  errorLog: []                // 詳細ログ
};

// 目標文字と現在の入力位置を追跡
let currentTargetIndex = 0;

function setup() {
  p5canvas = createCanvas(320, 240);
  p5canvas.parent('#canvas');

  // When gestures are found, the following function is called. The detection results are stored in results.
  let lastChar = "";
  let lastCharTime = millis();

  gotGestures = function (results) {
    gestures_results = results;

    if (results.gestures.length == 2) {
      if (game_mode.now == "ready" && game_mode.previous == "notready") {
        // ゲーム開始前の状態から、カメラが起動した後の状態に変化した場合
        game_mode.previous = game_mode.now;
        game_mode.now = "playing";
        game_start_time = millis(); // ゲーム開始時間を記録
        document.querySelector('input').value = ""; // 入力欄をクリア
        game_start_time = millis(); // ゲーム開始時間を記録
        
        // エラー分析をリセット
        errorAnalysis = {
          blockSelectionErrors: 0,
          characterSelectionErrors: 0,
          coordinationErrors: 0,
          totalAttempts: 0,
          errorLog: []
        };
        
        // エラー分析カードを非表示
        const errorCard = document.getElementById('error-analysis-card');
        if (errorCard) {
          errorCard.style.display = 'none';
        }
        
        // ユーザビリティアンケートカードを非表示
        const surveyCard = document.getElementById('usability-survey-card');
        if (surveyCard) {
          surveyCard.style.display = 'none';
        }
      }
      let left_gesture;
      let right_gesture;
      if (results.handedness[0][0].categoryName == "Left") {
        left_gesture = results.gestures[0][0].categoryName;
        right_gesture = results.gestures[1][0].categoryName;
      } else {
        left_gesture = results.gestures[1][0].categoryName;
        right_gesture = results.gestures[0][0].categoryName;
      }
      let code = getCode(left_gesture, right_gesture);
      let c = getCharacter(code);
      
      // 現在の目標文字を取得
      let currentTarget = "";
      if (sample_texts.length > 0) {
        const currentInput = document.querySelector('input').value;
        if (currentInput.length < sample_texts[0].length) {
          currentTarget = sample_texts[0][currentInput.length];
        }
      }

      let now = millis();
      let threshold;
      if (c === "backspace" || c === " ") {
        threshold = 780; // 0.85秒
      } else {
        threshold = 700; 
      }
      if (c === lastChar) {
        if (c === "backspace") {
          // backspaceはthreshold経過時に連続入力可
          if (now - lastCharTime > threshold) {
            // エラー分析（backspaceは目標文字との比較をスキップ）
            typeChar(c);
            lastCharTime = now;
          }
        } else if (c === " ") {
          // スペースは絶対に連続入力不可（直前がスペースのときは何もしない）
          // 何もしない
        } else {
          // 削除・スペース以外は1.5秒以上同じジェスチャーが続いた場合のみ連続入力可
          if (now - lastCharTime > 1500) {
            // エラー分析
            if (currentTarget && c !== currentTarget) {
              analyzeError(currentTarget, left_gesture, right_gesture, c);
            }
            typeChar(c);
            lastCharTime = now;
          }
        }
      } else {
        // threshold経過時のみ新しい文字を入力許可
        if (now - lastCharTime > threshold) {
          // 新しい文字がスペースの場合、直前がスペースでなければ入力許可
          if (c === " ") {
            if (lastChar !== " ") {
              // エラー分析
              if (currentTarget && c !== currentTarget) {
                analyzeError(currentTarget, left_gesture, right_gesture, c);
              }
              typeChar(c);
              lastChar = c;
              lastCharTime = now;
            } else {
              // 直前がスペースなら何もしない
            }
          } else {
            // エラー分析
            if (currentTarget && c !== currentTarget) {
              analyzeError(currentTarget, left_gesture, right_gesture, c);
            }
            typeChar(c);
            lastChar = c;
            lastCharTime = now;
          }
        } else {
          // 新しい文字だが、threshold未満ならlastCharは更新しない
        }
      }
    }

  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ここから下は課題制作にあたって編集してはいけません。
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 入力欄に文字を追加する場合は必ずこの関数を使用してください。
function typeChar(c) {
  if (c === "") {
    console.warn("Empty character received, ignoring.");
    return;
  }
  // inputにフォーカスする
  document.querySelector('input').focus();
  // 入力欄に文字を追加または削除する関数
  const input = document.querySelector('input');
  if (c === "backspace") {
    input.value = input.value.slice(0, -1);
  } else {
    input.value += c;
  }

  let inputValue = input.value;
  // #messageのinnerTextを色付けして表示
  const messageElem = document.querySelector('#message');
  const target = messageElem.innerText;
  let matchLen = 0;
  for (let i = 0; i < Math.min(inputValue.length, target.length); i++) {
    if (inputValue[i] === target[i]) {
      matchLen++;
    } else {
      break;
    }
  }
  const matched = target.slice(0, matchLen);
  const unmatched = target.slice(matchLen);
  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`);
  messageElem.innerHTML =
    `<span style="background-color:lightgreen">${matched}</span><span style="background-color:transparent">${unmatched}</span>`;

  // 背景色警告処理
  const body = document.body;
  if (inputValue.length > 0 && inputValue !== target.slice(0, inputValue.length)) {
    body.style.background = '#ffe5e5'; // 警告色（薄い赤）
  } else {
    body.style.background = '';
  }

  // もしvalueの値がsample_texts[0]と同じになったら、[0]を削除して、次のサンプル文章に移行する。配列長が0になったらゲームを終了する
  if (document.querySelector('input').value == sample_texts[0]) {
    sample_texts.shift(); // 最初の要素を削除
    console.log(sample_texts.length);
    if (sample_texts.length == 0) {
      // サンプル文章がなくなったらゲーム終了
      game_mode.previous = game_mode.now;
      game_mode.now = "finished";
      document.querySelector('input').value = "";
      const elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
      
      // エラー分析レポートを生成
      const report = getErrorAnalysisReport();
      console.log("=== エラー分析レポート ===");
      console.log(`総試行回数: ${report.totalAttempts}`);
      console.log(`ブロック選択エラー: ${report.blockSelectionErrors} (${report.blockSelectionRate}%)`);
      console.log(`文字選択エラー: ${report.characterSelectionErrors} (${report.characterSelectionRate}%)`);
      console.log(`協調エラー: ${report.coordinationErrors} (${report.coordinationRate}%)`);
      console.log(`総エラー率: ${report.totalErrorRate}%`);
      
      // エラー分析カードを表示
      const errorCard = document.getElementById('error-analysis-card');
      if (errorCard) {
        errorCard.style.display = 'block';
        updateErrorAnalysisDisplay();
      }
      
      // ユーザビリティアンケートを表示
      setTimeout(() => {
        const surveyCard = document.getElementById('usability-survey-card');
        if (surveyCard) {
          surveyCard.style.display = 'block';
          surveyCard.scrollIntoView({ behavior: 'smooth' });
        }
      }, 2000); // 2秒後にアンケートを表示
      
      document.querySelector('#message').innerHTML = `
        Finished: ${elapsedSec} sec<br>
        <small>詳細なエラー分析は下記のカードをご確認ください</small>
      `;
    } else {
      // 次のサンプル文章に移行
      document.querySelector('input').value = "";
      document.querySelector('#message').innerText = sample_texts[0];
    }
  }
}


function startWebcam() {
  // If the function setCameraStreamToMediaPipe is defined in the window object, the camera stream is set to MediaPipe.
  if (window.setCameraStreamToMediaPipe) {
    cam = createCapture(VIDEO);
    cam.hide();
    cam.elt.onloadedmetadata = function () {
      window.setCameraStreamToMediaPipe(cam.elt);
    }
    p5canvas.style('width', '100%');
    p5canvas.style('height', 'auto');
  }

  if (game_mode.now == "notready") {
    game_mode.previous = game_mode.now;
    game_mode.now = "ready";
    document.querySelector('#message').innerText = sample_texts[0];
    game_start_time = millis();
    
    // エラー分析カードを非表示
    const errorCard = document.getElementById('error-analysis-card');
    if (errorCard) {
      errorCard.style.display = 'none';
    }
    
    // ユーザビリティアンケートカードを非表示
    const surveyCard = document.getElementById('usability-survey-card');
    if (surveyCard) {
      surveyCard.style.display = 'none';
    }
  }
}


function draw() {
  background(127);
  if (cam) {
    image(cam, 0, 0, width, height);
  }
  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  if (gestures_results) {
    if (gestures_results.landmarks) {
      for (const landmarks of gestures_results.landmarks) {
        for (let landmark of landmarks) {
          noStroke();
          fill(100, 150, 210);
          circle(landmark.x * width, landmark.y * height, 10);
        }
      }
    }

    // ジェスチャーの結果を表示する
    for (let i = 0; i < gestures_results.gestures.length; i++) {
      noStroke();
      fill(255, 0, 0);
      textSize(10);
      let name = gestures_results.gestures[i][0].categoryName;
      let score = gestures_results.gestures[i][0].score;
      let right_or_left = gestures_results.handednesses[i][0].hand;
      let pos = {
        x: gestures_results.landmarks[i][0].x * width,
        y: gestures_results.landmarks[i][0].y * height,
      };
      textSize(20);
      fill(0);
      textAlign(CENTER, CENTER);
      text(name, pos.x, pos.y);
    }
  }

  if (game_mode.now == "notready") {
    // 文字の後ろを白で塗りつぶす
    let msg = "Press the start button to begin";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "ready") {
    let msg = "Waiting for gestures to start";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "playing") {
    // ゲーム中のメッセージ
    let elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
    let msg = `${elapsedSec} [s]`;
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = th;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "finished") {
    // ゲーム終了後のメッセージ
    let msg = "Game finished!";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }

}


