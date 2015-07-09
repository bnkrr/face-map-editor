#!/usr/local/bin/luajit

--print("hello world")

JSON = (loadfile "JSON.lua")()

ClassPickerGen = {
	-- file in map edit folder
	map_editor_path = "../",
	css_path = "css/cell_type_style.css",
	html_path = "index.html",

	-- file in tools folder
	cell_type_path = "cell_type.json",
	html_template_path = "html_template.html"
}

-- css pattern
ClassPickerGen.cssPat1 = [[
.cell .%s .img {
    background-image: url(../%s);
}
]]

ClassPickerGen.cssPat2 = [[
.picker  .type_%s {
    background-image: url(../%s);
}
]]

ClassPickerGen.htmlPat = [[
    <div class="type_cover %s">
        <div class="type type_%s" abbr="%s"></div>
    </div>
]]

function ClassPickerGen:new(o)
	o = o or {}
	setmetatable(o, self)
	self.__index = self

	self:parseCellType()
	
	return o
end

function ClassPickerGen:parseCellType()
	local f = assert(io.open(self.cell_type_path, "r"))
	local jsonTxt = f:read("*all")
	f:close()
	self.jsonContent = JSON:decode(jsonTxt)
	--print(self.jsonContent["cell_type_picker"][2]["cell_type"])
end

function ClassPickerGen:genCss()
	local tmp
	local fout = assert(io.open(self.map_editor_path .. self.css_path, "w"))
	for i, v in ipairs(self.jsonContent["cell_type_picker"]) do
		if v["image_in_cell"] == "none" then 		-- only display in picker
			tmp = string.format(self.cssPat2, v["cell_type"], v["image_path"])
			fout:write(tmp)
		else
			tmp = string.format(self.cssPat1, v["cell_type"], v["image_path"])
			fout:write(tmp)
			tmp = string.format(self.cssPat2, v["cell_type"], v["image_path"])
			fout:write(tmp)
		end
	end
	fout:close()
end

function ClassPickerGen:genHtml()
	local fin = assert(io.open(self.html_template_path, "r"))
	local fout = assert(io.open(self.map_editor_path .. self.html_path, "w"))
	local tmp
	local pickerHtml = ""
	local htmlTemplate = fin:read("*all")
	fin:close()

	for i, v in ipairs(self.jsonContent["cell_type_picker"]) do
		tmp = string.format(self.htmlPat, "", v["cell_type"], v["cell_type"])
		pickerHtml = pickerHtml .. tmp
	end

	tmp = string.format(htmlTemplate, pickerHtml)
	fout:write(tmp)
	fout:close()

end



local cp = ClassPickerGen:new()
cp:genCss()
cp:genHtml()
