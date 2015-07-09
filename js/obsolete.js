function changeCellColor(id, color) {
    $("#"+id).children(".middle").css({
        "background-color": color,
    });
    $("#"+id).children(".left").css({
        "border-right-color": color,
    });
    $("#"+id).children(".right").css({
        "border-left-color": color,
    });
}

cellfunc = {};

cellfunc["fn"] = function (obj) {

    $("#"+id).attr("abbr", abbr);
    
    changeCellColor(id, cellColor[abbr]);

}

cellfunc["wn"] = function (id, abbr) {

    $("#"+id).attr("abbr", abbr);
    changeCellColor(id, cellColor[abbr]);

}



function exportEach() {
    var id = $(this).attr("id");
    mat.updateById(id);
}

cellColor = {
    "fn":"#FF1111",
    "wn":"#1111FF",
}

// cell type picker generate

function genPicker() {
    $(".picker").empty();

    for (var item in jsondata["cell_type_picker"]) {
        appendTypePicker(item);
        genTypeCss(item);
    }
}


function appendTypePicker(item, selected) {
    var code1 = '\
    <div class="type_cover">\n\
        <div class="type"></div>\n\
    </div>\n';
    $(".picker").append(code1);
    var obj = $(".picker .type_cover:last-child");
    if (selected) {
        obj.addClass("selected");
    }
    obj.filter(".type").addClass("type_"+item["cell_type"]);
    obj.filter(".type").attr("abbr", item["cell_type"]);
}

function genTypeCss(item) {
//        .cell .fn .img {
//    background-image: url(img/fn.png);
//}
}


function updateClassCell(obj, abbr, displaylevel) {
    if (!abbr) {
        var abbr = $(".type_selected").attr("abbr");
    }
    if (!displaylevel) {
        var displaylevel = $(".type_selected").attr("displaylevel");
    }
    var cellType = obj.children(".cell_type");
    if (abbr == "n") {
        cellType.removeClass();
        cellType.addClass("cell_type");
        cellType.removeAttr("fore");
        cellType.removeAttr("back");
    } else if (displaylevel) {
        if (abbr==cellType.attr(displaylevel)) { // if already has this block, remove it.
            cellType.removeAttr(displaylevel);
        } else {
            cellType.attr(displaylevel, abbr);
        }
    } else {
        if (cellType.hasClass(abbr)) {
            abbr = "n";
        }
        cellType.removeClass();
        cellType.addClass("cell_type");
        cellType.addClass(abbr);
    }
}