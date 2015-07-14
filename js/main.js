$("#btn_clr").click(function() {
    localStorage.clear();
    mat.reset();
    mat.cellUpdateAll();
});


// page initial
function pageInitial() {
    $(".cell").click(OnClickCell);
    $(".type").click(OnClickType);
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
    localStorage.clear();
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
            <div class="cell_type n">\n\
                <span class="left"></span>\n\
                <span class="middle"></span>\n\
                <span class="right"></span>\n\
                <div class="img bg"></div>\n\
                <div class="img back"></div>\n\
                <div class="img bubble"></div>\n\
                <div class="img fore"></div>\n\
            </div>\n\
        </div>\n';
    if (odd) {
        return cellCode1 + ' odd' + cellCode2 + i + cellCode3 + j + cellCode4;
    } else {
        return cellCode1 + cellCode2 + i + cellCode3 + j + cellCode4;
    }
}

function setIJ(maxi, maxj) {
    $("input.row").val(maxi.toString());
    $("input.col").val(maxj.toString());
}



// onclick

function OnClickCell() {
    mat.updateByObj($(this));
    mat.cellUpdateByObj($(this));
}




// type picker

function OnClickType() {
    var abbr = $(this).attr("abbr");
    var displaylevel = $(this).attr("displaylevel");
    $(".type_selected").attr("abbr", abbr);
    if (displaylevel) {
        $(".type_selected").attr("displaylevel", displaylevel);
    } else {
        $(".type_selected").removeAttr("displaylevel");
    }
    $(".type_cover").removeClass("type_cover_selected");
    $(this).parent().addClass("type_cover_selected");
}


// drop rate

function toggleDropRate() {
    if ($("#ckb_dr").prop("checked")) {
        $(".txt_dr").prop("readonly", false)
    } else {
        $(".txt_dr").prop("readonly", true)
    }
}



function setDropRate(dr) {
    if (dr == undefined) {
        $("#ckb_dr").prop("checked", false);
        toggleDropRate();
    } else {
        if (dr.BUBBLE_TYPE_WATER != undefined) {
            $(".txt_dr.wn").val(dr.BUBBLE_TYPE_WATER.toString());
        }
        if (dr.BUBBLE_TYPE_PLANT != undefined) {
            $(".txt_dr.pn").val(dr.BUBBLE_TYPE_PLANT.toString());
        }
        if (dr.BUBBLE_TYPE_FIRE != undefined) {
            $(".txt_dr.fn").val(dr.BUBBLE_TYPE_FIRE.toString());
        }
        if (dr.BUBBLE_TYPE_STAR != undefined) {
            $(".txt_dr.sn").val(dr.BUBBLE_TYPE_STAR.toString());
        }
    }
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
    mat.cellUpdateAll();
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

$("#btn_l").click(function() {
    scaleObj.zoomOut();
});
$("#btn_s").click(function() {
    scaleObj.zoomIn();
});


// export
$("#btn_export").click(function() {
    //$(".hex").each(exportEach)
    $(".matrixtext").val(mat.genExportString());
});
$("#btn_export_tight").click(function() {
    $(".matrixtext").val(mat.genExportString(tight=true));
});

$("#btn_import").click(function() {
    mat.parseImportData();
});


/*
$("#btn_save").click(function() {
    var m = JSON.stringify(mat);
    $(".matrixtext").val("save://"+m);
});

$("#btn_load").click(function() {
    var text = $(".matrixtext").val();
    if (text.slice(0,7) == "save://") {
        var m = JSON.parse(text.slice(7));
        mat.copy(m);
        mat.cellUpdateAll();
    } else {
        alert("format error");
    }
});
*/

$("#ckb_dr").click(toggleDropRate);

$(window).unload(saveData);


//画布大小问题--能否自动缩放或者便捷地缩放
//无限大的地图
//能否告别lua的菜单生成器？
//高级export行为

//debug
