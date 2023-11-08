
var cannotClickList = ['Dont do that!', 'Stop it!', 'Please stop!', 'I said stop!', 'Stop', 'I\'m serious', 'Not kidding', 'I\'m not joking', 'It\'ll not working', 'I\'m serious', 'You are wasting your time', 'You are wasting my time', 'You are wasting our time'];
var cannotBtn = $('#cannot');
cannotBtn.on('click', function () {
    var randomIndex = Math.floor(Math.random() * cannotClickList.length);
    var cannotBtnFirstChild = cannotBtn.children().first();
    cannotBtnFirstChild.text(cannotClickList[randomIndex]);
});

////// Ying's Dictionary Show //////
var dictionarySample = [
    {'char': 'lên', 'ying': 'https://picsum.photos/200/200?random=1'},
    {'char': 'xuống', 'ying': 'https://picsum.photos/200/200?random=2'},
    {'char': 'trái', 'ying': 'https://picsum.photos/200/200?random=3'},
    {'char': 'phải', 'ying': 'https://picsum.photos/200/200?random=4'},
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

addBtn.on('click', function () {
    removeAlert();
    var human = humanTxt.val().toLowerCase();
    var ying = yingTxt.val();
    if (checkExistHuman(human)) {
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
var resultImg = $('#resultImg');

searchTxt.on('keyup', function () {
    var input = searchTxt.val().toLowerCase().split(' ');
    var result = '';
    resultImg.empty();
    for (var i = 0; i < input.length; i++) {
        var imgSrc = searchChar(input[i]);
        if (imgSrc) {
            // create image
            var img = document.createElement('img');
            img.src = imgSrc;
            img.width = 50;
            img.height = 50;
            // add to resultImg
            resultImg.append(img);
        } else {
            var gayWords = searchGay(input[i]);
            if (gayWords) {
                for (var j = 0; j < gayWords.length; j++) {
                    imgSrc = searchChar(gayWords[j]);
                    if (imgSrc) {
                        // create image
                        var img = document.createElement('img');
                        img.src = imgSrc;
                        img.width = 50;
                        img.height = 50;
                        // add to resultImg
                        resultImg.append(img);
                    } 
                }
            }
        }
    }
    resultTxt.val(result);
});

function searchChar(char) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].char == char) {
            return dictionary[i].ying;
        }
    }
    return null;
}

function searchGay(gay) {
    for (var i = 0; i < dictionaryGay.length; i++) {
        if (dictionaryGay[i].gay == gay) {
            return dictionaryGay[i].words;
        }
    }
    return null;
}

////// Ying's Dictionary Gay Show //////
var dictionaryGay = [
    {'gay': 'hướng', 'words': ['trái', 'phải']},
    {'gay': 'phương', 'words': ['lên', 'xuống']},
];

// local storage
var dictionaryGayLocal = JSON.parse(localStorage.getItem('dictionaryGay'));
if (dictionaryGayLocal != null) {
    dictionaryGay = dictionaryGayLocal;
}


var dicGayTable = $('#dicGayTable');

function renderGayTable() {
    dicGayTable.empty();
    for (var i = 0; i < dictionaryGay.length; i++) {
        var row = '<tr>';
        row += '<td>' + dictionaryGay[i].gay + '</td>';
        row += '<td>';
        for (var j = 0; j < dictionaryGay[i].words.length; j++) {
            row += dictionaryGay[i].words[j] + ' ';
        }
        row += '</td>';
        row += '<td><button class="btn btn-danger btn-sm" data-index="' + i + '">Delete</button></td>';
        row += '</tr>';
        dicGayTable.append(row);
    }
}

renderGayTable();

function saveToLocalStorageGay() {
    localStorage.setItem('dictionaryGay', JSON.stringify(dictionaryGay));
}


////// Ying's Dictionary Gay Delete //////

dicGayTable.on('click', '.btn-danger', function () {
    var index = $(this).data('index');
    dictionaryGay.splice(index, 1);
    dicGayTable.empty();
    renderGayTable();
    saveToLocalStorageGay();
});

////// Ying's Dictionary Gay Tag //////


const tagInput = document.getElementById('tagInput');
const tagsContainer = document.getElementById('tagsContainer');
const tagSuggestions = document.getElementById('tagSuggestions');

let tags = [];
let suggestions = [];

for (var i = 0; i < dictionary.length; i++) {
    suggestions.push(dictionary[i].char);
}

function displayTags() {
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagElem = document.createElement('span');
        tagElem.className = 'tag-item';
        tagElem.textContent = tag;
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.textContent = '×';
        closeBtn.onclick = function () {
            tags = tags.filter(t => t !== tag);
            displayTags();
        };
        tagElem.appendChild(closeBtn);
        tagsContainer.appendChild(tagElem);
    });
}

tagInput.addEventListener('keyup', (e) => {
    const inputText = e.target.value.trim();
    tagSuggestions.innerHTML = '';
    if (inputText) {
        const filteredSuggestions = suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(inputText.toLowerCase())
        );
        filteredSuggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'list-group-item list-group-item-action';
            div.textContent = suggestion;
            div.onclick = function () {
                if (!tags.includes(suggestion)) {
                    tags.push(suggestion);
                    displayTags();
                }
                tagInput.value = '';
                tagSuggestions.innerHTML = '';
            };
            tagSuggestions.appendChild(div);
        });
    }
});

displayTags();

////// Ying's Dictionary Gay Add //////

var addGayBtn = $('#addGayBtn');

addGayBtn.on('click', function () {
    removeAlert();
    var gayWord = $('#gayTxt').val().toLowerCase();
    console.log(gayWord);

    var isExisting = dictionaryGay.some(function (entry) {
        return entry.gay === gayWord;
    });

    if (!isExisting && gayWord !== '' && tags.length > 0) {
        var newEntry = { 'gay': gayWord, 'words': tags };
        dictionaryGay.push(newEntry);
        console.log(dictionaryGay);
        $('#gayTxt').val('');
        tags = [];
        displayTags();
        renderGayTable();
        saveToLocalStorageGay();
    } else {
        addAlert();
    }
});

