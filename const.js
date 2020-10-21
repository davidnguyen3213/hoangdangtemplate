/*

var APIKey = 'a8989e3a9817dc2b1e463f9006a493be';
var APIToken = 'f6c5687822b0d06381a26949a1e41c2399a1360cb8eb95c3e5d5c9307415c993';
// https://api.trello.com/1/members/me/boards?key=e600081346e4af3737de7854a36a70bf&token=c1cfced315cab944e8e85fe814864e258d1e020f16c5438c2f8358bc9ae93cc0
var BoardID = 'HdLah8Iu';
var SKU_list = '5d03668ce94050528e7b1577';
var NeedToRun_list = '5d0353d79e849c8372179f77';

var PNG_FoldedID = '1izV04igDT0wb-HouAaFMGJh75huaQPkL';

var storeDomain = 'https://wozoro.com';
var consumer_key = 'ck_cef862bbebd1ba13b9bb45ecad6da8eb4c752ba8';
var secret_key = 'cs_80794ad5912cee960d38bdabc371ca9dead4c751';

var stores=[
['https://wozoro.com','ck_cef862bbebd1ba13b9bb45ecad6da8eb4c752ba8','cs_80794ad5912cee960d38bdabc371ca9dead4c751'],
  ['https://89fashion.com','ck_8abcc0b78f4db0bbcf7912d6b4b4d5442e10a8a6','cs_62fb2318f873b4e909276d135ba43df4d63b4bfe']
];

*/

var APIKey = '';
var APIToken = '';
// https://api.trello.com/1/members/me/boards?key=e600081346e4af3737de7854a36a70bf&token=c1cfced315cab944e8e85fe814864e258d1e020f16c5438c2f8358bc9ae93cc0
var BoardID = '';

//Edit APIKey
var RebrandAPI = '3d525bd360b444418f330f40e0037128';

var SKU_list = '';


var NeedToRun_list = '';

var importDoneList = '';

var PNG_FoldedID = '';




function initVar(){
  
  if(APIKey==''){
    var global =   SpreadsheetApp.getActive().getRangeByName('global').getValues();
    APIKey = global[0][0];
    APIToken = global[0][1];
    BoardID = global[0][3];
    RebrandAPI = global[0][2];
    SKU_list = global[0][4];
     NeedToRun_list = global[0][5];
    importDoneList = global[0][6];
    PNG_FoldedID =global[0][7];
    
    
   Logger.log('init');  
  }
  
}


function updateUser(){
  initVar();
  var ssheet = SpreadsheetApp.getActive();
  var sheet=  SpreadsheetApp.getActive().getSheetByName('Config');
  var range = ssheet.getRangeByName('users');
  range.clear();

  var users = UrlFetchApp.fetch('https://api.trello.com/1/boards/'+BoardID+'/members?key='+APIKey+'&token='+APIToken)
   users= JSON.parse(users);
  var result =[];
  for (i=0;i<users.length;i++){
    result.push([users[i].username,users[i].id]);
  }

  
  sheet.getRange(range.getRowIndex(),range.getColumn(),result.length,result[0].length).setValues(result);
  
   range = ssheet.getRangeByName('lists');
  
    var users = UrlFetchApp.fetch('https://api.trello.com/1/boards/'+BoardID+'/lists?key='+APIKey+'&token='+APIToken)
   users= JSON.parse(users);
  var result =[];
  for (i=0;i<users.length;i++){
    result.push([users[i].name,users[i].id]);
  }
  sheet.getRange(range.getRowIndex(),range.getColumn(),result.length,result[0].length).setValues(result);
  
  
  range = ssheet.getRangeByName('labels');
  
    var users = UrlFetchApp.fetch('https://api.trello.com/1/boards/'+BoardID+'/labels?key='+APIKey+'&token='+APIToken)
   users= JSON.parse(users);
  var result =[];
  for (i=0;i<users.length;i++){
    result.push([users[i].name,users[i].id]);
  }
  sheet.getRange(range.getRowIndex(),range.getColumn(),result.length,result[0].length).setValues(result);
  
  
  
}



function initLabels(){
  initVar();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
  for each (label in labels){
    Logger.log(label.name);
    if(label.name.indexOf('Type-')!=-1){
      var options = {
        'method':'post',
        'payload':{
          'key':APIKey,
          'token':APIToken,
          'name':label.name,
          'idBoard':BoardID,
          'color':'null'
        }
        
      }
     
     var result = UrlFetchApp.fetch('https://api.trello.com/1/labels',options);
      Logger.log(result);
    }
     
  
  }
}