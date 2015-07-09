//cookie 保存
//基于lua的菜单生成

// page initial
function pageInitial() {
    $(".cell").click(OnClickCell);
    $(".type").click(OnClickType);
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

function updateClassCell(obj) {
    var abbr = $(".type_selected").attr("abbr");
    var cellType = obj.children(".cell_type");
    //alert(abbr);
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



// export




// page initial
init();


$("#btn_export").click(function() {
    //$(".hex").each(exportEach)
    $(".matrixtext").val(mat.exportData());
});
$("#btn_export_tight").click(function() {
    $(".matrixtext").val(mat.exportDataTight());
});


// misc, not well functional

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
$("#btn_l").click(function() {
    scaleObj.zoomOut();
})
$("#btn_s").click(function() {
    scaleObj.zoomIn();
})


//循环所有元素,
//画布大小问题--能否自动缩放或者便捷地缩放
//cookie与本地保存机制
//通过JSON自动生成菜单--动态生成时用$().css()无法生成一直有效的格式效果（比如当cell刷新时）
