let wordsList = [];
let currentWordIndex = 0;
let inputHistory = [];
let currentInput = "";
let time = 0;
let timer = null;
let testActive = false;
let testStart, testEnd;
let wpmHistory = [];
let currentCommands = commands;

let accuracyStats = {
    correct: 0,
    incorrect: 0
}

let config = {
    showKeyTips: true,
    showLiveWpm: true,
    smoothCaret: true,
    quickTab: false,
    punctuation: true,
    words: 100,
    time: 30,
    mode: "words"
}

let customText = "the quick brown fox jumps over the lazy dog";

function test() {
    $("#resultScreenshot").removeClass("hidden");

    html2canvas($("#resultScreenshot"), {
        onclone: function(clonedDoc) {
            clonedDoc.getElementById("resultScreenshot").style.display = "block";
        }
    }).then((canvas) => {
        $("#resultScreenshot").removeClass("hidden");

        document.body.appendChild(canvas);
    });
}

function setFocus(foc) {
    if (foc) {
        // focus = true;

        $("#top").addClass("focus");
        $("#bottom").addClass("focus");
        $("body").css("cursor", "none");
    } else {
        startCaretAnimation();

        $("#top").removeClass("focus");
        $("#bottom").removeClass("focus");
        $("body").css("cursor", "default");
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function initWords() {
    testActive = false;
    wordsList = [];
    currentWordIndex = 0;
    
    accuracyStats = {
        correct: 0,
        incorrect: 0
    }
    
    inputHistory = [];
    currentInput = "";

    if (config.mode == "time" || config.mode == "words") {
        let wordsBound = config.mode == "time" ? 50 : config.words;
        let randomWord = words[Math.floor(Math.random() * words.length)];

        wordsList.push(randomWord);

        for (let i = 1; i < wordsBound; i++) {
            randomWord = words[Math.floor(Math.random() * words.length)];
            previousWord = wordsList[i - 1];

            while (randomWord == previousWord) {
                randomWord = words[Math.floor(Math.random() * words.length)];
            }

            wordsList.push(randomWord);
        }
    } else if (config.mode == "custom") {
        let w = customText.split(" ");

        for (let i = 0; i < w.length; i++) {
            wordsList.push(w[i]);
        }
    }

    if (config.punctuation) {
        wordsList = buildSentences(wordsList);
    }

    showWords();
}

function getLastChar(word) {
    return word.charAt(word.length - 1);
}

function buildSentences() {
    let returnList = [];

    $.each(wordsList, (index, word) => {
        let previousWord = returnList[index - 1];

        if (index == 0 || getLastChar(previousWord) == ".") {
            // sempre colocar a primeira palavra em maiúscula ou se houver um ponto
            word = capitalizeFirstLetter(word);
        } else if (
            // 10% de chance de adicionar um ponto ou se for a última palavra
            (Math.random() < 0.1 && getLastChar(previousWord) != "." && index != wordsList.length - 2) || index == wordsList.length - 1 ) {
            word += ".";
        } else if (Math.random() < 0.01 &&
            getLastChar(previousWord) != "," &&
            getLastChar(previousWord) != ".") {
            // 1% de chance de adicionar cotações
            word = `"${word}"`;
        } else if (Math.random() < 0.01) {
            // 1% de chance de adicionar dois pontos
            word = word + ":";
        } else if (
            Math.random() < 0.01 &&
            getLastChar(previousWord) != "," &&
            getLastChar(previousWord) != "." &&
            previousWord != "-"
        ) {
            // 1% de chance de adicionar um travessão
            word = "-";
        } else if (
            Math.random() < 0.2 && getLastChar(previousWord) != ","
        ) {
            // 2% de chance de adicionar uma vírgula
            word += ",";
        }

        returnList.push(word);
    })

    return returnList;
}

function addWord() {
    let randomWord = words[Math.floor(Math.random() * words.length)];

    wordsList.push(randomWord);

    let w = "<div class='word'>";

    for (let c = 0; c < randomWord.length; c++) {
        w += "<letter>" + randomWord.charAt(c) + "</letter>";
    }

    w += "</div>";

    $("#words").append(w);
}

function showWords() {
    $("#words").empty();

    if (config.mode == "words" || config.mode == "custom") {
        $("#words").css("height", "auto");

        for (let i = 0; i < wordsList.length; i++) {
            let w = "<div class='word'>";

            for (let c = 0; c < wordsList[i].length; c++) {
                w += "<letter>" + wordsList[i].charAt(c) + "</letter>";
            }

            w += "</div>";

            $("#words").append(w);
        }
    } else if (config.mode == "time") {
        $("#words").css("height", "78px").css("overflow", "hidden");

        for (let i = 0; i < wordsList.length; i++) {
            let w = "<div class='word'>";

            for (let c = 0; c < wordsList[i].length; c++) {
                w += "<letter>" + wordsList[i].charAt(c) + "</letter>";
            }

            w += "</div>";

            $("#words").append(w);
        }
    }

    updateActiveElement();
    updateCaretPosition();
}

function updateActiveElement() {
    $("#words .word").removeClass("active");

    $($("#words .word")[currentWordIndex])
        .addClass("active")
        .removeClass("error");
}

function highlightMissedLetters() {
    let currentWord = wordsList[currentWordIndex];

    $(".word.active letter").addClass("incorrect");

    for (let i = 0; i < currentInput.length; i++) {
        if (currentWord[i] == currentInput[i]) {
            $($(".word.active letter")[i])
                .removeClass("incorrect")
                .addClass("correct");
        }
    }
}

function highlightBadWord() {
    $(".word.active").addClass("error");
}

function hideMissedLetters() {
    let currentWord = wordsList[currentWordIndex];

    $(".word.active letter").addClass("missing");

    for (let i = 0; i < currentInput.length; i++) {
        if (currentWord[i] == currentInput[i]) {
            $($(".word.active letter")[i])
                .removeClass("missing")
                .addClass("incorrect");
        }
    }
}

function hideCaret() {
    $("#caret").addClass("hidden");
}

function showCaret() {
    updateCaretPosition();

    $("#caret").removeClass("hidden");

    startCaretAnimation();
}

function stopCaretAnimation() {
    $("#caret").css("animation-name", "none");
    $("#caret").css("background-color", "var(--caret-color)");
}

function startCaretAnimation() {
    $("#caret").css("animation-name", "caretFlash");
}

function showTimer() {
    $("#timerWrapper").css("opacity", 1);
}

function hideTimer() {
    $("#timerWrapper").css("opacity", 0);
}

function updateCaretPosition() {
    let caret = $("#caret");
    let activeWord = $("#words .word.active");
    let inputLen = currentInput.length;
    let currentLetterIndex = inputLen - 1;

    if (currentLetterIndex == -1) {
        currentLetterIndex = 0;
    }

    let currentLetter = $($("#words .word.active letter")[currentLetterIndex]);
    let currentLetterPos = currentLetter.position();
    let letterHeight = currentLetter.height();

    let newTop = 0;
    let newLeft = 0;

    if (inputLen == 0) {
        // caret.css({
        //     top: currentLetterPos.top - letterHeight / 4,
        //     left: currentLetterPos.left - caret.width() / 2
        // });

        newLeft = currentLetterPos.left - caret.width() / 2;
    } else {
        // caret.css({
        //     top: currentLetterPos.top - letterHeight / 4,
        //     left: currentLetterPos.left + currentLetter.width() - caret.width() / 2
        // });

        newLeft = currentLetterPos.left + currentLetter.width() - caret.width() / 2;
    }

    let duration = 0;

    // if (config.smoothCaret && Math.round(caret.position().top) == Math.round(newTop)) {
    //     duration = 100;
    // }

    if (config.smoothCaret) {
        duration = 100;
    }

    if (Math.round(caret.position().top) != Math.round(newTop)) {
        caret.css("top", newTop);

        duration = 10;
    }

    caret.stop(true, true).animate({
        top: newTop,
        left: newLeft
    }, duration)
}

function saveConfigToCookie() {
    let d = new Date();

    d.setFullYear(d.getFullYear() + 1)

    $.cookie("config",JSON.stringify(config),{expires:d})
}

function loadConfigFromCookie() {
    let newConfig = $.cookie('config');

    if (newConfig) {
        newConfig = JSON.parse(newConfig);
        config = newConfig;

        setQuickTabMode(config.quickTab);
        setPunctuation(config.punctuation);
        setKeyTips(config.showKeyTips);

        changeTimeConfig(config.time);
        changeWordCount(config.words);
        changeMode(config.mode);

        restartTest();
    }
}

function calculateStats() {
    if (config.mode == "words") {
        if (inputHistory.length != wordsList.length) return;
    }

    let chars = countChars();
    let totalChars = chars.allCorrectChars + chars.incorrectChars + chars.extraChars + chars.missedChars;
    let testNow = Date.now();
    let testSeconds = (testNow - testStart) / 1000;

    let wpm = Math.round((chars.correctWordChars * (60 / testSeconds)) / 5);
    let acc = Math.round((accuracyStats.correct / (accuracyStats.correct + accuracyStats.incorrect)) * 100);

    return {
        wpm: wpm, acc: acc, correctChars: chars.allCorrectChars, incorrectChars: chars.incorrectChars+chars.extraChars+chars.missedChars
    };
}

function countChars() {
    let correctWordChars = 0;
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    for (let i = 0; i < inputHistory.length; i++) {
        if (inputHistory[i] == wordsList[i]) {
            // a palavra está correta
            // +1 para espaço
            correctWordChars += wordsList[i].length + 1;
            correctChars += wordsList[i].length;
        } else if (inputHistory[i].length >= wordsList[i].length) {
            // muitos caracteres
            for (let c = 0; c < inputHistory[i].length; c++) {
                if (c < wordsList[i].length) {
                    // em char que ainda possui um par de lista de palavras
                    if (inputHistory[i][c] == wordsList[i][c]) {
                        correctChars++;
                    } else {
                        incorrectChars++;
                    }
                } else {
                    // no char que é extra
                    extraChars++;
                }
            }
        } else {
            // caracteres insuficientes
            for (let c = 0; c < wordsList[i].length; c++) {
                if (c < inputHistory[i].length) {
                    // em char que ainda possui um par de lista de palavras
                    if (inputHistory[i][c] == wordsList[i][c]) {
                        correctChars++;
                    } else {
                        incorrectChars++;
                    }
                } else {
                    // no char que é extra
                    missedChars++;
                }
            }
        }
    }

    return {
        correctWordChars: correctWordChars,
        allCorrectChars: correctChars,
        incorrectChars: incorrectChars,
        extraChars: extraChars,
        missedChars: missedChars
    }
}

function liveWPM() {
    let correctWordChars = 0;

    for (let i = 0; i < inputHistory.length; i++) {
        if (inputHistory[i] == wordsList[i]) {
            // a palavra está correta
            // +1 para espaço
            correctWordChars += wordsList[i].length + 1;
        }
    }

    let testNow = Date.now();
    let testSeconds = (testNow - testStart) / 1000;

    wpm = (correctWordChars * (60 / testSeconds)) / 5;

    return Math.round(wpm);
}

function showResult() {
    testEnd = Date.now();
    testActive = false;

    let stats = calculateStats();

    $("#top .result .wpm .val").text(stats.wpm);
    $("#top .result .acc .val").text(Math.round(stats.acc) + "%");
    $("#top .result .key .val").text(stats.key);
    $("#top .result .testmode .mode1").text(config.mode);

    if (config.mode == "time") {
        $("#top .result .testmode .mode2").text(config.time);
    } else if (config.mode == "words") {
        $("#top .result .testmode .mode2").text(config.words);
    }

    if (config.punctuation) {
        $("#top .result .testmode .mode3").text("punc.");
    } else {
        $("#top .result .testmode .mode3").text("");
    }

    $("#top .config").addClass("hidden");

    $("#top .result")
        .removeClass("hidden")
        .animate({ opacity: 1 }, 0, () => {
            setFocus(false);
        });

    // $("#top #liveWpm").css("opacity", 0);

    hideCaret();

    // mostrar todas as palavras após o término do teste
    //
    // delWords = false;
    //
    // $.each($(".word"), (index, el) => {
    //    if (delWords) {
    //        $(el).remove();
    //    } else {
    //        $(el).removeClass("hidden");
    //
    //        if ($(el).hasClass("active")) {
    //            delWords = true;
    //        }
    //    }
    // });
    //
    // newHeight = $(".word.active").outerHeight(true) + $(".word.active").position().top - $("#words").position().top;
    //
    // $(".word.active").addClass("hidden");
    //
    // $("#words").stop(true, true).css("opacity", "1").animate(
    //     {
    //         opacity: 1,
    //         height: newHeight
    //     }, 250
    // );

    console.log(wpmHistory);
}

var ctx = $("#wpmChart");

var wpmOverTimeChart = new Chart(ctx, {
    type: 'line',

    data: {
        labels: [],

        datasets: [
            {
                label: "wpm",

                data: [],

                backgroundColor: [
                    'rgba(255, 255, 255, 0.25)'
                ],

                borderColor: [
                    'rgba(255, 255, 255, 1)'
                ],

                borderWidth: 2
            }
        ]
    },

    options: {
        legend: {
            display: false,

            labels: {
                defaultFontFamily: "Roboto Mono"
            }
        },

        responsive: true,
        maintainAspectRatio: false,

        tooltips: {
            mode: 'index',
            intersect: false
        },

        hover: {
            mode: 'nearest',
            intersect: true
        },

        scales: {
            xAxes: [
                {
                    ticks: {
                        fontFamily: "Roboto Mono"
                    },

                    display: true,

                    scaleLabel: {
                        display: false,

                        labelString: 'segundos'
                    }
                }
            ],

            yAxes: [
                {
                    display: true,

                    scaleLabel: {
                        display: false,

                        labelString: 'palavras por minuto'
                    }
                }
            ]
        }
    }
});

function showResult2() {
    testEnd = Date.now();

    let stats = calculateStats();

    clearInterval(timer);

    timer = null;

    $("#result .stats .wpm .bottom").text(stats.wpm);
    $("#result .stats .acc .bottom").text(stats.acc + "%");
    $("#result .stats .key .bottom").text(stats.correctChars+"/"+stats.incorrectChars);

    let mode2 = "";

    if (config.mode == "time") {
        mode2 = config.time;
    } else if (config.mode == "words") {
        mode2 = config.words;
    }

    $("#result .stats .wpm .top .crown").remove();

    if (stats.wpm < 250 && stats.acc > 50 && stats.acc <= 100) {
        db_getUserHighestWpm(config.mode, mode2).then(data => {
            if (data.wpm < stats.wpm || data == false) {
                $("#result .stats .wpm .top").append('<div class="crown"><i class="fas fa-crown"></i></div>');
            }

            db_testCompleted(stats.wpm, stats.correctChars, stats.incorrectChars, stats.acc, config.mode, mode2, config.punctuation);
        })
    } else {
        alert('test invalid');
    }

    let infoText = "";

    infoText = config.mode;

    if (config.mode == "time") {
        infoText += " " + config.time
    } else if (config.mode == "words") {
        infoText += " " + config.words
    }

    if (config.punctuation) {
        infoText += " com pontuação"
    }

    $("#result .stats .info .bottom").html(infoText);

    testActive = false;

    setFocus(false);
    hideCaret();
    hideLiveWpm();

    let labels = [];

    for (let i = 1; i <= wpmHistory.length; i++) {
        labels.push(i.toString());
    }

    wpmOverTimeChart.data.labels = labels;
    wpmOverTimeChart.data.datasets[0].data = wpmHistory;
    wpmOverTimeChart.update({ duration: 0 });

    $("#words").animate({
        opacity: 0
    }, 125, () => {
        $("#words").addClass('hidden');
        $("#result").css('opacity', 0).removeClass('hidden');
        $("#result").animate({ opacity: 1 }, 125);
    })

    // $("#words").addClass("hidden");
    // $("#result").removeClass('hidden');
}

function updateTimer() {
    let percent = ((time - 1) / config.time) * 100;

    $("#timer")
        .stop(true, true)
        .css("width", percent + "vw");
}

function restartTest() {
    let fadetime = 125;

    setFocus(false);

    hideCaret();

    testActive = false;

    hideLiveWpm();

    if ($("#words").hasClass("hidden"))
        fadetime = 125;

    $("#words").animate({ opacity: 0 }, 125);
      
    $("#result").animate({
        opacity: 0
    }, 125, () => {
        initWords();

        $("#result").addClass('hidden');
        $("#words").css('opacity', 0).removeClass('hidden');

        $("#words").animate({
            opacity: 1
        }, 125, () => {
            $("#restartTestButton").css('opacity', 1);
            focusWords();
            // $("#top .result")
            //   .css("opacity", "1")
            //   .css("transition", "none")
            //   .stop(true, true)
            //   .animate({ opacity: 0 }, 250, () => {
            //     $("#top .result").addClass("hidden").css("transition", "0.25s");
            //     if (testActive || resultShown) {
            //       $("#top .config")
            //         .css("opacity", "0")
            //         .removeClass("hidden")
            //         .css("transition", "none")
            //         .stop(true, true)
            //         .animate({ opacity: 1 }, 250, () => {
            //           $("#top .config").css("transition", "0.25s");
            //         });
            //     }
            //   });

            wpmHistory = [];

            hideTimer();

            setTimeout(function() {
                $("#timer")
                .css("transition", "none")
                .css("width", "0vw")
                .animate({ top: 0 }, 0, () => {
                    $("#timer").css("transition", "1s linear");
                });
            }, 250);

            clearInterval(timer);

            timer = null;
            time = 0;

            focusWords();

            // let oldHeight = $("#words").height();
            // let newHeight = $("#words")
            //   .css("height", "fit-content")
            //   .css("height", "-moz-fit-content")
            //   .height();
            // if (testMode == "words" || testMode == "custom") {
            //   $("#words")
            //     .stop(true, true)
            //     .css("height", oldHeight)
            //     .animate({ height: newHeight }, 250, () => {
            //       $("#words")
            //         .css("height", "fit-content")
            //         .css("height", "-moz-fit-content");
            //       $("#wordsInput").focus();  
            //       updateCaretPosition();
            //     });
            // } else if (testMode == "time") {
            //   $("#words")
            //     .stop(true, true)
            //     .css("height", oldHeight)
            //     .animate({ height: 78 }, 250, () => {
            //       $("#wordsInput").focus();  
            //       updateCaretPosition();
            //     });
            // }
        });
    })
}

function changeCustomText() {
    customText = prompt("Custom text");

    initWords();
}

function timesUp() {
    hideCaret();

    testActive = false;

    showResult2();
}

function compareInput() {
    $(".word.active").empty();

    let ret = "";
    let currentWord = wordsList[currentWordIndex];
    let letterElems = $($("#words .word")[currentWordIndex]).children("letter");

    for (let i = 0; i < currentInput.length; i++) {
        if (currentWord[i] == currentInput[i]) {
            ret += '<letter class="correct">' + currentWord[i] + "</letter>";
            // $(letterElems[i]).removeClass('incorrect').addClass('correct');
        } else {
            if (currentWord[i] == undefined) {
                ret += '<letter class="incorrect extra">' + currentInput[i] + "</letter>";
                // $($('#words .word')[currentWordIndex]).append('<letter class="incorrect">' + currentInput[i] + "</letter>");
            } else {
                ret += '<letter class="incorrect">' + currentWord[i] + "</letter>";
                // $(letterElems[i]).removeClass('correct').addClass('incorrect');
            }
        }
    }

    if (currentInput.length < currentWord.length) {
        for (let i = currentInput.length; i < currentWord.length; i++) {
            ret += "<letter>" + currentWord[i] + "</letter>";
        }
    }

    $(".word.active").html(ret);

    if (currentWord == currentInput && currentWordIndex == wordsList.length - 1) {
        inputHistory.push(currentInput);

        currentInput = "";

        showResult2();
    }

    // liveWPM()
}

$(document).ready(() => {
    loadConfigFromCookie();

    $("#centerContent").css("opacity", "0").removeClass("hidden");

    // initWords();

    $("#centerContent")
        .stop(true, true)
        .animate({ opacity: 1 }, 250, () => {
            // updateCaretPosition();
        });
    
    restartTest();

    if (config.quickTab) {
        $("#restartTestButton").remove();
    }
});

$(document).on("click", "#top .config .wordCount .button", (e) => {
    wrd = e.currentTarget.innerHTML;

    changeWordCount(wrd);
});

function changeWordCount(wordCount) {
    changeMode("words");

    config.words = parseInt(wordCount);

    $("#top .config .wordCount .button").removeClass("active");

    $("#top .config .wordCount .button[wordCount='" + wordCount + "']").addClass(
        "active"
    );

    restartTest();

    saveConfigToCookie();
}

$(document).on("click", "#top .config .time .button", (e) => {
    time = e.currentTarget.innerHTML;

    changeTimeConfig(time);
});

function changeTimeConfig(time) {
    changeMode("time");

    config.time = time;

    $("#top .config .time .button").removeClass("active");
    $("#top .config .time .button[timeConfig='" + time + "']").addClass("active");

    restartTest();

    saveConfigToCookie();
}

$(document).on("click", "#top .config .customText .button", (e) => {
    changeCustomText();
});

$(document).on("click", "#top .config .punctuationMode .button", (e) => {
    togglePunctuation();

    restartTest();
});

$("#words").click((e) => {
    focusWords();
});

function focusWords() {
    $("#wordsInput").focus();
}

function setKeyTips(keyTips) {
    config.showKeyTips = keyTips;

    if (config.showKeyTips) {
        $("#bottom .keyTips").removeClass("hidden");
    } else {
        $("#bottom .keyTips").addClass("hidden");
    }

    saveConfigToCookie();
}

function toggleKeyTips() {
    config.showKeyTips = !config.showKeyTips;

    if (config.showKeyTips) {
        $("#bottom .keyTips").removeClass("hidden");
    } else {
        $("#bottom .keyTips").addClass("hidden");
    }

    saveConfigToCookie();
}

function toggleSmoothCaret() {
    config.smoothCaret = !config.smoothCaret;

    saveConfigToCookie();
}

function setQuickTabMode(mode) {
    config.quickTab = mode;

    if (!config.quickTab) {
        $(".pageTest").append('<div id="restartTestButton" class="" tabindex="0"><i class="fas fa-redo-alt"></i></div>');
        $("#restartTestButton").css("opacity", 1);
        $("#bottom .keyTips").html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
        <key>esc</key> - command line`);
    } else {
        $("#restartTestButton").remove();
        $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
        <key>esc</key> - command line`);
    }

    saveConfigToCookie();
}

function toggleQuickTabMode() {
    config.quickTab = !config.quickTab;

    if (!config.quickTab) {
        $(".pageTest").append('<div id="restartTestButton" class="" tabindex="0"><i class="fas fa-redo-alt"></i></div>');
        $("#restartTestButton").css("opacity", 1);
        $("#bottom .keyTips").html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
        <key>esc</key> - command line`);
    } else {
        $("#restartTestButton").remove();
        $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
            <key>esc</key> - command line`);
    }

    saveConfigToCookie();
}

function setPunctuation(punc) {
    config.punctuation = punc;

    if (!config.punctuation) {
        $("#top .config .punctuationMode .button").removeClass("active");
    } else {
        $("#top .config .punctuationMode .button").addClass("active");
    }

    saveConfigToCookie();
}

function togglePunctuation() {
    if (config.punctuation) {
        $("#top .config .punctuationMode .button").removeClass("active");
    } else {
        $("#top .config .punctuationMode .button").addClass("active");
    }

    config.punctuation = !config.punctuation;

    saveConfigToCookie();
}

$(document).on("click", "#top .config .mode .button", (e) => {
    if ($(e.currentTarget).hasClass("active"))
        return;

    mode = e.currentTarget.innerHTML;

    changeMode(mode);
    
    restartTest();
});

$(document).on("click", "#top #menu .button", (e) => {
    href = $(e.currentTarget).attr('href');

    // history.pushState(href, null, href);

    changePage(href.replace('/', ''));
})

$(window).on('popstate', (e) => {
    if (e.originalEvent.state == "") {
        // mostrar teste
        changePage('test')
    } else if (e.originalEvent.state == "about") {
        // mostrar about
        changePage("about");
    } else if (e.originalEvent.state == "account") {
        if (firebase.auth().currentUser) {
            changePage("account");
        } else {
            changePage('login');
        }
    }
})

function changePage(page) {
    $(".page").addClass('hidden');
    $("#wordsInput").focusout();

    if (page == "test" || page == "") {
        $(".page.pageTest").removeClass('hidden');

        focusWords();
    } else if (page == "about") {
        $(".page.pageAbout").removeClass('hidden');
    } else if (page == "account") {
        if (!firebase.auth().currentUser) {
            changePage("login");
        } else {
            refreshAccountPage();
        }
    } else if (page == "login") {
        $(".page.pageLogin").removeClass('hidden');
    }
}

function changeMode(mode) {
    config.mode = mode;

    $("#top .config .mode .button").removeClass("active");
    $("#top .config .mode .button[mode='" + mode + "']").addClass("active");

    if (config.mode == "time") {
        $("#top .config .wordCount").addClass("hidden");
        $("#top .config .time").removeClass("hidden");
        $("#top .config .customText").addClass("hidden");
        $("#top .config .punctuationMode").removeClass("hidden");
    } else if (config.mode == "words") {
        $("#top .config .wordCount").removeClass("hidden");
        $("#top .config .time").addClass("hidden");
        $("#top .config .customText").addClass("hidden");
        $("#top .config .punctuationMode").removeClass("hidden");
    } else if (config.mode == "custom") {
        $("#top .config .wordCount").addClass("hidden");
        $("#top .config .time").addClass("hidden");
        $("#top .config .customText").removeClass("hidden");
        $("#top .config .punctuationMode").addClass("hidden");
    }

    saveConfigToCookie();
}

$("#restartTestButton").keypress((event) => {
    if (event.keyCode == 32 || event.keyCode == 13) {
        restartTest();
    }
});

$("#restartTestButton").click((event) => {
    restartTest();
});

$("#wordsInput").keypress((event) => {
    event.preventDefault();
});

$("#wordsInput").on("focus", (event) => {
    showCaret();
});

$("#wordsInput").on("focusout", (event) => {
    hideCaret();
});

function updateLiveWpm(wpm) {
    if (!config.showLiveWpm)
        return;

    if (wpm == 0 || !testActive)
        hideLiveWpm();

    let wpmstring = wpm < 100 ? `&nbsp;${wpm}` : `${wpm}`;
    
    $("#liveWpm").html(wpmstring);
}

function showLiveWpm() {
    if (!config.showLiveWpm)
        return;
    
    if (!testActive)
        return;

    $("#liveWpm").css('opacity',0.25);
}

function hideLiveWpm() {
    $("#liveWpm").css('opacity',0);
}

$(document).keypress(function (event) {
    if (!$("#wordsInput").is(":focus"))
        return;

    if (event["keyCode"] == 13)
        return;
    
    if (event["keyCode"] == 32)
        return;

    // iniciar o teste

    if (currentInput == "" && inputHistory.length == 0) {
        testActive = true;

        stopCaretAnimation();

        testStart = Date.now();

        if (config.mode == "time") {
            showTimer();
        }

        updateTimer();

        timer = setInterval(function() {
            time++;

            updateTimer();

            let wpm = liveWPM();

            updateLiveWpm(wpm);
            showLiveWpm();

            wpmHistory.push(wpm);

            if (config.mode == "time") {
                if (time == config.time) {
                    clearInterval(timer);

                    timesUp();
                }
            }
        }, 1000);
    } else {
        if (!testActive) return;
    }

    if (wordsList[currentWordIndex].substring(currentInput.length,currentInput.length + 1) != event["key"]) {
        accuracyStats.incorrect++;
    } else {
        accuracyStats.correct++;
    }

    currentInput += event["key"];

    setFocus(true);
    compareInput();
    updateCaretPosition();
});

$(window).resize(() => {
    updateCaretPosition();
});

$(document).mousemove(function(event) {
    setFocus(false);
});

$(document).keydown((event) => {
    if (event.keyCode == 27) {
        if ($("#commandLineWrapper").hasClass("hidden")) {
            currentCommands = commands;

            showCommandLine();
        } else {
            hideCommandLine();
        }
    }

    if (config.quickTab) {
        if (event["keyCode"] == 9) {
            event.preventDefault();

            restartTest();
        }
    }

    if ($("#wordsInput").is(":focus")) {
        if (event["keyCode"] == 8) {
            event.preventDefault();

            if (!testActive)
                return;

            if (currentInput == "" && inputHistory.length > 0) {
                if (inputHistory[currentWordIndex - 1] == wordsList[currentWordIndex - 1] || $($(".word")[currentWordIndex - 1]).hasClass("hidden")) {
                    return;
                } else {
                    if (event["ctrlKey"] || event["altKey"]) {
                        currentInput = "";
                        inputHistory.pop();
                    } else {
                        currentInput = inputHistory.pop();
                    }

                    currentWordIndex--;

                    updateActiveElement();
                    compareInput();
                }
            } else {
                // if ($($(".word")[currentWordIndex - 1]).hasClass("hidden")) {
                //     return;
                // }

                if (event["ctrlKey"]) {
                    currentInput = "";
                } else {
                    currentInput = currentInput.substring(0, currentInput.length - 1);
                }

                compareInput();
            }

            updateCaretPosition();
        }

        // espaço

        if (event["keyCode"] == 32) {
            if (!testActive)
                return;

            event.preventDefault();

            if (currentInput == "")
                return;

            let currentWord = wordsList[currentWordIndex];

            if (config.mode == "time") {
                let currentTop = $($("#words .word")[currentWordIndex]).position().top;
                let nextTop = $($("#words .word")[currentWordIndex + 1]).position().top;

                if (nextTop > currentTop) {
                    // última palavra da linha

                    for (let i = 0; i < currentWordIndex + 1; i++) {
                        $($("#words .word")[i]).addClass("hidden");

                        // addWordLine();
                    }
                }
            }

            if (currentWord == currentInput) {
                inputHistory.push(currentInput);

                currentInput = "";
                currentWordIndex++;

                updateActiveElement();
                updateCaretPosition();
            } else {
                inputHistory.push(currentInput);

                // highlightMissedLetters();
                // hideMissedLetters();

                highlightBadWord();

                currentInput = "";
                currentWordIndex++;

                if (currentWordIndex == wordsList.length) {
                    showResult2();

                    return;
                }

                updateActiveElement();
                updateCaretPosition();
            }

            if (config.mode == "time") {
                addWord();
            }
        }
    }
});