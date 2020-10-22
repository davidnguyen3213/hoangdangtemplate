function insertCards(cards){
  Logger.log(cards[0]);
    var sheet = SpreadsheetApp.getActive().getActiveSheet();
    var row = sheet.getActiveCell().getRow();
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert('Chèn từ dòng '+row+' ?', ui.ButtonSet.YES_NO);
  if(confirm != ui.Button.YES) return;
   for(j=0;j<cards.length;j++)
  {
    Logger.log(j);
    Logger.log(cards[j]);
      sheet.getRange('B'+row).setValue(cards[j][1]);
      sheet.getRange('D'+row).setValue(cards[j][0]);
       row++;
  }

}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function importCard(card){

 initVar();
//card = {'id': "5e44a8dc3090b8211f3e0cec", 'title': "AT1302205-Gearhuman 2D No Internet Custom Tshirt Hoodies Apparel", 'labels':['Type-shirt2D','Animal'] , 'members': ['5d478edead625889313be8d1','5d22a26c9f13dd6cd05c13aa'], 'thumb': "https://trello-attachments.s3.amazonaws.com/5dce57…3f49b8d7ab63c3b57f43a0c1d79dc/MEN_S_T-SHIRT_5.jpg"};
   var sheet= SpreadsheetApp.getActive();
  var sImport = sheet.getSheetByName('Products import');
  var sSample = sheet.getSheetByName('Product-template');
  
//  var ui =  SpreadsheetApp.getUi();
//    var confirm = ui.alert('Bắt đầu import ? ', ui.ButtonSet.YES_NO);
//  if(confirm == ui.Button.NO) return;
  
  
  
  var user = getUser(splitSKU(card.title)[0].substr(3,2));
  var ptype = (getType(card.labels)=='Shirt3D')?'shirt3D':getType(card.labels);
  var cats = getCats(card.labels);
Logger.log(ptype);
   var feed = sSample.getRange('temp_'+ptype);
  var campInfo = sheet.getRangeByName('camp_info').getValues();
 // dateFolder = DriveApp.getFolderById('189uNE2UfQDesOuep9bcJyOvrx75ABAso');
 
   //change handle
  var handler = splitSKU(card.title)[1].split(' ').join('_')+'_'+splitSKU(card.title)[0];
    sSample.getRange('A'+feed.getRow()+':A'+feed.getLastRow()).setValue(handler);
  
  //change title
    sSample.getRange('B'+feed.getRow()).setValue(splitSKU(card.title)[1]);

  //change categories 
    sSample.getRange('E'+feed.getRow()).setValue(splitSKU(card.title)[0]);
  
    
  //Change Tags
  //var temptags =  sSample.getRange('J'+feed.getRow()).getValue();
  
  var extraTag = campInfo.filter(function(e){ return e[1]== card.title.substr(0,1);})
  //var extraTag = [['Gearhuman',	'HD','','https://gearhuman.com/products/']];
  var domain = (extraTag.length>0)?extraTag[0][3]:'';
  extraTag = (extraTag.length>0)?','+extraTag[0][2]:'';
  sSample.getRange('F'+feed.getRow()).setValue(cats.join(',')+extraTag);
  

  
 //change parent 
  var temp_varSKU = sSample.getRange('N'+feed.getRow()+':N'+feed.getLastRow()).getValues();
   sSample.getRange('N'+feed.getRow()+':N'+feed.getLastRow()).setValues(modSKU(splitSKU(card.title)[0],temp_varSKU));
  
  var attachments = UrlFetchApp.fetch('https://api.trello.com/1/cards/'+card.id+'/attachments?key='+APIKey+'&token='+APIToken);
 attachments = JSON.parse(attachments);

 var aimages =    commonProductImages(attachments);
   sSample.getRange('X'+feed.getRow()+':X'+feed.getLastRow()).clear();
  sSample.getRange('X'+feed.getRow()+':X'+(feed.getRow()+aimages.length-1)).setValues(aimages);
  
    for(r=feed.getRow();r<feed.getLastRow()+1;r++){
      var vtype = sSample.getRange('I'+r).getValue().toLowerCase().replace(/ /g,'-');
      var ilink = getVarImage(vtype,attachments);
      if(ilink) sSample.getRange('AB'+r).setValue(ilink);
      else  sSample.getRange('AB'+r).setValue('');
    
 }
  
  sSample.getRange('A'+feed.getRow()+':AC'+feed.getLastRow()).copyTo(sImport.getRange('A'+(sImport.getDataRange().getLastRow()+1)));  
  
//  sSample.getRange('J'+feed.getRow()).setValue(temptags);
  sSample.getRange('N'+feed.getRow()+':N'+feed.getLastRow()).setValues(temp_varSKU);
  
  var fdate = new Date();
  fdate = zeroFill(fdate.getDate(),2)+'/'+zeroFill(fdate.getMonth()+1,2)+'/'+fdate.getYear(); 
  card.thumb = (card.thumb.indexOf('trello-attachments.s3.amazonaws.com')==-1)? UrlFetchApp.fetch('https://bot.navitee.com/curl.php?url=' + encodeURIComponent( card.thumb)):card.thumb;
  var sheet = "Imported";
  if(domain == "https://casespring.com/products/"){
    sheet = "Casespring";
  }
 SpreadsheetApp.getActive().getSheetByName(sheet).appendRow([card.title,fdate,card.thumb,'=image("'+card.thumb+'",1)',user,domain+handler, bitly(domain+handler,RebrandAPI),card.id]); 
 return card;
  
   
  
}

function getDomain(campCode){

   var campinfo = SpreadsheetApp.getActive().getRangeByName('camp_info').getValues();
  var result = campinfo.filter(function(e){return e[1]==campCode});
}

function splitSKU(cardTitle){
   return [cardTitle.substr(0,cardTitle.lastIndexOf('-')),cardTitle.substr(cardTitle.lastIndexOf('-')+1,cardTitle.length-1)]
  

}

function modSKU(sku,varSKUs){
  var result = [];
  for each (varSKU in varSKUs){
    if(varSKU!='')
     result.push([sku+'-'+varSKU[0]])
     else result.push(['']);
  }
  return result;
}

function getVarImage(type,attachments){
  var totalimages =false; 
  for(i=0;i<attachments.length;i++){
      var at = attachments[i]; 
      if(at.name.split('MK.')[0].replace('main','').toLowerCase()==type){
        totalimages= at.url;
      }
      
    }
  return totalimages;
}
function commonProductImages(attachments){
  var totalimages = []; 
  var firstIMG = '';
  for(i=0;i<attachments.length;i++){
      var at = attachments[i]; 
      if(at.name.indexOf('MK.')!=-1){
        at.url =(at.url.indexOf('trello-attachments.s3.amazonaws.com')==-1)? UrlFetchApp.fetch('https://bot.navitee.com/curl.php?url=' + encodeURIComponent( at.url)):at.url;
        if(  at.name.indexOf('main')!=-1) firstIMG = at.url ;
        else totalimages.push([at.url]);
      }
      
    }
  if(firstIMG!='') totalimages.unshift([firstIMG]);
  return totalimages;
}

function dressImage(sSample,feed,attachments){
  var sheet = SpreadsheetApp.getActive();
  var types = ['red','pink','gray','green'];
  var totalimages = [];
  for(j=0;j<types.length;j++){
    for(i=0;i<attachments.length;i++){
      var at = attachments[i]; 
      if(at.name.split('MK.')[0]==types[j]){
        totalimages.push(at.url);
        sheet.getRangeByName('dress'+types[j]).setValue(at.url);
      }
      
    }
  }
   //change categories 
    sSample.getRange('K'+feed.getRow()).setValue(totalimages.join(','));

}

function shirt3dImage(sSample,feed,attachments){
  var sheet = SpreadsheetApp.getActive();
  var types = ['hoodie','sweater','tshirt','ziphoodie'];
  var totalimages = [];
  for(j=0;j<types.length;j++){
    for(i=0;i<attachments.length;i++){
      var at = attachments[i]; 
      if(at.name.split('.')[0]==types[j]){
        totalimages.push(at.url);
        sheet.getRangeByName(types[j]+'3d').setValue(at.url);
      }
      
    }
  }
   //change categories 
    sSample.getRange('K'+feed.getRow()).setValue(totalimages.join(','));

}

function saveFile(folder,link,fname,mockupFolder){
   
   var file = UrlFetchApp.fetch(link);
   file =  folder.createFile(file.getBlob());
   file.setName(fname);
  if(mockupFolder) file.makeCopy(mockupFolder);

}

function getTagFolder(userfolder,name){
     var tagfolders=  userfolder.getFolders()
     while(tagfolders.hasNext()){
       var fd = tagfolders.next();
       if(fd.getName()==name) return fd;
     }
      return userfolder.createFolder(name);
}
  
  function getColorFolder(tagFolder,color){
    var colorfolder=  tagFolder.getFolders()
     while(colorfolder.hasNext()){
       var fd = colorfolder.next();
       if(fd.getName()==color) return fd;
     }
      return tagFolder.createFolder(color);
  
  }

function getDateFolder(colorFolder,fdate){
  
  var dateFolder=  colorFolder.getFolders()
     while(dateFolder.hasNext()){
       var fd = dateFolder.next();
       if(fd.getName()==fdate) return fd;
     }
      return colorFolder.createFolder(fdate);

}

  function getColor(tags){
     for(i=0;i<tags.length;i++){
    var result = colortags.filter(function(e){ return e.id == tags[i] });
    if(result.length>0) return result[0];
     }
    return false;
  }
  
function getType(tags){
   for(i=0;i<tags.length;i++){
     if(tags[i].indexOf('Type-')!=-1) return tags[i].split('-')[1];
    }
    return false;
 }  
function getCats(tags){
  var result = []
   for(i=0;i<tags.length;i++){
     if(tags[i].indexOf('Type-')==-1) result.push(tags[i]);
    }
    return result;
 }  
  
function getUser(member){

  var sellercode = SpreadsheetApp.getActive().getRangeByName('sellercode').getValues();
  var result = sellercode.filter(function(e){ return e[1]==member});

  if(result.length>0) return result[0][0];
  return '';

}