
(function(){
	var db = Ti.Database.open('feedDB')
	var data = [];	
	var xmlurl = 'http://kidscreen.com/feed/';
	var labeltime = Titanium.UI.createLabel({
					text:'bla',
					left:5,
					bottom:650
				});
	var tableview = Titanium.UI.createTableView({data:data, top:50});
	Titanium.UI.currentWindow.add(tableview);
	tableview.addEventListener('click',tableClick);
	
	function updatetable(){
		
		

		var xhr = Ti.Network.createHTTPClient();
		xhr.open("GET",xmlurl);
		xhr.onload = function()
		{
			try
			{
		
				db.execute('delete from tblfeed13');
				var doc = this.responseXML.documentElement;
				var items = doc.getElementsByTagName("item");
				var x = 0;
				var doctitle = doc.evaluate("//channel/title/text()").item(0).nodeValue;
				for (var c=0;c<items.length;c++)
				{
					var item = items.item(c);			
					var title = item.getElementsByTagName("title").item(0).text;
					var url = item.getElementsByTagName("link").item(0).text;
					db.execute('INSERT INTO tblfeed13 (title,url) VALUES (?,?)',title,url);
				}
			}
			catch(E)
			{
				alert(E);
			}
		};
		xhr.send();
	}
	function showlist()
	{
		
		var feedRS = db.execute('SELECT title,url FROM tblfeed13');

		var x = 0;
		while (feedRS.isValidRow())
		{
		  var title = feedRS.fieldByName('title');
		  var url = feedRS.fieldByName('url');

		  var row = Ti.UI.createTableViewRow({height:50});
		  var label = Ti.UI.createLabel({
					text:title,
					left:10,
					top:5,
					bottom:5,
					right:5				
				});
			row.add(label);
			data[x++] = row;
			row.url = url;

		  Ti.API.info(title + ' ' + url + ' ');
		  feedRS.next();
		}
		feedRS.close();

		tableview.data=data;
					

	}
	function tableClick(e) {
		var evtData = {
			"row" : e.doctitle,
			"title": e.row.url 
		}
		Ti.App.fireEvent('app:rowClicked', evtData);
	}	
	
	try
	{
		var updatefromrss = '';
		var lastdate = '';
		
		db.execute('CREATE TABLE IF NOT EXISTS tblfeed13 (title VARCHAR(16) NOT NULL, url VARCHAR(16) NOT NULL, timeupdated DATETIME DEFAULT CURRENT_TIMESTAMP)');
		var currentlist = db.execute('SELECT timeupdated FROM tblfeed13');
		if (currentlist.isValidRow())		{	
			lastdate='Last updated at ' + currentlist.fieldByName('timeupdated');
			
			 
		}else{
			
			updatefromrss = 'yes';
			var d = new Date();
			lastdate='Last updated at ' + d;
		}
		currentlist.close();
		labeltime.text=lastdate;
		Titanium.UI.currentWindow.add(labeltime);
		
		
		
		var updatelist = Titanium.UI.createButton({
			title:'Update'
		});	
		Titanium.UI.currentWindow.setRightNavButton(updatelist);
		updatelist.addEventListener('click', function() {
			updatetable();
          	showlist();
          	var d = new Date();
          	labeltime.text='Last updated at ' + d;
		});
		
		if (updatefromrss == 'yes' && Titanium.Network.networkType != Titanium.Network.NETWORK_NONE){
			updatetable();
		}
		showlist();

		



	}
	catch(E)
	{
		alert(E);
	}



})();