var names = ['Ayumu','Kasumi','Shizuku','Karin','Ai','Kanata','Setsuna','Emma','Rina'];
			
var colors = ['#ffb6c1','#ffff93','#add8e6','#4169e1','#ff7c00','#e2a9f3','#ff0000','#90ee90','#ffffff'];
//var colors = ['#ED7D95','#E7D600','#01B7ED','#485EC6','#FF5800','#A664A0','#D81C2F','#84C36E','#9CA5B9'];
//var colors = ['#FFCDD8','#F6E94A','#93E6FF','#8CA0FF','#FF9C68','#D57ECD','#FF6070','#B8FF9F','#CDCDCD'];

var years = [2017,2018,2019];

var month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var months = [];

var num_months = 0;

for (var year = 2017; year <= 2019; year++) {
	var i = (year == 2017 ? 7 : 1);
	for (i; i <= 12; i++) {
		var m = i <= 9 ? '0'.concat(i) : i;
		months.push(year+"-"+m);
	}
}

var plot_width = 1024;

function filter_unique(val, idx, arr) {
	return arr.indexOf(val) == idx;
}

function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

function compute_yearly_average(row, idx, arr) {
	var relevant_arr = arr.filter(function(val){ return val.member == row.member && val.year == row.year; });
	var arr_to_current = relevant_arr.slice(0,relevant_arr.indexOf(row)+1);
	var avg = arr_to_current.reduce(function(total, val){return total + parseInt(val.rank); }, 0) / arr_to_current.length;
	return {year: row.year, month: row.month, member: row.member, avg: avg};
}

function compute_alltime_average(row, idx, arr) {
	var relevant_arr = arr.filter(function(val){ return val.member == row.member; });
	var arr_to_current = relevant_arr.slice(0,relevant_arr.indexOf(row)+1);
	var avg = arr_to_current.reduce(function(total, val){return total + parseInt(val.rank); }, 0) / arr_to_current.length;
	return {year: row.year, month: row.month, member: row.member, avg: avg};
}

function download_image(gd) {
	var plot_area_hidden = document.getElementById('div_plotarea_hidden');
	Plotly.downloadImage(plot_area_hidden, {format: 'png', filename: 'niji_rankings_'+months[num_months-1]});
}

function draw_plot(rows) {
	var plot_area = document.getElementById('div_plotarea');
	var plot_area_hidden = document.getElementById('div_plotarea_hidden');
	
	var data = [];
	for (var i = 0; i < 9; i++) {
		var trace = {
			x: unpack(rows, 'month'),
			y: unpack(rows, 'rank'),
			mode: 'lines',
			type: 'scatter',
			name: names[i],
			transforms: [
				{
					type: 'filter',
					target: unpack(rows, 'member'),
					operation: '=',
					value: names[i]
				}
			],
			line: {
				color: colors[i],
				width: 3
			}
		};
		data.push(trace);
	}
	
	var layout = {
		title: {
			text: 'Nijigasaki Monthly Rankings',
			font: {
				size: 24,
				color: '#f8f9fa'
			}
		},
		xaxis: {
			type: 'date',
			dtick: 'M1',
			hoverformat: '%b %Y',
			rangeslider: {
				visible: true,
				thickness: 0.1
			},
			rangeselector: {
				buttons: [
					{
						count: 1,
						step: 'year',
						stepmode: 'todate',
						label: 'Current Year'
					},
					{
						count: 6,
						step: 'month',
						stepmode: 'backward',
						label: 'Last 6 months'
					},
					{step: 'all'}
				],
				bgcolor: '#999'
			}
		},
		yaxis: {
			title: 'Rank',
			nticks: 9,
			range: [1,9],
			autorange: 'reversed',
			fixranged: true,
			showgrid: true,
			gridcolor: '#505358'
		},
		height: 600,
		width: 1024,
		margin: {
			pad: 5,
			b: 100
		},
		font: {
			color: '#dcddde',
			size: 14,
			family: 'Calibri, Arial, sans-serif'
		},
		showlegend: true,
		legend: {
			orientation: 'h',
			x: 0.05,
			y: -0.5
		},
		dragmode: 'pan',
		paper_bgcolor: $(':root').css('--dark'),
		plot_bgcolor: $(':root').css('--dark'),
		annotations: [
			{
				xref: 'paper',
				yref: 'paper',
				x: 0.05,
				y: -0.6,
				xanchor: 'left',
				yanchor: 'bottom',
				text: 'Click a member\'s name to toggle visibility of their graph. Double-click a member\'s name to only show that member\'s graph.',
				showarrow: false
			}
		]
	};
	
	
	var plotoptions = {
		displaylogo: false,
		modeBarButtonsToAdd: [
			{
				name: 'customimg',
				title: 'Download as Image',
				icon: Plotly.Icons.camera,
				click: download_image
			}
		],
		modeBarButtonsToRemove: ['zoom2d','zoomIn2d','zoomOut2d','toImage','toggleSpikelines']
	};

	Plotly.newPlot(plot_area, data, layout, plotoptions);
	
	var layout_hidden = $.extend(true,{},layout);
	layout_hidden.xaxis.rangeslider.visible = false;
	layout_hidden.xaxis.rangeselector.visible = false;
	layout_hidden.legend.y = -0.1;
	layout_hidden.width = plot_width;
	delete(layout_hidden.annotations);
		
	var data_hidden = data;
	var plotoptions_hidden = $.extend({},plotoptions);
	Plotly.newPlot(plot_area_hidden, data_hidden, layout_hidden, plotoptions_hidden);
}

function generate_links() {
	var curryear;
	for (var i = num_months - 1; i >= 0; i--) {
		var obj = new Date(months[i]);
		
		var year = obj.getFullYear();
		var month = obj.getMonth();
		
		if (!curryear || curryear != year) {
			var yeargroup = $('<div>',{class:'nav bg-dark text-light',id:'div_'+year});
			$('#div_result_links').append(yeargroup);
			
			var yeargrouplabel = $('<h4>',{class:'nav-link',html:year});
			$('<div>',{class:'nav-item'}).append(yeargrouplabel).appendTo(yeargroup);
			
			curryear = year;
		}
		var url = 'https://lovelive-as.bushimo.jp/vote/v'+months[i].replace('-','')+'/';
		var link = $('<a>',{class:'nav-link text-light',href:url,html:month_names[month]});
		$('<div>',{class:'nav-item'}).append(link).insertAfter('#div_'+year+' div.nav-item:first-child');
	}
}

function draw_moving_avg(rows) {
	var baselayout = {
		title: {
			font: {
				size: 24,
				color: '#f8f9fa'
			}
		},
		xaxis: {
			type: 'date',
			dtick: 'M1',
			hoverformat: '%b %Y'
		},
		yaxis: {
			title: 'Rank',
			nticks: 9,
			range: [1,9],
			autorange: 'reversed',
			fixranged: true,
			showgrid: true,
			gridcolor: '#505358',
			hoverformat: '.4f'
		},
		width: 1024,
		height: 600,
		margin: {
			pad: 5,
			t: 100
		},
		font: {
			color: '#dcddde',
			size: 14,
			family: 'Calibri, Arial, sans-serif'
		},
		showlegend: true,
		dragmode: 'select',
		paper_bgcolor: $(':root').css('--dark'),
		plot_bgcolor: $(':root').css('--dark')
	};
	
	var plotoptions = {
		displaylogo: false,
		displayModeBar: false
	};
	
	var yearly_avg = rows.map(compute_yearly_average);
	var alltime_avg = rows.map(compute_alltime_average);
	
	var i = 0;
	for (i in years) {
		var year = years[i];
		var data = [];
		for (var memberidx in names) {
			var trace = {
				x: unpack(yearly_avg, 'month'),
				y: unpack(yearly_avg, 'avg'),
				mode: 'lines',
				type: 'scatter',
				name: names[memberidx],
				transforms: [
					{
						type: 'filter',
						target: unpack(yearly_avg, 'year'),
						operation: '=',
						value: year
					},
					{
						type: 'filter',
						target: unpack(yearly_avg, 'member'),
						operation: '=',
						value: names[memberidx]
					}
				],
				line: {
					color: colors[memberidx],
					width: 3
				}
			};
			data.push(trace);
		}
		
		var plot_area = $('<div>',{class:'div_plotarea carousel-item'});
		var tab = $('<buttonn>',{'type':'button','class':'btn btn-dark btn-avg','data-target':'#carousel-moving-avg','data-slide-to':i,html:year});
		if (i == years.length - 1) {
			$(plot_area).addClass('active');
			$(tab).addClass('active');
		}
		$('#carousel-moving-avg .carousel-inner').append(plot_area);
		$('#carousel-moving-avg .btn-group-years').append(tab);
		
		var layout = $.extend({},baselayout);
		layout.title.text = year;
		var relevant_arr = unpack(yearly_avg.filter(function(val){ return val.year == year; }), 'month').filter(filter_unique);
		layout.xaxis.range = [relevant_arr.shift(),year+"-12"];
		
		Plotly.newPlot(plot_area.get(0), data, layout, plotoptions);
	}
	
	i++;
	
	var data = [];
	for (var memberidx in names) {
		var trace = {
			x: unpack(alltime_avg, 'month'),
			y: unpack(alltime_avg, 'avg'),
			mode: 'lines',
			type: 'scatter',
			name: names[memberidx],
			transforms: [
				{
					type: 'filter',
					target: unpack(alltime_avg, 'member'),
					operation: '=',
					value: names[memberidx]
				}
			],
			line: {
				color: colors[memberidx],
				width: 3
			}
		};
		data.push(trace);
	}
	
	var plot_area = $('<div>',{class:'div_plotarea carousel-item'});
	var tab = $('<buttonn>',{'type':'button','class':'btn btn-dark btn-avg','data-target':'#carousel-moving-avg','data-slide-to':i,html:'All Time'});
	$('#carousel-moving-avg .carousel-inner').append(plot_area);
	$('#carousel-moving-avg .btn-group-all').append(tab);
	
	var layout = $.extend({},baselayout);
	layout.title.text = "All Time Average";
	var relevant_arr = unpack(alltime_avg, 'month').filter(filter_unique);
	layout.margin.b = 50;
	layout.xaxis.range = [relevant_arr.shift(),relevant_arr.pop()];
		layout.xaxis.rangeslider = {
		visible: true,
		thickness: 0.1
	};
	layout.xaxis.rangeselector = {
		buttons: [
			{
				count: 1,
				step: 'year',
				stepmode: 'todate',
				label: 'Current Year'
			},
			{
				count: 6,
				step: 'month',
				stepmode: 'backward',
				label: 'Last 6 months'
			},
			{step: 'all'}
		],
		bgcolor: '#999'
	};
	
	Plotly.newPlot(plot_area.get(0), data, layout, plotoptions);
}

function process_csv(rows) {
	num_months = unpack(rows, 'month').filter(filter_unique).length;
	
	plot_width = (num_months +  4) * 60;
	
	draw_plot(rows);
	generate_links();
	draw_moving_avg(rows);
}

$(document).ready(function(){
	Plotly.d3.csv("ranks.csv",process_csv);
	
	$('#carousel-moving-avg').on('click','.btn-avg',function(){
		$(this).addClass('active');
		$('#carousel-moving-avg .btn-avg').not(this).removeClass('active');
	});
});