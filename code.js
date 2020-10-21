function onOpen(){

    SpreadsheetApp.getUi().createMenu('Trello').addItem('Show trello', 'showTrello').addSeparator().addItem('Create Tasks', 'createTask').addSeparator().addItem('Update Trello', 'updateUser')
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Empty SKU List').addItem('Delete all cards', 'emptySKU')).addToUi();
    
  
    SpreadsheetApp.getUi().createMenu('Export ads').addItem('Export','exportAds').addToUi();
    
    SpreadsheetApp.getUi().createMenu('Facebook').addItem('Post to Facebook','postMulti').addToUi();
  }
  
  
  
  
  function exportAds(){
    initVar();
    var activeRange = SpreadsheetApp.getActive().getActiveRange();
    var ui = SpreadsheetApp.getUi();
   
    var locked_range = SpreadsheetApp.getActive().getRangeByName('lockedexport').getCell(2,1);
    if(locked_range.getValue()!=''){
       var cf = ui.alert(locked_range.getValue()+' đang export. Vui lòng đợi hoặc ấn YES để tiếp tục.',ui.ButtonSet.YES_NO); 
      if(cf!= ui.Button.YES ) return;  
    
    }
    
    var confirm = ui.alert('Khởi tạo '+ activeRange.getNumRows()+ ' card ? ' , ui.ButtonSet.YES_NO);
    if(confirm != ui.Button.YES) return;
     resetAds();
    
    var mkfolder = getMockupFolder();
    locked_range.setValue(mkfolder.getName());
    
     var files= mkfolder.getFiles();
     while(files.hasNext()){ files.next().setTrashed(true); }
    
     for(k=0;k<activeRange.getNumRows();k++){
         var cell = activeRange.getCell(k+1,1);
         var sourceRow = getSKURow(cell.getValue().substr(0,1));
       //  getProductLink(cell,skubody);
       
       processCell(cell,sourceRow);
     }
    
   
    
    SpreadsheetApp.getActive().getSheetByName('Ads-export').activate();
    locked_range.setValue('');
    ui.showModalDialog(HtmlService.createHtmlOutput('<a target="_blank" href="'+mkfolder.getUrl()+'">Open mockup folder</a>'), 'Mockup folder');
  }
  
  function getSKURow(sku){
  
    var sheet=SpreadsheetApp.getActive().getSheetByName('SKU-Template');
    var datarange = SpreadsheetApp.getActive().getRangeByName('SKUBody').getValues();
    for(i=0;i<datarange.length;i++){
      if(datarange[i][0]==sku) {
       
         return sheet.getRange(i+2,2,1,sheet.getDataRange().getNumColumns());
      
      }
    }
    
    return false;
    
  
  }
  
  
  function processCell(cell,sourceRow){
    var sheet = SpreadsheetApp.getActive();
    var dessheet = sheet.getSheetByName('Ads-export');
    var datarow = sheet.getSheetByName('Imported').getRange(cell.getRow(),1,1,7);
    var sourceData = datarow.getValues();
    
    //campname 
    var fdate = new Date();
    var campname = splitSKU(sourceData[0][0])[0];
    fdate = zeroFill(fdate.getDate(),2)+''+zeroFill(fdate.getMonth()+1,2);
    sourceRow.getCell(1,1).setValue(fdate+'-'+sourceData[0][0]);
    sourceRow.getCell(1,2).setValue(campname);
    sourceRow.getCell(1,3).setValue(campname);
    //body
    var backupbody = sourceRow.getCell(1,4).getValue();
    var link = (sourceData[0][6]=='')?bitly(sourceData[0][5],RebrandAPI):sourceData[0][6];
    if(link=='') {SpreadsheetApp.getUi().alert(campname+' chưa có link'); return;}
    datarow.getCell(1,7).setValue(link);
    sourceRow.getCell(1,4).setValue(backupbody.replace('[link]',link));
    
    //image 
    var image= campname+'_'+sourceData[0][2].substring(sourceData[0][2]. lastIndexOf('/')+1);
    var mockupfolder= getMockupFolder();
    var file = UrlFetchApp.fetch(sourceData[0][2]);
     file =  mockupfolder.createFile(file.getBlob());
     file.setName(image);
    
    sourceRow.getCell(1,5).setValue(image);
    
    
    sourceRow.copyTo(dessheet.getRange('A'+(dessheet.getDataRange().getLastRow()+1)));
    sourceRow.getCell(1,4).setValue(backupbody);
     
  
  }
  
  
  function getMockupFolder(){
    var homeMockup = DriveApp.getFolderById(PNG_FoldedID);
  
   var mockupFolder=  homeMockup.getFolders();
   var foldername = Session.getActiveUser().getEmail();
       while(mockupFolder.hasNext()){
         var fd = mockupFolder.next();
         if(fd.getName()==foldername) {
          
           return fd;
         }
       }
        return homeMockup.createFolder(foldername);
   }
  
  
  function getProductLink(cell,skubody){
    var pname = cell.getValue();
    var sku = pname.substr(0,pname.lastIndexOf('-'));
    var sub = sku.substr(0,1);
    var domain = skubody.filter(function(e){return e[0]==sub;})
    domain = (domain.length>0)?domain[0][1]:'';
    if(domain==''){   cell.offset(0, 3).setValue('Domain not found'); return;}
    domain = stores.filter(function(e){return e[0]==domain;})
    
     var headers = {
      "Authorization" : "Basic " + Utilities.base64Encode(domain[0][1]+':'+domain[0][2])
      };
      
      var params = {
        "method":"GET",
        "headers":headers
      };
      
      var response = UrlFetchApp.fetch(domain[0][0]+'/wp-json/wc/v3/products/?sku='+sku, params);
      var result = 'not found';
    Logger.log(response);
      response = JSON.parse(response);
      
      if(response.length>0){
         var item = response[0];
        if(item.status !=-1)
        result = item.id;
        
      }
    cell.offset(0,2).setValue(domain[0][0]);
    cell.offset(0, 3).setValue(result);
      cell.offset(0, 4).setValue(domain[0][0]+'/?p='+result);
      
     
  }
  
  function resetAds(){
    var sheets = SpreadsheetApp.getActive().getSheetByName('Ads-export'); 
    var datarange = sheets.getDataRange();
    sheets.getRange(2,1, datarange.getNumRows(), datarange.getNumColumns()).clear();
  }
  
  
  function createRange(){
     
  }
  
  function showTrello(){
      initVar();
     var ui = HtmlService.createTemplateFromFile('trello').evaluate()
        .setTitle('Trello');
      SpreadsheetApp.getUi().showSidebar(ui);
  }
  
  
  function createFolder(){
  
     var pngfd=   DriveApp.getFolderById(PNG_FoldedID);
  var  sheets =    SpreadsheetApp.getActive().getSheets();
    for(i=0;i<sheets.length;i++){
       var userfolder=  pngfd.createFolder(sheets[i].getName());
       Logger.log(userfolder.getName() + ' '+userfolder.getId());
    }
  }
  
  
    
  function createTask(){
    
    initVar();
    
    var ui = SpreadsheetApp.getUi();
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = SpreadsheetApp.getActive().getActiveSheet();
    
    var members =spreadsheet.getRangeByName('users').getValues();
    var labels = spreadsheet.getRangeByName('labels').getValues();
    
    var range = sheet.getActiveRange();
    
    var confirm = ui.alert('Khởi tạo '+ (range.getNumRows()*range.getNumColumns()+ ' card ? ') , ui.ButtonSet.YES_NO);
    
    if(confirm == ui.Button.NO) return;
    
    var sheetname = SpreadsheetApp.getActive().getRangeByName('sellername').getValue();
    
    
    var user = members.filter(function(e){return e[0]==sheetname});
    
    if(user.length==0) {ui.alert('Username '+sheetname+' không thấy. \n'); return false;}
   
    
    for(i=0;i<range.getNumColumns();i++){
     
      var colhead = sheet.getRange(1, range.getCell(1, i+1).getColumn() ).getValue() ;
  
      var color = labels.filter(function(e){return e[0] == colhead});
      
       if(color.length==0) {ui.alert('Label '+colhead+' không thấy. \n Bắt đầu quá trình cập nhật thông tin Trello. Nếu lỗi tiếp tục xuất hiện, label '+colhead +' chưa được tạo trên Trello!!!'); updateUser(); return false;}
    
      for(j=0;j<range.getNumRows();j++){
         var taskname = range.getCell(j+1,i+1).getValue();
        var options = {
          'method':'post',
          'payload':{
            'key':APIKey,
            'token':APIToken,
            'name':taskname,
            'idList':SKU_list,
            'idMembers':user[0][1],
            'idLabels':color[0][1]
          }
          
        }
        
       var result = UrlFetchApp.fetch('https://api.trello.com/1/cards',options);
        Logger.log(result);
      }
    }
    
    ui.alert('Done!!!')
  }
  
  
  function emptySKU(){
    initVar();
    var ui=SpreadsheetApp.getUi();
    var cards = UrlFetchApp.fetch('https://api.trello.com/1/lists/'+SKU_list+'/cards?key='+APIKey+'&token='+APIToken);
    
    cards = JSON.parse(cards);
    var delete_options = {
       'method' : 'DELETE',
       'contentType': 'application/json'
      }
    var confirm=   SpreadsheetApp.getUi().alert('Delete '+cards.length+' in SKU list?',ui.ButtonSet.YES_NO);
  
    if(confirm == SpreadsheetApp.getUi().Button.NO) return false;
    
   for(i=0;i<cards.length;i++){
      Logger.log(cards[i].id);
      UrlFetchApp.fetch('https://api.trello.com/1/cards/'+cards[i].id+'?key='+APIKey+'&token='+APIToken,delete_options);
    }
  }
  
  function testDelte(){
  
  var delete_options = {
       'method' : 'DELETE',
       'contentType': 'application/json'
      
  
       }
  //5c70bd96f70a24341bfbf54e
   var result=  UrlFetchApp.fetch('https://api.trello.com/1/cards/'+'5d03668ce94050528e7b1577'+'?key='+APIKey+'&token='+APIToken,delete_options);
    Logger.log(result);
  }
  
  
  function clearimport(){
     var sheet= SpreadsheetApp.getActive();
     var sImport = sheet.getSheetByName('Products import');
   if(  sImport.getDataRange().getNumRows()<2) return;
     sImport.getRange("A2:AC"+sImport.getDataRange().getNumRows()).clear();
  
  }
  
  function popupDownload(){
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<center><a target="_blank" href="https://docs.google.com/spreadsheets/d/1bzL8j5GjHQ7i-UxSqHiUk5JEmy-uK3esyYB1lfrgiG4/export?format=csv&id=1bzL8j5GjHQ7i-UxSqHiUk5JEmy-uK3esyYB1lfrgiG4&gid=1226989573">Download CSV</a><center>'), 'Download export file');
  
  }
  
  
  