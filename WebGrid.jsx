#target photoshop

var columnWidth = 60;
var gutterWidth = 20;
var columnCount = 12;
    
var rowHeight = 18;
var alignment = 'center';

var drawVerticalGuides = true;
var drawHorizontalGuides = false;
    
try {
    var docRef = app.activeDocument;
    var webGrid = new WebGrid();

    webGrid.createDialog ();
    webGrid.runDialog ();
} catch (e) {
   alert("No document is open!"); 
}


function WebGrid() {

    this.guide = new Guide();
    
    this.createDialog = function() {
		var res =
			"dialog { \
				webGrid: Group { orientation: 'row',  \
					column: Panel { orientation: 'column', borderStyle: 'sunken', \
						text: 'Columns', \
						width: Group { orientation: 'row', alignment: 'right',\
							s: StaticText { text:'Column Width' }, \
							e: EditText { text: '"+columnWidth+"',preferredSize: [70, 20] }, \
						}, \
						gutterWidth: Group { orientation: 'row', alignment: 'right', \
							s: StaticText { text:'Gutter Width' }, \
							e: EditText { text: '"+gutterWidth+"',preferredSize: [70, 20] }, \
						}, \
                           count: Group { orientation: 'row', alignment: 'right', \
							s: StaticText { text:'Column Count' }, \
							e: EditText { text: '"+columnCount+"',preferredSize: [70, 20] }, \
						}, \
                           alignStr: Group { orientation: 'row', alignment: 'left', \
                                    s: StaticText { text:'Alignment' }, \
						}, \
                           align: Group { orientation: 'row', alignment: 'center', \
								l:RadioButton { text: 'left'}, \
                                    c:RadioButton { text: 'center', value:true}, \
                                    r:RadioButton { text: 'right'}\
						}, \
						draw: Group { orientation: 'row', alignment: 'left', \
								c:Checkbox { text: 'drawing Columns', value: "+drawVerticalGuides+" }, \
						} \
					}, \
                      row: Panel { orientation: 'column', borderStyle: 'sunken', alignment: 'top', \
						text: 'Rows', \
						height: Group { orientation: 'row', alignment: 'right',\
							s: StaticText { text:'Row Height' }, \
							e: EditText { text: '"+rowHeight+"',preferredSize: [70, 20] }, \
						}, \
						draw: Group { orientation: 'row', alignment: 'left', \
								c:Checkbox { text: 'drawing Rows', value: "+drawHorizontalGuides+" }, \
						} \
					}, \
                    } \
                 info: Group { orientation: 'row',  \
                      info: Panel { orientation: 'column', borderStyle: 'sunken', width: 100%, alignment: 'top', \
						text: 'Information', \
                           name: Group { orientation: 'row', alignment: 'left',\
							s: StaticText { text:'Document Name' }, \
                                i: StaticText { text:'"+docRef.name+"' } \
						}, \
						width: Group { orientation: 'row', alignment: 'left',\
							s: StaticText { text:'Document Width' }, \
                                i: StaticText { text:'"+docRef.width.as('px')+" px' } \
						}, \
                           height: Group { orientation: 'row', alignment: 'left',\
							s: StaticText { text:'Document Height' }, \
                                i: StaticText { text:'"+docRef.height.as('px')+" px' } \
						}, \
						 gridWidth: Group { orientation: 'row', alignment: 'left', \
							s: StaticText { text:'Grid Width' }, \
							e: StaticText { text:'' }, \
						}, \
                          rowCount: Group { orientation: 'row', alignment: 'left', \
							s: StaticText { text:'Row Count' }, \
							e: StaticText { text:'' }, \
					    },\
					}, \
                    }\
                 buttons: Group { orientation: 'row',  \
					buttons: Group { orientation: 'row', alignmentChildren: 'right',  \
						okBtn: Button { text:'OK', properties:{name:'ok'} }, \
						cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
					} \
				} \
			}";


		this.dialog = new Window(res,'Web Grid');

		var d = this.dialog;
    
        d.graphics.backgroundColor = d.graphics.newBrush (d.graphics.BrushType.THEME_COLOR, "appDialogBackground");
        d.okBtn = d.buttons.buttons.okBtn;
        d.columnWidth = d.webGrid.column.width.e;
        d.gutterWidth = d.webGrid.column.gutterWidth.e;
        d.columnCount = d.webGrid.column.count.e;
        d.rowHeight = d.webGrid.row.height.e;
	} 

    this.runDialog = function () {
        var d = this.dialog;
        var webGrid = this;
        this.updateValues();
        
        d.rowHeight.onChanging = d.columnWidth.onChanging = d.gutterWidth.onChanging = d.columnCount.onChanging = function() {
            webGrid.updateValues();
        }
        
        d.okBtn.onClick = function() {
            webGrid.setValues();
            if (drawVerticalGuides) {
                webGrid.guide.drawVerticalGuides();
            }
            if (drawHorizontalGuides) {
                webGrid.guide.drawHorizontalGuides();
            }
            d.close();
        }
        this.dialog.show();  
    }

    this.updateValues = function() {
            var info = this.dialog.info.info;
            this.setValues();
            info.rowCount.e.text = this.guide.calcNumberOfRowGuides();
            info.gridWidth.e.text = this.guide.calcGridWidth()+" px";
    }

    this.setValues = function() {
        var d = this.dialog;
        columnWidth = Number(d.webGrid.column.width.e.text);
        gutterWidth = Number(d.webGrid.column.gutterWidth.e.text);
        columnCount = Number(d.webGrid.column.count.e.text);
    
        rowHeight = Number(d.webGrid.row.height.e.text);

        drawVerticalGuides = d.webGrid.column.draw.c.value;
        drawHorizontalGuides = d.webGrid.row.draw.c.value;
        
        if (d.webGrid.column.align.c.value) {
            alignment =  'center';
        } else if (d.webGrid.column.align.l.value) {
            alignment =  'left';
        } else {
            alignment =  'right';
        }
    }
 }

function Guide() {
    
    this.VERTICAL_ORIENTATION = "Vrtc";
    this.HORIZONTAL_ORIENTATION = "Hrzn";
    
    this.calcNumberOfRowGuides = function() {
        return Math.floor(Number(docRef.height.as('px')) / rowHeight);
    }

    this.calcGridWidth = function() {
        return (gutterWidth + columnWidth) * columnCount; 
    }

    this.calcVerticalStartingPoint = function() {
        switch (alignment) {
            case 'center':
                return Math.round(Number(docRef.width.as('px')) / 2 - (this.calcGridWidth() / 2));
                break;
            case 'right':
                return Number(docRef.width.as('px')) - (this.calcGridWidth());
                break;
            default:
                return 0;
        }
    }

    this.drawVerticalGuides = function() {
        var padding = Math.round(gutterWidth / 2);
        var startPoint = this.calcVerticalStartingPoint();
        var gridWith = this.calcGridWidth();
        
        for (var i = 0; i < columnCount; i++) {
            offset = startPoint + (gutterWidth + columnWidth) * i;
            this.setGuide(offset, this.VERTICAL_ORIENTATION);
            this.setGuide(offset + padding, this.VERTICAL_ORIENTATION);
            this.setGuide(offset + padding + columnWidth, this.VERTICAL_ORIENTATION);
        }
        this.setGuide(startPoint + gridWith, this.VERTICAL_ORIENTATION);
    }

    this.drawHorizontalGuides = function() {
        for (var i = 1; i <= this.calcNumberOfRowGuides(); i++) {
            this.setGuide(i * rowHeight, this.HORIZONTAL_ORIENTATION);
        }
    }
    
    /**
        * grid.jsx function
        * Author: Liang Wang<bonede@gmail.com>
        */
    this.setGuide = function (pxOffest, orientation){
        var desc = new ActionDescriptor();
        var desc1 = new ActionDescriptor();
        desc1.putUnitDouble( charIDToTypeID( "Pstn" ), charIDToTypeID( "#Pxl" ), pxOffest );
        desc1.putEnumerated( charIDToTypeID( "Ornt" ), charIDToTypeID( "Ornt" ), charIDToTypeID( orientation ) );
        desc.putObject( charIDToTypeID( "Nw  " ), charIDToTypeID( "Gd  " ), desc1 );
        executeAction( charIDToTypeID( "Mk  " ), desc ); // , DialogModes.NO
    }
}
