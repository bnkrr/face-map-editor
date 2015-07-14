function trim (s) {
    return s.replace(/^[\s\[]+|[\s\]]+$/g, '');
}


function importDataParserObjectInit() {
    var o = new Object();


    o.colors = ["wn", "pn", "fn", "sn"];

    o.parseText = function (text) {
        var stack = [];
        var item = "";
        var res = [];
        for (var i in text) {
            if (text[i] == "{") {
                stack.push(0);
            } else if (text[i] == "}") {
                stack.pop();
                if (stack.length == 1) {
                    //console.log(stack);
                    res.push(item.slice(1));
                    item = "";
                }
            }
            if (stack.length >= 2) {
                item += text[i];
            }
        }
        if (res.length >= 1) {
            this.matStr = res[0];
        }
        if (res.length >= 2) {
            this.drStr = res[1];
        } else {
            this.drStr = undefined;
        }
        //return res;
    }

    o.parseMat = function () {
        var matIn = this.splitMat();
        
        // maxi, maxj
        this.calMaxIJ(matIn);
        
        // row, col
        rc = ij2rcMax(this.maxi, this.maxj);
        this.row = rc[0];
        this.col = rc[1];

        // data, fore, back
        this.data = new Array(this.row);
        this.fore = new Array(this.row);
        this.back = new Array(this.row);
        for (var i = 0; i < this.row; i++) {
            this.data[i] = new Array(this.col);
            this.fore[i] = new Array(this.col);
            this.back[i] = new Array(this.col);
            for (var j = 0; j < this.col; j++) {
                this.fore[i][j] = "n";
                this.data[i][j] = "n";
                this.back[i][j] = "n";
            }
        }

        var r = matIn.length;
        var c = r==0 ? 0 : matIn[0].length;
        for (var i = 0; i < r; ++i) {
            for (var j = 0; j < c; ++j) {
                this.parseMatCell(matIn[i][j], i+this.offset.i, j+this.offset.j);
            }
        }
    }

    o.splitMat = function () {
        var res = [];
        var line = [];
        var word = "";
        var stack = [];
        var quot = false;
        for (var i in this.matStr) {
            var c = this.matStr[i];
            //console.log(stack)
            if (c == "{") {
                stack.push(0);
            } else if (c == "}") {
                stack.pop();
                res.push(line);
                line = [];  // end of line
            } else if (stack.length >= 1) {     // in a line
                if (c == '"') {
                    if (quot) { // end of word
                        line.push(word);
                        word = "";
                    }
                    quot = !quot;
                } else if (quot) {  // in a word
                    word += c;
                }
            }
        }
        return res;
    }

    o.calMaxIJ = function (matIn) {
        var maxi = 0;
        var maxj = 0;
        var mini = 100;
        var minj = 100;

        var r = matIn.length;
        var c = r==0 ? 0 : matIn[0].length;
        var offset = {};
        for (var i = 0; i < r; ++i) {
            for (var j = 0; j < c; ++j) {
                if (matIn[i][j] != "n") {
                    var ij = rc2ij(i,j);
                    maxi = maxi > ij[0] ? maxi : ij[0];
                    maxj = maxj > ij[1] ? maxj : ij[1];
                    mini = mini < ij[0] ? mini : ij[0];
                    minj = minj < ij[1] ? minj : ij[1];
                }
            }
        }
        offset.i = -mini;
        offset.j = -minj;
        this.maxi = maxi - mini + 1;
        this.maxj = maxj - minj + 1;
        this.offset = offset;
    }


    o.parseMatCell = function (word, i, j) {
        this.fore[i][j] = "n";
        this.data[i][j] = "n";
        this.back[i][j] = "n";

        var words = this.splitWord(word)
        for (var k in words) {
            var dl = this.displaylevelOf(words[k]);
            if (dl != "none") {
                this[dl][i][j] = words[k];
            }
        }
    }

    o.splitWord = function (word) {
        var words = [];
        var w = [];

        var w1 = word.split(",");
        for (var k in w1) {
            w = w.concat(w1[k].split("|"))
        }
        
        for (var k in w) {
            if (w[k].search(/ab_\d_\d/) == 0) {
                words.push("ab");
                words.push(this.colors[parseInt(w[k].slice(-1))-1])
            } else if (w[k] == "f_3") {
                words.push("f");
            } else if (w[k] == "p_1") {
                words.push("p");
            } else if (w[k].length > 0) {   // default behaviour
                words.push(w[k]);
            }
        }
        return words;
    }

    o.displaylevelOf = function (name) {
        //"fore", "back", "data", "none"
        var obj = $(".picker .type_"+name);
        if (obj.length == 0) {
            return "none";
        } else if (obj.attr("displaylevel") != undefined) {
            return obj.attr("displaylevel");
        } else {
            return "data";
        }
    }

    o.parseDropRate = function () {
        if (this.drStr == undefined) {
            this.dr = undefined;
        } else {
            var w = this.drStr.split(",");
            this.dr = {};
            for (var k in w) {
                var kv = w[k].split("=")
                var key = trim(kv[0]);
                this.dr[key] = parseInt(kv[1]);
            }
        }
    }

    return o;
}

//idpt = importDataParserObjectInit();  // for debug