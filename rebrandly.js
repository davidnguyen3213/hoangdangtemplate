function rebrandly(link){
 
    var  rebrandAPI = SpreadsheetApp.getActive().getRangeByName('rebrandlyAPI').getValue();
    
     var options = {'method' : 'post',
                    'contentType': 'application/json',
                   'payload' : JSON.stringify({
                     "destination" : link,
                     "domain": { "fullName": "rebrand.ly" }
                     
                   }),
                    'headers': {
                      "Content-Type": "application/json",
                      "apikey": rebrandAPI
                    }
                  }
     
     
      var bitlink  = UrlFetchApp.fetch('https://api.rebrandly.com/v1/links',options);
     bitlink = JSON.parse(bitlink);
     return 'https://'+bitlink.shortUrl;
    
  
   
  
 
 }
 
 
 
 function bitly(link,token){
  if(link.indexOf('http')==-1) return '';
   token = '40b54911b245d8c39629918725d5cc3bf6097fa1';
   
   
   var options = {'method' : 'post',
                    'contentType': 'application/json',
                   'payload' : JSON.stringify({
                     "long_url" : link
                     
                   }),
                    'headers': {
                      "Content-Type": "application/json",
                      "Authorization": 'Bearer '+token
                    }
                  }
   
      var bitlink  = UrlFetchApp.fetch('https://api-ssl.bitly.com/v4/bitlinks',options);
     bitlink = JSON.parse(bitlink);
    
      Logger.log(bitlink);
   return bitlink.link.replace('http://','https://');
   
      //API Address: https://api-ssl.bitly.com/v3/shorten?access_token=R_315b34491c1646b291c51fef684d5f88&longUrl=
      //GET 
 
 
 
 }
 
 