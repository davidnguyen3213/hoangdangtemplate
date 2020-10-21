
function postMulti(){
    var range = SpreadsheetApp.getActiveSheet().getActiveRange();
   var ui = SpreadsheetApp.getUi();
   uiresponse =   ui.alert('Lưu ý!!!','Đăng '+range.getNumRows()+' bài, chắc chắn chứ?', ui.ButtonSet.YES_NO);
       
   if (uiresponse == ui.Button.YES) {
     for(i=0;i<range.getNumRows();i++){
       if(range.getCell(i+1, 1).getValue()!=='')
          var cell = range.getCell(i+1, 1);
        var sourceRow = getSKUTemplate(cell.getValue().substr(0,2));
      //   Logger.log(sourceRow.getValues());
         token_process(cell, sourceRow);
       
     }
     ui.alert('Done!!!');
   }
   
 
 }
 
 
 
 function getSKUTemplate(sku){
 
   var sheet=SpreadsheetApp.getActive().getSheetByName('SKU-Template-PostID');
   
   var datarange = SpreadsheetApp.getActive().getRangeByName('PostSKU').getValues();
   for(j=0;j<datarange.length;j++){
     if(datarange[j][0]==sku) {
      
        return sheet.getRange(j+2,2,1,sheet.getDataRange().getNumColumns());
     
     }
   }
   
   return false;
   
 
 }
 
 
 
 function token_process(cell,sourceRow){
   
   var ui = SpreadsheetApp.getUi(); 
   
   var cell_select = cell; 
   
   var pageID = cell_select.getValue();
 
   pageID = sourceRow.getCell(1,6).getValue().split(':')[1];
   
  
   if(pageID==''){ ui.alert('Không thấy pageID! '); return;  }
   
   
    var cell_token = SpreadsheetApp.getActive().getRangeByName('fbtoken');
     var token =  cell_token.getValue();
 
  var uiresponse='';
   
  var fbpage = check_token(token,pageID);
   
 
   Logger.log(fbpage);
   if(fbpage.access_token ){
     if(fbpage.is_published){
         setPost(cell,sourceRow,fbpage,fbpage.token);
       
     
     }
     else{
          ui.alert('Page '+ fbpage.name+ ' đã bị unpublished! ');
     }
 
   }
   else{
     
    
     var msg =(fbpage.error)?'Token đã quá hạn,Cập nhật lại token':'Page chưa được set editor cho account này. Nhập token mới hoặc kiểm tra lại quyền: ';
 
    uiresponse = ui.alert('Token error', msg +'\n\n'+ JSON.stringify(fbpage) , ui.ButtonSet.OK);
   
   }
   
  }
 
 function check_token(token,pageID){
   Logger.log('start check token');
   
    var fbgraph = 'https://graph.facebook.com/'+pageID+'?fields=access_token,is_published,name&access_token='+ encodeURI(token);
   Logger.log(fbgraph);
    var options = {
     'method' : 'get',
     'muteHttpExceptions':true
   };
   var result = UrlFetchApp.fetch(fbgraph, options);
   
   result = JSON.parse(result);
     return result;
   if(result.error) return result;
 
   
   
    return 'false';
 }
 
 
 
 function setPost(cell,sourceRow,fbpage,token){
   Logger.log(fbpage);
  
   var fbgraph = 'https://graph.facebook.com/';
    var ui = SpreadsheetApp.getUi();
  
   var post_info = sourceRow.getValues();
   var campdesc = post_info[0][3];
   var postlink = cell.offset(0,6 ).getValue();
   var postIMG = cell.offset(0,2 ).getValue();
   var msg = (campdesc !='')?campdesc.replace('[link]',postlink):'Limited edition\nOrder here: '+postlink+'\n-----------\n*SHARE & TAG Someone Who Would Love This!';
  
   var formData = {
     'message': msg,
     'published':'false',
     'url':postIMG,
     'access_token':fbpage.access_token
   };
   
   Logger.log(formData); 
  var options = {
     'method' : 'post',
     'payload' : formData,
     'muteHttpExceptions':true
   };
   var result =  UrlFetchApp.fetch(fbgraph + fbpage.id+'/photos', options);
   Logger.log('')
   result = JSON.parse(result);
   
  
  Logger.log(result);
   if(!result.error){
    //  ui.alert('Success! Post ID: '+result.id);
      
     cell.offset(0, 8).setValue(result.id);
   }
   else ui.alert(JSON.stringify(result.error));
    
 
 }