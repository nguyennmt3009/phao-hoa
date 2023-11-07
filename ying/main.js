
var cannotClickList = ['Dont do that!', 'Stop it!', 'Please stop!', 'I said stop!', 'Stop', 'I\'m serious', 'Not kidding', 'I\'m not joking', 'It\'ll not working', 'I\'m serious', 'You are wasting your time', 'You are wasting my time', 'You are wasting our time'];
var cannotBtn = $('#cannot');
cannotBtn.on('click', function () {
    var randomIndex = Math.floor(Math.random() * cannotClickList.length);
    var cannotBtnFirstChild = cannotBtn.children().first();
    cannotBtnFirstChild.text(cannotClickList[randomIndex]);
});

////// Ying's Dictionary Show //////
var dictionarySample = [
    {'char': 'a', 'ying': '2'},
    {'char': 'b', 'ying': '&'},
    {'char': 'c', 'ying': ')'},
];

// get dictionary from local storage
var dictionary = JSON.parse(localStorage.getItem('dictionary'));

// if dictionary is null, use sample dictionary
if (dictionary == null) {
    dictionary = dictionarySample;
}

var dicTable = $('#dicTable');

function renderTable() {
    for (var i = 0; i < dictionary.length; i++) {
        var row = '<tr>';
        row += '<td>' + dictionary[i].char + '</td>';
        row += '<td>' + dictionary[i].ying + '</td>';
        row += '<td><button class="btn btn-danger btn-sm" data-index="' + i + '">Delete</button></td>';
        row += '</tr>';
        dicTable.append(row);
    }
}

renderTable();

////// Ying's Dictionary Add //////

var humanTxt = $('#humanTxt');
var yingTxt = $('#yingTxt');
var addBtn = $('#addBtn');

humanTxt.on('keyup', function () {
    if (humanTxt.val().length > 1) {
        addInvalid(humanTxt);
        return;
    } else {
        removeInvalid(humanTxt);
    }
});

yingTxt.on('keyup', function () {
    if (yingTxt.val().length > 1) {
        addInvalid(yingTxt);
        return;
    } else {
        removeInvalid(yingTxt);
    }
});

function addInvalid (element) {
    element.addClass('is-invalid');
    addBtn.attr('disabled', true);
}

function removeInvalid (element) {
    element.removeClass('is-invalid');
    addBtn.attr('disabled', false);
}

addBtn.on('click', function () {
    removeAlert();
    var human = humanTxt.val();
    var ying = yingTxt.val();
    if (checkExistHuman(human) || checkExistYing(ying)) {
        addAlert();
    } else {
        var newWord = {'char': human, 'ying': ying};
        dictionary.push(newWord);
        dicTable.empty();
        renderTable();
        humanTxt.val('');
        yingTxt.val('');
        saveToLocalStorage();
    }
});

function saveToLocalStorage() {
    localStorage.setItem('dictionary', JSON.stringify(dictionary));
}

function checkExistHuman(char) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].char == char) {
            return true;
        }
    }
    return false;
}

function checkExistYing(ying) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].ying == ying) {
            return true;
        }
    }
    return false;
}

// Duplicate alert
var duplicateAlert = $('#duplicateAlert');
var duplicateAlertHtml = `
<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>Duplicated !</strong> Add something else.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
</div>
`;

function addAlert() {
    removeAlert();
    duplicateAlert.append(duplicateAlertHtml);
}

function removeAlert() {
    duplicateAlert.empty();
}

////// Ying's Dictionary Delete //////

dicTable.on('click', '.btn-danger', function () {
    var index = $(this).data('index');
    dictionary.splice(index, 1);
    dicTable.empty();
    renderTable();
    saveToLocalStorage();
});

////// Ying's Dictionary //////


var searchTxt = $('#searchTxt');
var resultTxt = $('#resultTxt');

searchTxt.on('keyup', function () {
    var input = searchTxt.val();
    var result = '';
    for (var i = 0; i < input.length; i++) {
        result += searchChar(input[i]);
    }
    resultTxt.val(result);
});

function searchChar(char) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].char == char) {
            return dictionary[i].ying;
        }
    }
    return char;
}

resultTxt.on('keyup', function () {
    var input = resultTxt.val();
    var result = '';
    for (var i = 0; i < input.length; i++) {
        result += searchYing(input[i]);
    }
    searchTxt.val(result);

});

function searchYing(ying) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].ying == ying) {
            return dictionary[i].char;
        }
    }
    return ying;
}

