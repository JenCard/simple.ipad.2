
(function(){
	
// create table view data object
var data = [];
var db = Ti.Database.open('feedDB')
db.execute('CREATE TABLE IF NOT EXISTS tblfeed (title VARCHAR(16) NOT NULL, url VARCHAR(16) NOT NULL, description VARCHAR(16))');
		


		var feedRS = db.execute('SELECT title,url,description FROM tblfeed');
		var x = 0;
		while (feedRS.isValidRow())
		{
		  var title = feedRS.fieldByName('title');
		  var url = feedRS.fieldByName('url');
		  var description = feedRS.fieldByName('description');

		  var row = Ti.UI.createTableViewRow({height:50});
		  var label = Ti.UI.createLabel({
					text:title,
					left:72,
					top:5,
					bottom:5,
					right:5				
				});
			row.add(label);
			data[x++] = row;
			row.url = description;
		  
		  //Ti.API.info(title + ' ' + url + ' ' + description);
		  Ti.API.info(description);
		  feedRS.next();
		}
		feedRS.close();
		var tableview = Titanium.UI.createTableView({data:data});
		
		
		var button = Titanium.UI.createButton({title:'Update', width:70, left:240, height:25, top:10});
		Titanium.UI.currentWindow.add(tableview);
		Titanium.UI.currentWindow.add(button);
		
		tableview.addEventListener('click',tableClick);			
		
		function tableClick(e) {
		var evtData = {
			"row" : e.row.title,
			"url": e.row.url
		}
		Ti.App.fireEvent('app:rowClicked', evtData);
		}
		
		button.addEventListener('click',refresh);
		function refresh(e) {
			
			var xhr = Ti.Network.createHTTPClient();
			
			if (Titanium.Network.online) 
			{
				
				xhr.open("GET","http://kidscreen.com/feed/");
				xhr.onload = function()
			{
				try
				{
					db.execute('DELETE FROM tblfeed')
					var doc = this.responseXML.documentElement;
					var items = doc.getElementsByTagName("item");
					var x = 0;
					var doctitle = doc.evaluate("//channel/title/text()").item(0).nodeValue;
					for (var c=0;c<items.length;c++)
					{
						var item = items.item(c);			
						var title = item.getElementsByTagName("title").item(0).text;
						var url = item.getElementsByTagName("link").item(0).text;
						var description = item.getElementsByTagName("description").item(0).text;
						db.execute('INSERT INTO tblfeed (title,url,description) VALUES (?,?,?)',title,url,description);
					}
					
				}
				catch(E)
				{
					alert(E);
				}
			};
			xhr.send();
			show();
				
			}else{
				alert('No internet connection detected.  You are now reading offline.')
				
			}



		}
		
		function show(){
			alert('DB updated but need to refresh list!');
		}

	
})();