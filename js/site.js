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

// Number formatting
function niceFormatNumber(num,round){
    if(isNaN(parseFloat(num))){
        return num;
    } else {
        if(!round){
            var format = d3.format("0,000");
            return format(parseFloat(num));
        } else {
            var output = d3.format(".4s")(parseFloat(num));
            if(output.slice(-1)=='k'){
                output = Math.round(output.slice(0, -1) * 1000);
                output = d3.format("0,000")(output);
            } else if(output.slice(-1)=='M'){
                output = d3.format(".1f")(output.slice(0, -1))+' million';
            } else if (output.slice(-1) == 'G') {
                output = output.slice(0, -1) + ' billion';
            } else {
                output = ''+d3.format(".3s")(parseFloat(num));
            }
            return output;
        }
    }
}

// Generate Areas of Focus Figures
function loadKeyFigures(url){
    var hxlurl = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url='+url;
    $.ajax({
            type: 'GET',
            url: hxlurl,
            dataType: 'json',
            success: function(result){
                var data = hxlProxyToJSON(result);
                console.log(data);
                var html = '<div class="column small-up-2 medium-up-3 large-up-3"><h1>Areas of Focus: People Reached</h1>';
                data.forEach(function(d){
                    html+='<div class="column"><div class="card padded"><img alt="'+d['#meta+title']+' Area of Focus" title="'+d['#meta+title']+'" class="text-center" width="100" src="img/'+d['#meta+icon']+'.svg"><h5 class="keyfiguretitle text-center">'+d['#meta+title']+'</h5><p class="keyfigure text-center">'+niceFormatNumber(d['#indicator'])+'</p><p class="small text-center">Source: <a href="'+d['#meta+url']+'" target="_blank">'+d['#meta+source']+'</a></p></div></div>'
                });
                html+='</div>'; //closing div

                // Send html to proper id
                $('#aof').html(html);
            }
    });
}

// Generate tables for appeals and DREFs
function createAppealsTable(data){
    // Initialize html tables
    var html1 = "";
    var html2 = "";

    // Run through data and prep for tables
    data.forEach(function(d,i){
        var url = 'http://ifrcgo.org/appeals/'+d['#meta+id'].toLowerCase()

        if(d['#severity']==='Emergency'){
            html1 += '<tr><td><a href="'+url+'" target="_blank">'+d['#crisis+name']+'</a></td><td>'+d['#date+start']+'</td><td>'+d['#date+end']+'</td><td>'+niceFormatNumber(d['#targeted'])+'</td><td>'+niceFormatNumber(d['#meta+value'])+'</td><td>'+niceFormatNumber(d['#meta+funding'])+'</td><td id="coverage'+i+'"></td><td><a href="'+url+'" target="_blank">'+d['#meta+id']+'</a></td></tr>';
        };
        if(d['#severity']==='Minor Emergency'){
            html2 += '<tr><td>'+d['#crisis+name']+'</td><td>'+d['#date+start']+'</td><td>'+d['#date+end']+'</td><td>'+niceFormatNumber(d['#targeted'])+'</td><td>'+niceFormatNumber(d['#meta+value'])+'</td><td>'+d['#meta+id']+'</td></tr>';
        }
    });
    // Send data to appeals or DREFs html tables
    $('#appealstable').append(html1);
    $('#drefstable').append(html2);
    
    data.forEach(function(d,i){
        createPie('#coverage'+i,60,10,d['#meta+coverage'].substring(0, d['#meta+coverage'].length - 1)/100);
    });
}

// Generation of appeal coverage pie charts
function createPie(id,width,inner,percent){

    //console.log(percent);
    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", width);

    var radius = width/2;

    var fundingArc = d3.svg.arc()
        .innerRadius(radius-inner)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(Math.PI*2*percent);

    var budgetArc = d3.svg.arc()
        .innerRadius(radius-inner)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(Math.PI*2);

    svg.append("path")
        .style("fill", "#dfdfdf")
        .attr("d", budgetArc)
        .attr("transform", "translate("+(width/2)+","+(width/2)+")");

    svg.append("path")
        .style("fill", "#D33F49")
        .attr("d", fundingArc)
        .attr("transform", "translate("+(width/2)+","+(width/2)+")");

    svg.append("text")
        .attr("x",width/2)
        .attr("y",width/2+5)
        .text(d3.format(".0%")(percent))
        .style("text-anchor", "middle");
}

// Identify URL for appeals and DREFs data
var hxlAppealsCallURL = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&filter01=select&select-query01-01=%23region%2Bname%3DEurope&filter03=merge&clean-date-tags01=%23date&filter02=select&merge-keys03=%23meta%2Bid&filter04=replace-map&filter05=merge&merge-tags03=%23meta%2Bcoverage%2C%23meta%2Bfunding&select-query02-01=%23date%2Bend%3E999999&merge-keys05=%23country%2Bname&merge-tags05=%23country%2Bcode&filter01=clean&replace-map-url04=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&merge-url03=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&merge-url05=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0';

// Determine today's date
    var today = new Date();
    var dd    = today.getDate();
    var mm    = today.getMonth()+1;
    var yyyy  = today.getFullYear();
    if(dd<10) {
        dd='0'+dd
    }
    if(mm<10) {
        mm='0'+mm
    }
    var date = yyyy + '-' + mm + '-' + dd;

// Replace placeholder in URL with today's date to get only active appeals and DREFs
hxlAppealsCallURL = hxlAppealsCallURL.replace('999999',date);

// Get appeals and DREFs data
$.ajax({
    type: 'GET',
    url: hxlAppealsCallURL,
    dataType: 'json',
    success:function(response){
        var data = hxlProxyToJSON(response);
        createAppealsTable(data);
    }
});

/* 
// Manual defining of appeals if needed for documents table creation
// NOTE: too many appeals so the URL is too long and cuts off even if you wanted this to work
var appeals = ['MDRTR003','MDRUA007','MDRIT002','MDRGR001','MDRRS011','MDRTJ025','MDRKG012','MDRRU021','MDRHU006','MDRTJ026'];

var hxlAppealString = '';

appeals.forEach(function(appeal,i){
    hxlAppealString+= '&select-query02-0'+(i+1)+'=%23meta%2Bid%3D'+appeal;
});

// Identify URL for documents data
var hxlDocumentsCallURL = 'https://proxy.hxlstandard.org/data.json?filter01=select&select-query01-01=%23region%2Bname%3DEurope&filter02=select&strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1gJ4N_PYBqtwVuJ10d8zXWxQle_i84vDx5dHNBomYWdU/edit%3Fusp%3Dsharing'+hxlAppealString;

// Get documents data
// Not needed right now
$.ajax({
    type: 'GET',
    url: hxlDocumentsCallURL,
    dataType: 'json',
    success:function(response){
        response = hxlProxyToJSON(response);
        // Create document table if needed
        appeals.forEach(function(a){
            $('#documents').append('<h3 id="appealname'+a+'" class="documenttitle"></h3><table id="documenttable'+a+'"><tr><th>Document</th><th>Country</th><th>Date</th></tr></table>');
            response.forEach(function(d){
                if(d['#meta+id']==a){
                    $('#appealname'+a).html(d['#meta+appealname']);
                    if(d['#meta+url'].substring(0,1)=='/'){
                        d['#meta+url'] = 'http://www.ifrc.org'+d['#meta+url'];
                    }
                    $('#documenttable'+a).append('<tr><td><a href="'+d['#meta+url']+'">'+d['#meta+documentname']+'</a></td><td>'+d['#country']+'</td><td>'+d['#date']+'</td></tr>');
                }
            });
        });
    }
});
*/

// Key figures from Europe Regional Office spreadsheet
loadKeyFigures('https://docs.google.com/spreadsheets/d/1EFFsb87GPVrKqjaBUQCQb6PRbvUEPwoAEHo0BhkTZ28/edit?usp=sharing');
