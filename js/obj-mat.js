function ij2rc(i, j) {
    var r = i + Math.floor((j+1)/2);
    var c = j;
    return [r, c];
}

function rc2ij(r, c) {
    var i = r - Math.floor((c+1)/2);
    var j = c;
    return [i, j];
}

function ij2rcMax(imax, jmax) {
    var nrow = imax + Math.floor(jmax/2);
    var ncol = jmax;
    return [nrow, ncol];
}

// matrix obj
function matrixObjectInitNormal(imax, jmax) {
    var rc = ij2rcMax(imax, jmax)
    return matrixObjectInit(rc[0], rc[1]);
}


function matrixObjectInit(row, col) {
    var mat = new Object();
    mat.row = row;
    mat.col = col;
    mat.data = new Array(mat.row);
    mat.fore = new Array(mat.row);
    mat.back = new Array(mat.row);

    for (var i = 0; i < mat.row; i++) {
        mat.data[i] = new Array(mat.col);
        mat.fore[i] = new Array(mat.col);
        mat.back[i] = new Array(mat.col);
        for (var j = 0; j < mat.col; j++) {
            mat.data[i][j] = "n";
            mat.fore[i][j] = "n";
            mat.back[i][j] = "n";
        }
    }

    mat.copy = function (m) {
        this.row = m.row;
        this.col = m.col;
        this.data = m.data;
        this.fore = m.fore;
        this.back = m.back;
    }

    mat.cellUpdate = function (i, j) {
        var r = i + Math.floor((j+1)/2);
        var c = j;
        //if (this.data[r][c] == )
        var cellType = $("#c_"+i+"_"+j).children(".cell_type");
        cellType.removeClass();
        cellType.addClass("cell_type");
        cellType.addClass(this.data[r][c]);

        if (this.fore[r][c] != "n") {
            cellType.attr("fore", this.fore[r][c]);
        } else {
            cellType.removeAttr("fore");
        }

        if (this.back[r][c] != "n") {
            cellType.attr("back", this.back[r][c]);
        } else {
            cellType.removeAttr("back");
        }
    }

    mat.cellUpdateById = function(id, abbr, displaylevel) {
        var ids = id.split("_");
        var i = parseInt(ids[1]);
        var j = parseInt(ids[2]);
        this.cellUpdate(i,j);
    }

    
    mat.cellUpdateByObj = function (obj) {
        var id = obj.attr("id");
        this.cellUpdateById(id)
    }

    mat.cellUpdateAll = function () {
        // set row and line in input box
        var maxi = this.row - Math.floor(this.col/2);
        var maxj = this.col;
        $("input.row").val(maxi);
        $("input.col").val(maxj);
        genMat(maxi, maxj);

        for (var i = 0; i < maxi; ++i) {
            for (var j = 0; j < maxj; ++j) {
                //setattr
                this.cellUpdate(i, j);
            } 
        }
    }

    mat.update = function (i, j, abbr, displaylevel) {
        var r = i + Math.floor((j+1)/2);
        var c = j;
        //alert(this.data);
        if (abbr == "n") {
            this.data[r][c] = "n";
            this.fore[r][c] = "n";
            this.back[r][c] = "n";
        } else if (displaylevel == "fore" || displaylevel == "back") {

            if (this[displaylevel][r][c] == abbr) {
                this[displaylevel][r][c] = "n";
            } else {
                this[displaylevel][r][c] = abbr;
            }
            if (this.data[r][c] == "n") {
                this.data[r][c] = "EE";
            }
        } else {
            if (this.data[r][c] == abbr) {
                if (this.data[r][c] == "EE") {
                    if (this.fore[r][c] != "n" || this.back[r][c] != "n") {
                        //this.data[r][c] = "EE";
                        this.fore[r][c] = "n";
                        this.back[r][c] = "n";
                    } else {
                        this.data[r][c] = "n";
                        this.fore[r][c] = "n";
                        this.back[r][c] = "n";
                    }
                } else {
                    this.data[r][c] = "EE";
                }
            } else {
                this.data[r][c] = abbr;
            }
        }
    }

    mat.updateById = function(id, abbr, displaylevel) {
        var ids = id.split("_");
        var i = parseInt(ids[1]);
        var j = parseInt(ids[2]);
        this.update(i,j,abbr,displaylevel);
    }

    
    mat.updateByObj = function (obj) {
        var abbr = $(".type_selected").attr("abbr");
        var displaylevel = $(".type_selected").attr("displaylevel");
        var id = obj.attr("id");
        this.updateById(id, abbr, displaylevel);
    }

    mat.errorDetectionCell = function (r, c) {
        var f = this.fore[r][c];
        var d = this.data[r][c];
        var b = this.back[r][c];
        if (f == "ab") { //airball
            var colors = {"wn":"1", "pn":"2", "fn":"3", "sn":"4"};
            if (colors[d] == undefined) {
                this.data[r][c] = "E";
            }
            this.back[r][c] = "n";
        }

        if ((d == "n" || d == "EE") && (f != "n" || b != "n")) { // any foreground or background
            this.data[r][c] = "E";  
        }

        if (d != "E" && (f == "i" && b != "n")) { // d,i
            this.data[r][c] = "E";  
        }

    }
    mat.errorDetection = function () { // fill E in blank cell before export
        for (var r = 0; r < this.row; ++r) {
            for (var c = 0; c < this.col; ++c) {
                var ij = rc2ij(r, c);
                this.errorDetectionCell(r, c);
                this.cellUpdate(ij[0], ij[1]);
            } 
        }
    }

    mat.preExport = function () {
        this.errorDetection();
    }
    // export mat
    mat.genExportCell = function (r, c) {
        var f = this.fore[r][c];
        var d = this.data[r][c];
        var b = this.back[r][c];
        if (f == "ab") { //airball
            var colors = {"wn":"1", "pn":"2", "fn":"3", "sn":"4"};
            if (colors[d] == undefined) {
                return "ab";
            } else {
                return "ab_1_" + colors[d];
            }
        }
        if (d == "E") { // empty
            if (f == "n" && b == "n") {
                return d;
            } else {
                d = "n"; // E for empty
            }
        }
        if (d != "n") {
            if (f != "n" && b != "n") {
                return b+","+f;
            } else if (f != "n") {
                return d + "," + f;
            } else if (b != "n") {    // f == "n" && b != "n"
                return b + "|" + d;
            } else {
                return d;
            }
        } else {
            if (f != "n" && b != "n") {
                return b+","+f;
            } else if (f != "n") {
                return f;
            } else if (b != "n") {    // f == "n" && b != "n"
                return b;
            } else {
                return d;
            }
        }
        return "n";
    }

    mat.genExportMatData = function () {
        this.preExport();

        var mout = new Array(this.row);
        for (var i = 0; i < this.row; i++) {
            mout[i] = new Array(this.col);
            for (var j = 0; j < mat.col; j++) {
                mout[i][j] = this.genExportCell(i, j);
            }
        }
        return mout;
    }

    mat.genMatString = function (mout, imin, imax, jmin, jmax) {
        if (!imin) {imin = 0;}
        if (!imax) {imax = this.row;}
        if (!jmin) {jmin = 0;}  
        if (!jmax) {jmax = this.col};
        var result = "{\n";
        for (var i = imin; i < imax; i++) {
            var line = "{ ";
            for (var j = jmin; j < jmax; j++) {
                var single = "\"" + mout[i][j] + "\",";
                line += single;
            }
            line += " },\n";
            result += line;
        }
        return result+"},\n";
    }
    //{[BUBBLE_TYPE_WATER]=25, [BUBBLE_TYPE_STAR]=25, [BUBBLE_TYPE_FIRE]=25, [BUBBLE_TYPE_PLANT]=25},
    // export drop rate
    mat.genExportDropRateData = function () {
        var wn = parseInt($(".txt_dr.wn").val());
        var pn = parseInt($(".txt_dr.pn").val());
        var fn = parseInt($(".txt_dr.fn").val());
        var sn = parseInt($(".txt_dr.sn").val());
        var dr = {"BUBBLE_TYPE_WATER":wn, "BUBBLE_TYPE_PLANT":pn, "BUBBLE_TYPE_FIRE":fn, "BUBBLE_TYPE_STAR":sn};
        return dr;
    }

    mat.genDropRateString = function (dr) {
        var res = "{";
        for (var k in dr) {
            if (dr[k] != NaN) {
                res += "[" + k + "]=" + dr[k].toString() + ", ";
            }
        }
        res = res.slice(0,-2) + "},\n";
        return res;
    }

    // merge all export string
    mat.genExportString = function (tight) {
        var res = "battle_matrix* =\n{\n";
        var mout = this.genExportMatData();
        if (tight) {
            res += this.genMatStringTight(mout);
        } else {
            res += this.genMatString(mout);
        }
        if ($("#ckb_dr").prop("checked")) {
            var dr = this.genExportDropRateData();
            res += this.genDropRateString(dr);
        }
        return res + "}";
    }

    // tight mode
    mat.horizon = function (mout, i) {
        for (var j = 0; j < this.col; ++j) {
            if (mout[i][j] != 'n') {
                return false;
            }
        }
        return true;
    }
    mat.vertical = function (mout, j) {
        for (var i = 0; i < this.row; ++i) {
            if (mout[i][j] != 'n') {
                return false;
            }
        }
        return true;
    }

    mat.genMatStringTight = function (mout) {
        var i=0, j=0;
        var imin=0, imax=this.row, jmin=0, jmax=this.col;

        while (i<this.row && this.horizon(mout, i)) {
            ++i;
        }
        imin = i;

        i = this.row - 1;
        while (i>=0 && this.horizon(mout,i)) {
            i--;
        }
        imax = i+1;

        while (j<this.col && this.vertical(mout, j)) {
            ++j;
        }
        jmin = j;

        j = this.col - 1;
        while (j>=0 && this.vertical(mout, j)) {
            --j;
        }
        jmax = j+1;
        //alert(JSON.stringify([imin, imax, jmin, jmax]));
        
        return this.genMatString(mout, imin, imax, jmin, jmax);
    }
    
    // export data format is lua table, not json. obsolete.
    mat.genExportStringJson = function () {}

    // import
    mat.parseImportData = function () {
        var istr = $(".matrixtext").val();
        var idp = importDataParserObjectInit();
        idp.parseText(istr);
        
        // import matrix data
        idp.parseMat();
        this.copy(idp);
        genMat(idp.maxi, idp.maxj);
        this.errorDetection();  //cell display will be updated in this function

        // import row and col input area
        setIJ(idp.maxi, idp.maxj);

        // import drop rate
        idp.parseDropRate();
        setDropRate(idp.dr);
    }


    // save & load
    mat.saveData = function () { // not functional, stringify needed
        localStorage.mat = this;
    }
    mat.reset = function () {
        for (var i = 0; i < this.row; ++i) {
            for (var j = 0; j < this.col; ++j) {
                //setattr
                this.data[i][j] = "n";
                this.fore[i][j] = "n";
                this.back[i][j] = "n";
            } 
        }
    }

    return mat;
}