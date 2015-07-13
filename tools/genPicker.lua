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
ClassPickerGen.cssPat0 = [[
.picker  .type_%s {
    background-image: url(../%s);%s
}
]]

ClassPickerGen.cssPat1 = [[
.cell .%s .bubble {
    background-image: url(../%s);%s
}
]]

ClassPickerGen.cssPat2 = [[
.cell [%s=%s] .%s {
    background-image: url(../%s);%s
}
]]



ClassPickerGen.htmlPat1 = [[
    <div class="type_cover %s">
        <div class="type type_%s" abbr="%s"></div>
    </div>
]]

ClassPickerGen.htmlPat2 = [[
    <div class="type_cover %s">
        <div class="type type_%s" abbr="%s" displaylevel="%s"></div>
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
	local psize
	local csize
	local fout = assert(io.open(self.map_editor_path .. self.css_path, "w"))
	for i, v in ipairs(self.jsonContent["cell_type_picker"]) do
		if v["picker_size"] ~= nil then
			psize = string.format("\n    background-size: %s;", v["picker_size"])
		else
			psize = ""
		end
		if v["cell_size"] ~= nil then
			csize = string.format("\n    background-size: %s;", v["cell_size"])
		else
			csize = ""
		end
		if v["image_in_cell"] == "none" then 		-- only display in picker
			tmp = string.format(self.cssPat0, v["cell_type"], v["image_path"], psize)
			fout:write(tmp)
		elseif v["image_in_cell"] == "background" or v["image_in_cell"] == "foreground" then
			tmp = string.format(self.cssPat0, v["cell_type"], v["image_path"], psize)
			fout:write(tmp)
			tmp = string.format(self.cssPat2, string.sub(v["image_in_cell"],0,4), v["cell_type"], string.sub(v["image_in_cell"],0,4), v["image_path"], cisze)
			fout:write(tmp)
		else
			tmp = string.format(self.cssPat0, v["cell_type"], v["image_path"], psize)
			fout:write(tmp)
			tmp = string.format(self.cssPat1, v["cell_type"], v["image_path"], csize)
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
		if v["image_in_cell"] == "background" or v["image_in_cell"] == "foreground" then
			tmp = string.format(self.htmlPat2, "", v["cell_type"], v["cell_type"], string.sub(v["image_in_cell"],0,4))
		else
			tmp = string.format(self.htmlPat1, "", v["cell_type"], v["cell_type"])
		end
		pickerHtml = pickerHtml .. tmp
	end

	tmp = string.format(htmlTemplate, pickerHtml)
	fout:write(tmp)
	fout:close()

end



local cp = ClassPickerGen:new()
cp:genCss()
cp:genHtml()
