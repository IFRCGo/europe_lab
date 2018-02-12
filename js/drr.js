// Flatten hxl proxy data into JSON
function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function outputLinks(data) {
  var o1 = "";
      o2 = "";
      o3 = "";
      o4 = "";

  var cat1 = [];
  var cat2 = [];
  var cat3 = [];
  var cat4 = [];

  // Push list items to arrays by category
  for (i = 0; i < data.length; i++) {
    if (data[i]['#meta+cat'] == "Data") {
      cat1.push("<li><a href=" + data[i]['#url'] + ">" + data[i]['#name'] + "</a></li> ");
    } else if (data[i]['#meta+cat'] == "Projects") {
      cat2.push("<li><a href=" + data[i]['#url'] + ">" + data[i]['#name'] + "</a></li> ");
    } else if (data[i]['#meta+cat'] == "Useful Documents") {
      cat3.push("<li><a href=" + data[i]['#url'] + ">" + data[i]['#name'] + "</a></li> ");
    } else if (data[i]['#meta+cat'] == "Contacts") {
      cat4.push("<li><a href=" + data[i]['#url'] + ">" + data[i]['#name'] + "</a></li> ");
    }
  }
  console.log(cat4);

  for ( k = 0; k < 10; k++ ) {
    if (k > cat1.length - 1) { break; }
    o1 += cat1[k];
  }
  for ( k = 0; k < 10; k++ ) {
    if (k > cat2.length - 1) { break; }
    o2 += cat2[k];
  }
  for ( k = 0; k < 10; k++ ) {
    if (k > cat3.length - 1) { break; }
    o3 += cat3[k];
  }
  for ( k = 0; k < 10; k++ ) {
    if (k > cat4.length - 1) { break; }
    o4 += cat4[k];
  }

  var html1 = "";
      html1 = html1 + o1;

  var html2 = "";
      html2 = html2 + o2;

  var html3 = "";
      html3 = html3 + o3;
    
    var html4 = "";
      html4 = html4 + o4;

    console.log(html4);
    console.log(html2);

  $('#cat1Output').html(html1);
  $('#cat2Output').html(html2);
  $('#cat3Output').html(html3);
  $('#cat4Output').html(html4);
}

// Replace placeholder in URL with today's date to get only active appeals and DREFs
hxlCallURL = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vQkPFH7JuggNFSk3UFCDy6OdIfSh4sElL7iBgG5CTPIXMY740DLHGt1nAKC7FsslnhDf0tPPGOK0fcU%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv';

// Get appeals and DREFs data
$.ajax({
    type: 'GET',
    url: hxlCallURL,
    dataType: 'json',
    success:function(response){
        var data = hxlProxyToJSON(response);
        outputLinks(data);
    }
});