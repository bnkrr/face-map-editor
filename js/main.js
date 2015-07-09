//可以移动所有的点
//无限大的地图？

// page initial
function pageInitial() {
    $(".cell").click(OnClickCell);
    $(".type").click(OnClickType);
}

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

// matrix obj
function matrixObjectInitNormal(maxi, maxj) {
    var nrow = maxi + Math.floor(maxj/2);
    var ncol = maxj;
    return matrixObjectInit(nrow, ncol);
}


function matrixObjectInit(row, col) {
    var mat = new Object();
    mat.row = row;
    mat.col = col;
    mat.data = new Array(mat.row);

    for (var i = 0; i < mat.row; i++) {
        mat.data[i] = new Array(mat.col);
        for (var j = 0; j < mat.col; j++) {
            mat.data[i][j] = "n";
        }
    }

    mat.copy = function (m) {
        this.row = m.row;
        this.col = m.col;
        this.data = m.data;
    }

    mat.update = function (i, j, abbr) {
        var r = i + Math.floor((j+1)/2);
        var c = j;
        //alert(this.data);
        this.data[r][c] = abbr;
    }

    mat.updateById = function(id, abbr) {
        var ids = id.split("_");
        var i = parseInt(ids[1]);
        var j = parseInt(ids[2]);
        this.update(i,j,abbr);
    }

    
    mat.updateByObj = function (obj) {
        var abbr = $(".type_selected").attr("abbr");
        var id = obj.attr("id");
        this.updateById(id, abbr);
    }

    mat.exportData = function (imin, imax, jmin, jmax) {
        if (!imin) {imin = 0;}
        if (!imax) {imax = this.row;}
        if (!jmin) {jmin = 0;}  
        if (!jmax) {jmax = this.col};
        result = "battle_matrix* =\n{\n{\n";
        for (var i = imin; i < imax; i++) {
            var line = "{ ";
            for (var j = jmin; j < jmax; j++) {
                var single = "\"" + this.data[i][j] + "\",";
                line += single;
            }
            line += " },\n";
            result += line;
        }
        return result+"},\n}";
    }

    mat.horizon = function (i) {
        for (var j = 0; j < this.col; ++j) {
            if (this.data[i][j] != 'n') {
                return false;
            }
        }
        return true;
    }
    mat.vertical = function (j) {
        for (var i = 0; i < this.row; ++i) {
            if (this.data[i][j] != 'n') {
                return false;
            }
        }
        return true;
    }

    mat.exportDataTight = function () {
        var i=0, j=0;
        var imin=0, imax=this.row, jmin=0, jmax=this.col;
        while (i<this.row && this.horizon(i)) {
            ++i;
        }
        imin = i;

        i = this.row - 1;
        while (i>=0 && this.horizon(i)) {
            i--;
        }
        imax = i+1;

        while (j<this.col && this.vertical(j)) {
            ++j;
        }
        jmin = j;

        j = this.col - 1;
        while (j>=0 && this.vertical(j)) {
            --j;
        }
        jmax = j+1;
        //alert(JSON.stringify([imin, imax, jmin, jmax]));
        return this.exportData(imin, imax, jmin, jmax);
    }

    mat.exportDataJson = function () {}
    
    mat.saveData = function () {
        localStorage.mat = this;
    }
    mat.reset = function () {
        for (var i = 0; i < this.row; ++i) {
            for (var j = 0; j < this.col; ++j) {
                //setattr
                this.data[i][j] = 'n';
            } 
        }
    }
    mat.importData = function () {
        // set row and line in input box
        var maxi = this.row - Math.floor(this.col/2);
        var maxj = this.col;
        $("input.row").val(maxi);
        $("input.col").val(maxj);
        genMat(maxi, maxj);

        for (var i = 0; i < maxi; ++i) {
            for (var j = 0; j < maxj; ++j) {
                //setattr
                var rc = ij2rc(i, j);
                updateClassCell($("#c_"+i+"_"+j), this.data[rc[0]][rc[1]]);
            } 
        }

    }

    return mat;
}


// map generate

function init() {
    var maxi = parseInt($("input.row").val());
    var maxj = parseInt($("input.col").val());
    if (maxi > 12 || maxj > 12) {
        alert("Input out of range.");
    } else {
        mat = matrixObjectInitNormal(maxi, maxj);
        //mat = matrixObjectInit(nrow,ncol);
        genMat(maxi, maxj);
    }
}



function genMat(maxi, maxj) {
    $(".cell_env").empty();

    $(".cell_env").css({
        "height": (104*maxi+104).toString() + "px",
        "width": (90*maxj+90).toString() + "px",
    });

    for (var i = 0; i < maxi; i++) {
        appendLine(i, maxj);
    }
    pageInitial();
}

function appendLine(i, maxj) {
    var line = '<div class="cell_row">\n'
    for (var j = 0; j < maxj; j++) {
        line += htmlCell(i, j, Math.floor(j/2)!=j/2);
    }
    line += '</div>\n';
    $(".cell_env").append(line);
}

function htmlCell(i, j, odd) {
    var cellCode1 = '\
        <div class="cell';
    var cellCode2 = '" id="c_';
    var cellCode3 = '_';
    var cellCode4 = '">\n\
            <div class="cell_type">\n\
                <span class="left"></span>\n\
                <span class="middle"></span>\n\
                <span class="right"></span>\n\
                <div class="img"></div>\n\
            </div>\n\
        </div>\n';
    if (odd) {
        return cellCode1 + ' odd' + cellCode2 + i + cellCode3 + j + cellCode4;
    } else {
        return cellCode1 + cellCode2 + i + cellCode3 + j + cellCode4;
    }
}

// onclick

function OnClickCell() {
    mat.updateByObj($(this));
    updateClassCell($(this));
}

function updateClassCell(obj, abbr) {
    if (!abbr) {
        var abbr = $(".type_selected").attr("abbr");
    }
    var cellType = obj.children(".cell_type");
    cellType.removeClass();
    cellType.addClass("cell_type");
    cellType.addClass(abbr);
}


// type picker

function OnClickType() {
    var abbr = $(this).attr("abbr");
    $(".type_selected").attr("abbr", abbr);
    $(".type_cover").removeClass("type_cover_selected");
    $(this).parent().addClass("type_cover_selected");
}




// misc

function scaleObjectInit() {
    o = new Object();
    o.scale = 1;
    $(".cell_env").css("-webkit-transform-origin", "0 0");

    o.zoomOut = function () {
        if (this.scale < 1) {
            this.scale += 0.1;
            $(".cell_env").css("-webkit-transform", "scale("+this.scale+")");
            //$(".cell_env").style.zoom = this.scale;
        }
    }
    o.zoomIn = function () {
        if (this.scale > 0.2) {
            this.scale -= 0.1;
            $(".cell_env").css("-webkit-transform", "scale("+this.scale+")");
        }
    }
    return o;
}

scaleObj = scaleObjectInit();



// local storage
function saveData() {
    localStorage.mat = JSON.stringify(mat);
    //localStorage.abbr = $(this).attr("abbr");
}

function loadData() {
    // genmat
    var m = JSON.parse(localStorage.mat);
    mat = matrixObjectInit(0,0);
    mat.copy(m);
    mat.importData();
    // set abbr
}


// page initial
if (localStorage.mat) {
    loadData();
} else {
    init();
}

// top bar
$("#btn_gen").click(init);
$("#btn_clr").click(function() {
    localStorage.clear();
    mat.reset();
    mat.importData();
});

$("#btn_l").click(function() {
    scaleObj.zoomOut();
});
$("#btn_s").click(function() {
    scaleObj.zoomIn();
});


// export
$("#btn_export").click(function() {
    //$(".hex").each(exportEach)
    $(".matrixtext").val(mat.exportData());
});
$("#btn_export_tight").click(function() {
    $(".matrixtext").val(mat.exportDataTight());
});
$("#btn_save").click(function() {
    var m = JSON.stringify(mat);
    $(".matrixtext").val("save://"+m);
});

$("#btn_load").click(function() {
    var text = $(".matrixtext").val();
    if (text.slice(0,7) == "save://") {
        var m = JSON.parse(text.slice(7));
        mat.copy(m);
        mat.importData();
    } else {
        alert("format error");
    }
});

$(window).unload(saveData);


//循环所有元素,
//画布大小问题--能否自动缩放或者便捷地缩放
//cookie与本地保存机制
//通过JSON自动生成菜单--动态生成时用$().css()无法生成一直有效的格式效果（比如当cell刷新时）
