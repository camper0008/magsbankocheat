function setCellValue(value, cell) {
    cell.textContent = value;
}

function gen_int(i) {
    let number = Math.floor(Math.random() * 10 + i * 10);
    while (number === 0) {
        number = Math.floor(Math.random() * 10 + i * 10);
    }
    if (i === 8) {
        number = Math.floor(Math.random() * 11 + 80);
    }
    if (i === 100) {
        number = Math.ceil(Math.random() * 9);
    }
    return number;
}

function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

function genColumn(i) {
    let col = Array.from({ length: 3 }, () => gen_int(i));
    while (hasDuplicates(col) == true) {
        col = Array.from({ length: 3 }, () => gen_int(i));
    }
    return col.sort();
}

function genRowIndex() {
    let row = Array.from({ length: 5 }, () => gen_int(100));
    while (hasDuplicates(row) == true) {
        row = Array.from({ length: 5 }, () => gen_int(100));
    }
    return row.sort();
}

function containsAllIndexes(rows) {
    const values = rows.flat();
    for (let i = 1; i <= 9; i++) {
        if (values.indexOf(i) === -1) {
            return false;
        }
    }
    return true;
}
function genRowIndexes() {
    let rows = [genRowIndex(), genRowIndex(), genRowIndex()];
    while (!containsAllIndexes(rows)) {
        rows = [genRowIndex(), genRowIndex(), genRowIndex()];
    }
    return rows;
}

function clearPlate() {
    for (let row = 1; row <= 3; row++) {
        for (let column = 1; column <= 9; column++) {
            const cell = "p1" + String(row) + String(column);
            document.getElementById(cell).innerHTML = "";
        }
    }
}

function updatePlate() {
    clearPlate();
    var dict = {};
    for (var n = 1; n <= 3; n++) {
        var cols = [];
        for (var i = 0; i < 9; i++) {
            var col = genColumn(i);
            cols.push(col);
        }

        var rows_choose = genRowIndexes();

        var chosen_row;

        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < rows_choose[j].length; i++) {
                var k = rows_choose[j][i];
                var celle = "p" + String(n) + String(j + 1) + String(k);
                dict[celle] = cols[k - 1][j];
            }
        }
    }

    for (var key in dict) {
        var value = dict[key];
        setCellValue(value, document.getElementById(key));
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nameInput").addEventListener(
        "keypress",
        function (e) {
            if (e.key === "Enter") {
                Math.seedrandom(this.value);
                updatePlate();
            }
        },
    );
});
