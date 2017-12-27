/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Christian Hoffmeister
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
//@include ./json2.js
(function() {
	var doc = null;
	try {
		doc = app.activeDocument;
	} catch (ex) {
		alert('You must have an active document');
		return;
	}

	var ab = doc.artboards[0];
	var width = ab.artboardRect[2] - ab.artboardRect[0];
	var height = ab.artboardRect[1] - ab.artboardRect[3];

	if (doc.path == '' || !doc.saved) {
		alert('You must save your document before exporting it');
		return;
	}

	if (width != 1024 || height != 1024) {
		alert('Your document has size ' + width + 'x' + height + ' pixels, but must have size 1024x1024 pixels');
		return;
	}

	var folder = getTargetFolder(doc);
	if (!folder) {
		alert('Canceled export');
		return;
	}
	if (!folder.exists) {
		folder.create();
	}

	var sizes = [16, 32, 128, 256, 512]
	var contentsJSON = {
		"images": [],
		"info": {
			"version": 1,
			"author": "Adobe Illustrator Script - IconSet Exporter"
		}
	};

	for (var idx = 0; idx < sizes.length; idx++) {
		var size = sizes[idx];
		var file = new File(folder + '/icon_' + size + 'x' + size + '.png');
		var file2x = new File(folder + '/icon_' + size + 'x' + size + '@2x.png');

		exportPNG(file, size);
		contentsJSON.images[idx * 2] = {
			"idiom": "mac",
			"size": size + 'x' + size,
			"filename": 'icon_' + size + 'x' + size + '.png',
			"scale": "1x"
		};

		exportPNG(file2x, size * 2);
		contentsJSON.images[idx * 2 + 1] = {
			"idiom": "mac",
			"size": size + 'x' + size,
			"filename": 'icon_' + size + 'x' + size + '@2x.png',
			"scale": "2x"
		};
	}
	doc.save()
	file = new File(folder + '/Contents.json');
	file.encoding = "UTF8";
	file.open("e", "TEXT", "????");
	txt = JSON.stringify(contentsJSON);
	file.write(txt);
	file.close();

	function exportPNG(file, size) {
		var expType = ExportType.PNG24;
		var exp = new ExportOptionsPNG24();
		exp.antiAliasing = true;
		exp.transparency = this.transparency;
		exp.artBoardClipping = true;
		exp.horizontalScale = size / 1024.0 * 100.0;
		exp.verticalScale = size / 1024.0 * 100.0;
		exp.transparency = true;

		doc.exportFile(file, expType, exp);
	}

	function getTargetFolder(doc) {
		var destFolder = Folder.selectDialog("Select the target folder", "~");
		if (destFolder) {
			var newName = '';
			if (doc.name.indexOf('.') < 0) {
				newName = doc.name + '.iconset';
			} else {
				var dot = doc.name.lastIndexOf('.');
				newName += doc.name.substring(0, dot);
				newName += '.iconset';
			}

			return new Folder(destFolder + '/' + newName)
		} else {
			return null
		}

	}

})();