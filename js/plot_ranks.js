var names = ['Ayumu','Kasumi','Shizuku','Karin','Ai','Kanata','Setsuna','Emma','Rina'];
			
var colors = ['#ffb6c1','#ffff93','#add8e6','#4169e1','#ff7c00','#e2a9f3','#ff0000','#90ee90','#ffffff'];
//var colors = ['#ED7D95','#E7D600','#01B7ED','#485EC6','#FF5800','#A664A0','#D81C2F','#84C36E','#9CA5B9'];
//var colors = ['#FFCDD8','#F6E94A','#93E6FF','#8CA0FF','#FF9C68','#D57ECD','#FF6070','#B8FF9F','#CDCDCD'];
			
var ranks = [
	[4,6,6,9,8,8,8,6,6,7,6,5,6,6,5,5,4,5,5],
	[3,7,4,4,4,4,6,4,3,3,2,4,7,4,4,1,3,6,6],
	[6,3,3,5,6,6,3,8,7,8,8,6,9,5,6,6,6,7,7],
	[5,8,5,1,2,1,2,1,1,1,3,2,2,2,3,7,2,3,3],
	[9,9,7,7,5,5,7,3,4,5,5,7,4,8,7,9,9,2,4],
	[8,4,9,6,3,3,5,5,5,6,4,3,1,1,2,4,5,8,8],
	[2,1,1,2,1,2,4,2,2,2,1,1,3,3,1,3,7,1,2],
	[7,5,8,8,9,7,9,7,8,4,7,8,8,9,8,8,8,4,1],
	[1,2,2,3,7,9,1,9,9,9,9,9,5,7,9,2,1,9,9]
];

var month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var months = [];

for (var year = 2017; year <= 2019; year++) {
	var i = (year == 2017 ? 7 : 1);
	for (i; i <= 12; i++) {
		var m = i <= 9 ? '0'.concat(i) : i;
		months.push(year+"-"+m);
	}
}

var plot_width = (ranks[0].length +  4) * 60;

function download_image(gd) {
	var plot_area_hidden = document.getElementById('div_plotarea_hidden');
	Plotly.downloadImage(plot_area_hidden, {format: 'png', filename: 'niji_rankings_'+months[ranks[0].length-1]});
}

function draw_plot() {
	var plot_area = document.getElementById('div_plotarea');
	var plot_area_hidden = document.getElementById('div_plotarea_hidden');
	
	var data = [];
	for (var i = 0; i < 9; i++) {
		var trace = {
			x: months,
			y: ranks[i],
			mode: 'lines',
			type: 'scatter',
			name: names[i],
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
				size: 24
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
					//{
					//	count: 1,
					//	step: 'year',
					//	stepmode: 'todate',
					//	label: 'Current Year'
					//},
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
		//width: (ranks[0].length +  4) * 80,
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
	for (var i = ranks[0].length - 1; i >= 0; i--) {
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

$(document).ready(function(){
	
	draw_plot();
	generate_links();
	
});