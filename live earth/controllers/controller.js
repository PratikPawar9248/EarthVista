var app = angular.module('app', ['ngMaterial','ui-listView','angular.filter','ui.bootstrap','ngAnimate','rzModule','configBackDateLayerService','configLayerService','jsonResponseService','variableDeclarationService','measureService','featuresService','quickAccessService','showLayerSettingService','updateLayerSettingService','listingForSelectedLayerSettingService','websiteInfoService','startBaseOverlayService','startSatelliteLayerService','toggleTimeZoneService','layerOperationsService','syncRecentDataService','updateOrAddLayerService','probeAndTimeSeriesService','displayDateService','awsLayerService','dateFormatsService','displayMapService','panelSettingService','topMenuService','commonFunctionsService','weatherForecastService','layerSelectionService','addAnimationService','climatologyService','dragAndDropService']);

app.filter('filtersatlayer', function () {
	return function (items) {
		//console.log('in filter');
		var filtered = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			
//			if (((item.source.urlprefix || item.source.urlweather_forecast) && item.data_type!='satellite_analyzed_winds') && item.active) {
			if (((item.source.urlprefix || item.source.urlweather_forecast) && item.data_type!='satellite_analyzed_winds') && item.active && !(item.isContour)) {	//Updated By Jay On 01JAN2020
				filtered.push(item);
				
			}
		}
		//console.log('layer filetr length:- ',filtered.length)
		return filtered
	};
});

app.constant('myconfig',{
    name:'Kadir'
});

app.value('myValue', {
    vname:'kadir vname' 
});
app.directive('only_resizable', ['myconfig','myValue',function (myconfig,myValue) {
    return {
        restrict: 'A',
        
        link: function postLink(scope, elem, attrs) {
            elem.resizable({
                handles: " n, e, s, w, ne, se, sw, nw"
            });
            elem.on('resizestop', function (evt, ui) {
             
                
                var w = ui.size.width;
                var h = ui.size.height;
                
                document.getElementById('content_timeseries_new').style.width=w;
                document.getElementById('content_timeseries_new').style.height=h;
                scope.resize_timeseries_div();
                
                scope.$apply(function() {
                    if (scope.callback) { 
                        scope.callback({
                            $evt: evt, 
                            $ui: ui
                        }); 
                    }                
                })
            });
            elem.on('resizestart',function(evt,ui) {
               
                });
            elem.on('resizecreate',function(evt,ui) {
              
                });
            elem.on('resize',function(evt,ui) {
              
                elem.removeClass('enter');
                scope.$apply(function() {
                    if (scope.callback) { 
                        scope.callback({
                            $evt: evt, 
                            $ui: ui
                        }); 
                    }                
                })
            });
            elem.on('mouseover',function() {
               
                });
            elem.on('mouseleave',function() {
              
          
                });
            
         
      
                    
        }
    };
}]);


app.directive('resizable', ['myconfig','myValue',function (myconfig,myValue) {
    return {
        restrict: 'A',
        
        link: function postLink(scope, elem, attrs) {
            elem.resizable({
                handles: " n, e, s, w, ne, se, sw, nw"
            });
            elem.on('resizestop', function (evt, ui) {
             
                
                var w = ui.size.width;
                var h = ui.size.height;
                
                document.getElementById('content_timeseries_new').style.width=w;
                document.getElementById('content_timeseries_new').style.height=h;
                scope.resize_timeseries_div();
                
                scope.$apply(function() {
                    if (scope.callback) { 
                        scope.callback({
                            $evt: evt, 
                            $ui: ui
                        }); 
                    }                
                })
            });
            elem.on('resizestart',function(evt,ui) {
               
                });
            elem.on('resizecreate',function(evt,ui) {
              
                });
            elem.on('resize',function(evt,ui) {
              
                elem.removeClass('enter');
                scope.$apply(function() {
                    if (scope.callback) { 
                        scope.callback({
                            $evt: evt, 
                            $ui: ui
                        }); 
                    }                
                })
            });
            elem.on('mouseover',function() {
               
                });
            elem.on('mouseleave',function() {
              
          
                });
            
            elem.on('dblclick',function(el) {
               
                });

            elem.on('dragstop',function(event,ui) {
             
           
                });
            elem.draggable({
                containment: "#map"
            });
      
                    
        }
    };
}]);




app.controller('mainController', function($scope,$timeout,$http,$mdDialog,$window,$mdBottomSheet,configBackDateLayer,configLayer,jsonResponse,variableDeclaration,measure,features,quickAccess,showLayerSetting,updateLayerSetting,listingForSelectedLayerSetting,websiteInfo,startBaseOverlay,startSatelliteLayer,toggleTimeZone,layerOperations,syncRecentData,updateOrAddLayer,probeAndTimeSeries,displayDate,awsLayer,dateFormats,displayMap,panelSetting,topMenu,commonFunctions,weatherForecast,layerSelection,addAnimation,climatology,dragAndDrop) {
 
	/*=====================Update By Jay Starts On 21JAN2019===============================*/
	
	//For Update of animation slider when it's visibility is hidden and try to update slider
	
	$scope.refreshSlider = function() {
		$timeout(function() {
			$scope.$broadcast('rzSliderForceRender')
		});
		}
	
	/*=====================Update By Jay Ends On 21JAN2019===============================*/
	
	
	/*===========================Update By Jay Starts On 07JAN2020=============================*/
	

	function extend(obj1, obj2) {
		var obj = {};
		for ( var k in obj1) {
			obj[k] = obj1[k];
		}
		for ( var k in obj2) {
			obj[k] = obj2[k];
		}
		/*for ( var k in obj3) {
			obj[k] = obj3[k];
		}*/
		return obj;
	}               
    
    $scope.initializeDygraph=function(){
    	/*===========================Update By Jay Starts for dygraph on 12DEC19==============================*/
    	
    	$scope.content_timeseries_dygraph1=document.getElementById('content_timeseries_dygraph1');//Change at 16JUL2019
    	
    	$scope.content_timeseries_new_one=document.getElementById('content_timeseries_new');	//Updated And Added By Jay On 08JAN2020
    	
    	//$scope.content_timeseries_new_one=document.getElementById('content_timeseries_new');
    	
    $scope.plevels_time = [ 100.0, 115.0, 135.0,150.0, 200.0, 250.0, 300.0,350.0, 400.0, 430.0, 475.0,500.0, 570.0, 620.0, 670.0,700.0, 780.0, 850.0, 920.0,950.0, 1000.0 ]; //Change at 15JUL2019
        
        var csv_data='DateTime (Y-M-D HH:MM:SS),Water Vapor Count (Count)\n2019-05-01 14:29:00,849\n2019-05-01 11:00:00,822\n2019-05-01 04:00:00,815\n2019-05-01 21:30:00,883\n2019-05-01 22:00:00,889\n2019-05-01 08:00:00,825\n2019-05-01 12:29:00,808\n2019-05-01 00:30:00,826\n2019-05-01 07:30:00,821\n2019-05-01 04:30:00,814\n2019-05-01 15:00:00,844\n2019-05-01 16:00:00,856\n2019-05-01 13:29:00,837\n2019-05-01 23:59:00,867\n2019-05-01 03:00:00,823\n2019-05-01 02:30:00,822\n2019-05-01 00:00:00,832\n2019-05-01 16:30:00,866\n2019-05-01 07:00:00,814\n2019-05-01 22:30:00,913\n2019-05-01 23:29:00,879\n2019-05-01 02:00:00,819\n2019-05-01 05:30:00,809\n2019-05-01 10:29:00,819\n2019-05-01 06:30:00,807\n2019-05-01 08:59:00,840\n2019-05-01 01:00:00,826\n2019-05-01 09:29:00,834\n2019-05-01 05:00:00,813\n2019-05-01 06:00:00,805\n2019-05-01 15:29:00,853\n2019-05-01 08:30:00,823\n2019-05-01 09:59:00,823\n2019-05-01 12:59:00,818\n2019-05-01 03:30:00,816\n2019-05-01 01:30:00,822\n2019-05-01 14:00:00,853\n2019-05-01 17:00:00,839\n';
                        //var xlabel_text='DateTime (Y-M-D HH:MM:SS)'; Change at 16JUL2019
                        //var ylabel_text='Water Vapor Count (Count)'; Change at 16JUL2019
                        //var title_text='Water Vapor Count'; Change at 16JUL2019
    				    var xlabel_text=' ';
    				    var ylabel_text=' ';
    				    var title_text=' ';
                          var baseOpts = {
                            //rollPeriod : 14,
                            //errorBars : true,
                            //customBars : true,
                            labelsSeparateLines : true
                        };
                       	

                        $scope.dygraph_g2 = new Dygraph(
                            //$scope.content_timeseries_new_one, Change at 16JUL2019
                        		$scope.content_timeseries_dygraph1,
//                        		$scope.content_timeseries_new_one,
                            csv_data,
                            extend(
                                baseOpts,
                                {
                                    colors : [ "red" ],
                                    axes : {
                                        x : {
                                            gridLineWidth : 2,
                                            drawGrid : true,
                                            independentTicks : true
                                        },
                                        y : {
                                            ticker : Dygraph.numericLinearTicks,
                                            drawGrid : true,
                                            independentTicks : true,
                                            gridLineColor : "red",
                                            gridLinePattern : [ 4, 4 ]

                                        }
                                    },
                                   // showRangeSelector : true,
                                    axisLineColor : "grey",
                                  //gridLineColor : "grey",
                                    ylabel : ylabel_text,
                                    xlabel : xlabel_text,
                                    title : title_text,
                                    //titleHeight : 22, Change at 15JUL2019
                                    titleHeight : 20,
                                    strokeWidth : 2.0,
                                    highlightCircleSize : 6.0,
                                    axisLineWidth : 0.6,
                                    legend : 'follow',
                                    drawPoints: true //Updated and Added By Jay 12DEC2019
                                }));
    };
    
    /*===========================Update By Jay Ends07JAN2020=============================*/
    
    /*===========================Update By Jay Starts On 08JAN2020=======================*/
    
    $scope.initializeTephigram=function(){
    	$scope.content_tephigram_new_one=document.getElementById('content_tephigram_new');
    }
    
    $scope.initializeVprofile=function(){
    	$scope.content_vprofile_new_one=document.getElementById('content_vprofile_new');
    }
    
    /*===========================Update By Jay Ends On 08JAN2020=======================*/
    
                    /* =======================Test Start=========================== */
                    //var global_temp_data; //Change at 24JUL2019
                    $scope.global_temp_data;
                    $scope.myFunc_time=function(var_data_time)
                    {
                       
                        probeAndTimeSeries.myFunc_time($scope,var_data_time);
                    }
                    $scope.myFunc_time1=function()
                    {
                       
                        probeAndTimeSeries.myFunc_time1($scope);
                    }
                    $scope.temp_timeseries_flag; //Cahnge at 23JUL2019
                    timeseries_flag_true=function(){ //Cahnge at 23JUL2019
                    	//alert(1)
                    	$scope.temp_timeseries_flag='true';
                    	//alert('2'+$scope.temp_timeseries_flag)
                    }
                    timeseries_flag_false=function(){ //Cahnge at 23JUL2019
                    	//alert(2)
                    	$scope.temp_timeseries_flag='false';
                    	//alert('2'+$scope.temp_timeseries_flag)
                    }
                    /* =======================Test End=========================== */
	
	/*===========================Update By Jay Ends for dygraph on 12DEC19================================*/
	
	
	
	
    $scope.items = [{
        id: 'item1',
        title: 'one'
    }, {
        id: 'item2',
        title: 'two'
    }, {
        id: 'item3',
        title: 'three'
    }];
    $scope.temperature_label="";
   
   
      
    $scope.dates_slider = [];
    for (var m = 0; m <= 60; m++) {
        $scope.dates_slider.push(m);
    //dates.push(new Date(2016, 7, i));
    }
    
    $scope.slider = {
        minValue:$scope.dates_slider[0],
        maxValue:$scope.dates_slider[60],
        
        options: {
            floor: $scope.dates_slider[0],
            ceil: $scope.dates_slider[60],
            //showTicksValues : true,
            stepsArray: $scope.dates_slider     
        }
    };
   
   
   
   
    function redrawTimeseries() {
//      console.log("in redraw");
        if($scope.selected_probe=='tephigram')
        {
            // tephigram_layers('redraw');  
            $scope.content_timeseries_new_one.innerHTML="<img src="+$scope.image_tephi.src+" style='width:100%;height:100%'>";
              
        }
        else if($scope.selected_probe=='timeseries')
        {
            if($scope.timeseries_type=='satellite')
            {
//            	console.log("timeseries redraw")
                timeseries_layers('redraw');
            }
            else if($scope.timeseries_type=='aws')
            {
                timeseries_aws();
            }
            
        }
        $scope.map.getViewport().removeEventListener('mouseup', redrawTimeseries,false);
        $scope.map.getViewport().removeEventListener('touchend', redrawTimeseries,false);
    }
 
    /*================Updated and Added By Jay Starts===================*/ 
 
    $scope.dygraph_timeseries=function(var_data_time,recall_flag){
    	probeAndTimeSeries.dygraph_timeseries($scope,var_data_time,recall_flag);
    }
    
    $scope.plevel_change=function(){
    	probeAndTimeSeries.plevel_change($scope);
    }
    
    $scope.radio_plevel_change=function(){
    	probeAndTimeSeries.radio_plevel_change($scope);
    }
    /*================Updated and Added By Jay Ends===================*/

    $scope.addAnimationLayer=function(layer)
    {
        addAnimation.addAnimationLayer($scope,layer);
    }
    
    /*==============Update By Jay Starts On 16JAN2020=============================*/
    
    $scope.addAnimationUpdateLayer=function(layer)
    {
        addAnimation.addAnimationUpdateLayer($scope,layer);
    }
    
    /*==============Update By Jay Ends On 16JAN2020================================*/
    
    $scope.showTephigram=function(layer)
    {
        
        updateLayerSetting.showTephigram(layer);
    }
    
    $scope.show3DInterface=function(layer)
    {
        
        updateLayerSetting.show3DInterface($scope,layer);
    }
    $scope.multilayer_3d=function()
    {
        
        updateLayerSetting.multilayer_3d($scope);
    }
    
 
    $scope.playAnimationAfterSliding = function()
    {
        
        addAnimation.playAnimationAfterSliding($scope);
    }
 
    $scope.showAnimationControls=function()
    {
        document.getElementById('popup-layer-list-animation')
    }
 
    $scope.addClimatologyLayer=function(selectedObject,ev,add_layer_flag)
    {
        climatology.addClimatologyLayer($scope,selectedObject,ev,add_layer_flag);
    }
 
 
    $scope.updateAnimationLayer=function()
    {
        addAnimation.updateAnimationLayer($scope);
    }
 
    $scope.countComparisonAnimation=function()
    {
        addAnimation.countComparisonAnimation($scope);
    }
 
    $scope.resize_timeseries_div = function(){
        redrawTimeseries();
    }
    
    $scope.siteInfo=function()
    {
        //console.log("$scope.snd_timeseries_selected:- ",$scope.snd_timeseries_selected);
        console.log("$scope.sndTimeseriesSelected:- ",$scope.sndTimeseriesSelected);
        document.getElementById('site_info_id').style.display='block';
        $scope.showSiteInfo();
    }
    
    $scope.closeSiteInfo=function()
    {
        document.getElementById('site_info_id').style.display='none';  
        $mdDialog.hide();
    }
    
    $scope.closeCycloneInfo=function()
    {
        //document.getElementById('cyclone_info_id').style.display='none';  
	$mdDialog.hide();
    } 
    
    showCycloneInfo = function() {
   
        $scope.selectedIndex = 0;
        //document.getElementById('cyclone_info_id').style.display = 'block';
	$scope.cycloneInfo();
    }
    
    $scope.closeSearch=function()
    {
        document.getElementById('search_table_id').style.display='none';  
        $mdDialog.hide();
    }
    
    $scope.awsDateSelected=function()
    {
        awsLayer.awsDateSelected($scope);
    }   
    
    $scope.zoomToLocationDialog=function(entry)
    {
        features.zoomToLocationDialog($scope,entry);
    }
    
    $scope.updateLocationSetting=function()
    {
        features.updateLocationSetting($scope);
//        $mdDialog.hide();
    }
    
    $scope.datepickers = {
        dt: false,   // date From
        dtSecond: false // date To
    }
  
//    $scope.dateOptionsDt = {
//
//        formatYear: 'yyyy',
//        maxDate: new Date(2017,05,22), 
//        minDate: new Date(2017,05,22),
//        startingDay: 1
//    };
  
  
  
    $scope.openCalendar= function($event,which)
    {
       
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datepickers[which] = true;
        $scope.open=true;
    }
    
    /*================Update Starts by Jay for new calendar argument=================*/
    
    $scope.openCalendar_layer= function($event,layer,which)
    {
       
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datepickers[which] = true;
        $scope.open=true;
        $scope.selectedObject=layer;
        
        /*==============Update Starts By Jay=====================*/
        //$scope.showPrerenderedDialog(ev);
        /*==============Update Ends By Jay=====================*/
    }
    
    /*================Update Ends by Jay for new calendar argument=================*/
    
    $scope.dateOptionsDt=
    {
        formatYear:'yyyy',
        maxDate:new Date(),
        minDate:new Date().setMonth(new Date().getMonth()-3),
        startingDay:1
    };
     
    $scope.closeTimeseries=function()
    {
    	try{
    		document.getElementById('content_timeseries_id').style.display='none';
    	}catch(err){
    		console.log(err);
    	}
        
        $scope.show_timeseries_flag=false;
        $scope.timeseries_status=false;	//Updated and Added by Jay
        
        /*====================Update Starts By Jay===========================*/
    	
    	$scope.snd_timeseries_selected="Timeseries";
    	$scope.sndTimeseriesSelected="Timeseries";
        
        $scope.plevel_radio_selected="Multiple Plevel";	//For next call assignment
        
        $scope.plevel=undefined;
        $scope.plevel_max=undefined;
        $scope.plevel_min=undefined;
        
        /*====================Update Ends By Jay===========================*/
    }
    
    
    /*====================Update By Jay Starts================================*/
    
    $scope.closeTephigram=function()
    {
    	try{
    		document.getElementById('content_tephigram_id').style.display='none';
    	}catch(err){
    		console.log(err);
    	}
        
        $scope.show_tephigram_flag=false;
        $scope.tphigram_status=false;
    }
    
    $scope.closeVprofile=function()
    {
    	try{
    		document.getElementById('content_vprofile_id').style.display='none';
    	}catch(err){
    		console.log(err);
    	}
        
        $scope.show_vprofile_flag=false;
        $scope.vprofile_status=false;
        $scope.vprofile_old_status=false;	//??
    }
    
//    $scope.closeVprofile_old=function()
//    {
//        document.getElementById('content_vprofile_old_id').style.display='none';
//        $scope.show_vprofile_old_flag=false;
//        $scope.vprofile__old_status=false;
//        //$scope.vprofile_old_status=false;	//??
//    }
    
    /*====================Update By Jay Ends================================*/
    
    
    $scope.addLayers = function(layer_add_flag)
    {
        layerSelection.addLayers($scope,layer_add_flag); 
        
        /*=============Update Starts BY Jay )n 26DEC2019=========================*/
        
        if(layer_add_flag){
        	$mdDialog.hide();
        }
        
        /*=============Update Ends BY Jay )n 26DEC2019=========================*/
        
//        console.log("datepickers.dt aft:- ",$scope.datepickers.dt);
//        console.log("dateOptionsDt aft:- ",$scope.dateOptionsDt);
//        console.log("$scope.isOpen:- ",$scope.isOpen);
        //$scope.hide($mdDialog);	//Updated and Added By Jay On 23DEC2019
    }
    
    $scope.addAwsLayer = function(selected_category,ev,layer_add_flag)
    {
        layerSelection.addAwsLayer($scope,selected_category,ev,layer_add_flag);   
    }

    $scope.closeList = function ()
    {
        document.getElementById('satellite_list_id').style.display='none';
        $mdDialog.hide();
    }
    
    $scope.closetime_tephi_vprofile = function ()
    {
//    	console.log("$scope.timeseries_status:- ",$scope.timeseries_status);
//		console.log("document.getElementById('content_timeseries_dygraph1'):- ",document.getElementById('content_timeseries_dygraph1'));

    	try{
    		document.getElementById('time_tephi_vprofile_id').style.display='none';	//Updated By Jay On 08JAN2020
    	}catch(err){
    		console.log(err);
    	}
        
        $mdDialog.hide();
    }

    $scope.showCalendarDiv=function()
    {
        $scope.showCalendar= !$scope.showCalendar;  
    
        if($scope.showCalendar)
        {
           
            document.getElementById('show_calendar_id').style.display='block';  
        }
        else
        {
            document.getElementById('show_calendar_id').style.display='none';         
        }
     
    }


    $scope.showTime=function($event,selected_category){
      
      
        $scope.selected_category_list= selected_category;
     
        var has_children =$scope.event_propagation($event,selected_category);  
        if(has_children)
        {
            $scope.selected_list_id="";
        }
        else 
        {
            $scope.selectedObject= selected_category;
            $scope.selectedEvent= $event;
            //  $scope.selected_list_id="Loading data..Please wait.."
            $scope.selected_list_id=selected_category.selection_name+" ("+selected_category.satellite+"/"+selected_category.sensor+")";
        }
    }
     
    $scope.showstation=function($event,selected_category)
    {
        var has_children =$scope.event_propagation($event,selected_category);
        $scope.selected_category_list= selected_category;
      
        if(has_children)
        {
            $scope.selected_list_id="";
        }
        else 
        {
            $scope.selectedObject= selected_category;
            $scope.selectedEvent= $event; 
            // $scope.selected_list_id="Loading data..Please wait..";
            $scope.selected_list_id=selected_category.name;
        }
    }
    
    $scope.showWeatherForecast=function($event,selected_category)
    {
        $scope.selected_category_list= selected_category;
        var has_children = $scope.event_propagation($event,selected_category);
        if(has_children)
        {
            $scope.selected_list_id="";
        }
        else 
        {
            $scope.selectedObject= selected_category;
            $scope.selectedEvent= $event;
            //$scope.selected_list_id="Loading data..Please wait..";
            $scope.selected_list_id=selected_category.selection_name+" ("+selected_category.satellite+"/"+selected_category.sensor+")";
        }
    }
    
    $scope.showClimatology=function($event,selected_category)
    {
        $scope.selected_category_list= selected_category;
        var has_children = $scope.event_propagation($event,selected_category);
        if(has_children)
        {
            $scope.selected_list_id="";
        }
        else 
        {
            $scope.selectedObject= selected_category;
            $scope.selectedEvent= $event;
            //$scope.selected_list_id="Loading data..Please wait..";
            $scope.selected_list_id=selected_category.selection_name+" ("+selected_category.satellite+"/"+selected_category.sensor+")";
        }
    }
    
  
    $scope.addWeatherForecastLayer=function(category)
    {
        weatherForecast.addWeatherForecastLayer($scope,category);
    }

    $scope.layer_arrangement_aws=function()
    {
        awsLayer.layer_arrangement_aws($scope);
    }
   
    $scope.layer_arrangement=function(selected_category)
    {
        var index_val=updateOrAddLayer.layer_arrangement($scope,selected_category);
        return index_val;
    }
    
    $scope.createAndAddAWSLayer=function(param,selected_category,selected_parameter,intialdate,prev_date_aws,temp_category)
    {
        awsLayer.createAndAddAWSLayer($scope,param,selected_category,selected_parameter,intialdate,prev_date_aws,temp_category);
    }
    
    $scope.alert_function=function()
    {  
        $scope.hidden=true;
        window.setTimeout($scope.alertVisibility,1000);
    }
    $scope.alertVisibility=function()
    {
        $scope.hidden=false; 
    }
 
    variableDeclaration.getVariableDeclaration($scope);
    jsonResponse.getJsonResponse($scope);
    dragAndDrop.getDragAndDropVariables($scope);
    $scope.styleFunction=function(feature,resolution)
    {
        dragAndDrop.styleFunction($scope,feature, resolution); 
    }
    
  
    $scope.setPointProbing=function()
    {
        features.setPointProbing($scope);
    }
    
    $scope.getLocation=function()
    {
        features.getLocation($scope);
    }
    
    $scope.event_propagation=function($event,selected_category)
    {
        //console.log("INSIDE CONTROLLER AND FUNCTION IS event_propagation"); 
        $event.stopPropagation();
        if(selected_category.flag) {
            selected_category.flag = false;
        } else {
            selected_category.flag = true;
        }   
        var has_children = angular.isArray(selected_category.children);
        return has_children;
    }
  $scope.filenamedate=[]; 
    $scope.getallfiledate=function(){
		$http.get("https://mosdac.gov.in/live_data/catalog/liveNew/products/GSMAP_Global_nc/catalog.xml",{transformResponse:function(cnv)
            {
            var x2js=new X2JS();
            var afterCnv = x2js.xml_str2json(cnv);
            return afterCnv;
        }
	  }).then(function (json){

//		GSMAP_04APR2024_1500_H_L3S_MCH_03F.nc

		  $scope.month=json.data.catalog.dataset.dataset[0]._name.substring(8,11);
		  $scope.datetime_2 = json.data.catalog.dataset.dataset[0]._name.substring(06,15);
		  $scope.time2 =  json.data.catalog.dataset.dataset[0]._name.substring(15,19);
//		  console.log("today ---",$scope.month);
		  json.data.catalog.dataset.dataset.forEach(
        		  function(item,index){
        			  $scope.filenamedate[index]=item._name.substring(06,15);
        			  
        			 
        		  }
                   );
		  $scope.collect = [];
		  $scope.month=[];
		  for(var i = 0; i < $scope.filenamedate.length-1; i++){
			  if($scope.collect.indexOf($scope.filenamedate[i])=== -1){
				  $scope.collect.push($scope.filenamedate[i])
			  }
		  }
		  $scope.collect.sort(function(a,b){

                    var key1= new Date(a);
                    var key2= new Date(b);
              
                    return key2-key1;     
               });		
//	   console.log($scope.collect)
$scope.selecteddate="-Select-";
	  });
	}
	
	
	$scope.getallfiledate();

     // gettime GSMAP rain 
       $scope.getTimeRainfile=function(selecteddate){
//              alert(selecteddate);
                $scope.selecteddate=selecteddate;

        $http({
            method:'POST',
            cache:true,
            url:"https://mosdac.gov.in/app_php/getfiletimeGSMAPRAIN.php",
            data:{"date":$scope.selecteddate}
        }).then(function(response){

                $scope.localtimelist=[];
                $scope.time_file = response.data.split(",");
  //            console.log("file time-->",$scope.time_file)
                for(var k=0;k<$scope.time_file.length-1; k++){
                        $scope.localtimelist.push($scope.time_file[k]);
                }
    //          console.log("$scope.localtimelist--->",$scope.localtimelist)
  //            $scope.timeselected_HEMFile=$scope.time_HEMfile[0];
//                $scope.times_HEMfile=true;
        });
        }
 
	$scope.getlayer=function(time,layer){
		$scope.timeselected=time;
                 $scope.layername=layer;
//		console.log($scope.timeselected);
//		console.log($scope.layername);
		 var url="https://mosdac.gov.in/live_data/wms/liveNew/products/GSMAP_Global_nc/GSMAP_"+$scope.selecteddate+"_"+$scope.timeselected+"_H_L3S_MCH_03F.nc?service=WMS&version=1.3.0&request=GetCapabilities";
//			  console.log("url path--",url);
		  $http.get(url,{transformResponse:function(cnv)
		  {   	var x2js=new X2JS();
         		var afterCnv = x2js.xml_str2json(cnv);
//         		console.log("afterCnv:-- ",afterCnv);
         		return afterCnv.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension.toString().trim();
	     	  }
		  	}).then(function (response){
//				console.log(response.data)
				$scope.layer_to_modify.getSource().setUrl("https://mosdac.gov.in/live_data/wms/liveNew/products/GSMAP_Global_nc/GSMAP_"+$scope.selecteddate+"_"+$scope.timeselected+"_H_L3S_MCH_03F.nc");
				  $scope.layer_to_modify.getSource().updateParams({
                                    TIME:response.data
                                  });
			});

	}

//----------------------------------------------------------   
    $scope.getTimeForecast=function(response,selected_category)
    {   
       
        //console.log("INSIDE CONTROLLER AND FUNCTION IS getTimeForecast");
        var i=0;
        var layer_name="";
      
//        console.log("Forecast Response:- ",response);
        
        if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[i])
        {
            while((response.WMS_Capabilities.Capability.Layer.Layer.Layer[i]))
            {
                layer_name=response.WMS_Capabilities.Capability.Layer.Layer.Layer[i].Name;
                if(layer_name == selected_category.source.params.LAYERS && response.WMS_Capabilities.Capability.Layer.Layer.Layer[i].Dimension[0])
                {
                    selected_category.list_elevation_arr=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[i].Dimension[0]).toString().trim().split(",");              
                    selected_category.selectedElevationSetting=selected_category.list_elevation_arr[0]; 
                    break;
                }
                i++;
            }
        }
      
    
	     var valclick="";
        if(!response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
        {
         //  console.log("1");
            if(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension)

            {
           // 	console.log("2");
                if(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[0])
                {
             //   	console.log("3");
                    var valclick_1=(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[0]).toString();

                    if(valclick_1.indexOf(":")>0)
                    {
               //     console.log("4");
                        valclick=valclick_1;
                    }
                    else
                    {
                 //   	console.log("5");
                        valclick=response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[1].toString().trim();
                    }
                }
                else
                {
                //	console.log("6");
                    valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension).toString();

                }
            }
        }
        else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="hmxl" || response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="uwnd" || response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="UWIND")
        {
        //	console.log("7");

            valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension).toString();
        }
         else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="t2"){
         //	console.log("8")
         	valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();
//         	//WMS_Capabilities.Capability.Layer.Layer.Layer[""0""].Dimension[1]
         }
	     else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="tc"){
           //     console.log("8")
                valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();
//              //WMS_Capabilities.Capability.Layer.Layer.Layer[""0""].Dimension[1]
         }
	 // Additional for OCM data testing
	   else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
         {
         //	console.log(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0]);
	   valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();
        }
	 else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
         {
         //	console.log("8");
	   valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();
        }

        else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
        {
         //console.log("9");
            valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();

        }
        //console.log("valclick",valclick);
        
/*        var valclick="";
        if(!response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
        {
           
            if(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension)
            {
                if(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[0])
                {
                    var valclick_1=(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[0]).toString();  
                  
                    if(valclick_1.indexOf(":")>0)
                    {
                    
                        valclick=valclick_1;
                    }
                    else 
                    {
                        valclick=response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension[1].toString();
                    }
                }
                else
                {
                    valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer.Dimension).toString();  
                        
                }
            }
        }
        else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="hmxl" || response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="uwnd" || response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="UWIND")
        {
           
            valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension).toString();              
        }
	 // Additional for OCM data testing 
	 else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
         {
	   valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[2].Dimension).toString();
        }

        else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
        {
           
            valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Dimension[1]).toString();
           
        }*/

//	    else if(response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].Name=="eastward_analyzed_wind_speed")
//	    {
//	   valclick=(response.WMS_Capabilities.Capability.Layer.Layer.Layer[2].Dimension).toString(); 
  //     	}

        var arrayDateForecast= valclick.trim().split(",");
        var lenForecast=arrayDateForecast.length;
        var min_diff=0;
        var min_diff_index=0;
        var diff_val=0;
        var current_date = new Date();  
        var current_date_modified= current_date.getTime();
        for(i=0;i<lenForecast;i++)
        {
            var array_date_modified= Date.parse(arrayDateForecast[i]);
          
            diff_val= Math.abs(parseInt(array_date_modified)-parseInt(current_date_modified));
            if(i==0)
            {    
               
                min_diff=diff_val;
                min_diff_index=i;
            }
            if(min_diff>diff_val)
            {
                min_diff=diff_val;
                min_diff_index=i;
            }             
        }

        var date_gmt = "";
        var selected_date_gmt = "";
        
        selected_category.list_time_arr=[];
        for(i=0;i<lenForecast;i++)
        {
            date_gmt = arrayDateForecast[i];
            var forecast_date = date_gmt.substring(0,date_gmt.indexOf("T"));
            var date_local_arr= forecast_date.split("-");
            
            var m_names = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");
            var latest_month= m_names[date_local_arr[1]-1];
            var forecast_time_modified = date_gmt.substring(date_gmt.indexOf("T")+1,date_gmt.indexOf("T")+6).replace(":","");
            date_gmt = date_local_arr[2]+latest_month+date_local_arr[0]+" "+forecast_time_modified;
            var latest_date= date_gmt.substring(0,date_gmt.indexOf(" "));
            var latest_time=forecast_time_modified;
            var date_local= $scope.getDisplayName(latest_time, latest_date, 'timezone_change', "gmt_to_local", "00:00:00");
            var temp_var={
                "name":arrayDateForecast[i],
                "displayname_gmt":date_gmt,
                "displayname_local":date_local
            };    
            selected_category.list_time_arr.splice(0,0,temp_var); 
          
            if(i==min_diff_index)
            {
                selected_date_gmt= date_gmt;
                selected_category.selectedTimeSetting=temp_var;
            }
        } 
        return min_diff_index+";"+selected_date_gmt+";"+arrayDateForecast[min_diff_index]+";"+lenForecast+";"+ arrayDateForecast;         
    }
    
    

    $scope.getLayerUrl=function(selected_category,date_time,filename)
    {
        var layer_url=commonFunctions.getLayerUrl($scope,selected_category,date_time,filename);            
        return layer_url;   
    } 
    
 
    $scope.addSatelliteLayer=function(selected_category,ev,add_layer_flag)
    {
        updateOrAddLayer.addSatelliteLayer($scope,selected_category,ev,add_layer_flag) 
    }
    
    $scope.nodeSelected = function($event,selected_category,add_layer_flag){    
        updateOrAddLayer.nodeSelected($scope,$event,selected_category,add_layer_flag);
    }
    
    $scope.nodeSelectedCalendar = function($event,layer_add_flag){ 
      
        updateOrAddLayer.nodeSelectedCalendar($scope,$event,layer_add_flag);
    }
    
    
    $scope.addLayerToMap=function(selected_category,featureInfoUrl,loop_k,date_time,file_date_time,file_date,data_type,param,overlay_k,index_val_current)
    {
        updateOrAddLayer.addLayerToMap($scope,selected_category,featureInfoUrl,loop_k,date_time,file_date_time,file_date,data_type,param,overlay_k,index_val_current);       
    }  
  
    $scope.nodeSelectedBase = function(category){
        updateOrAddLayer.nodeSelectedBase($scope,category);
    }

    $scope.nodeSelectedOverlay = function(category){

        updateOrAddLayer.nodeSelectedOverlay($scope,category);
    }
   
    $scope.pauseAnimation=function()
    {
        addAnimation.pauseAnimation($scope);
    }
     
    $scope.playAnimation=function()
    {
        addAnimation.playAnimation($scope);
    }
   
   
   
    $scope.updateSelectedImageSetting=function($scope,image_setting)
    {
        showLayerSetting.updateSelectedImageSetting($scope,image_setting);
    }
    
    $scope.showImageSettingFun=function(category)
    {
        showLayerSetting.showImageSettingFun(category);
        
    }
      
    $scope.showPaletteSelectionFun=function(category)
    {
        showLayerSetting.showPaletteSelectionFun(category);
    }
    
    $scope.showBandSelectionFun=function(category)
    {
        showLayerSetting.showBandSelectionFun(category);
    }
    $scope.showElevationSelectionFun=function(category)
    {
        showLayerSetting.showElevationSelectionFun(category);
    }
    $scope.showTimeSelectionFun=function(category)
    {
        showLayerSetting.showTimeSelectionFun(category);
    } 
    $scope.showBackDateSelectionFun=function(category)
    {
        showLayerSetting.showBackDateSelectionFun($scope,category);
    } 
  
    $scope.updateSelectedUserRangeSetting=function(category,param)
    {
        updateLayerSetting.updateSelectedUserRangeSetting($scope,category,param); 
    }
    
    
    $scope.updateContourSetting=function(category)
    {
        updateLayerSetting.updateContourSetting($scope,category);
    }
  
    /*======================Update Satrts from Jay=======================*/
    
    $scope.updateContourSetting_CallFromDateTimeFunc=function(category)
    {
    	updateLayerSetting.updateContourSetting_CallFromDateTimeFunc($scope,category);
    }
    
    /*======================Update Ends from Jay=======================*/
    
    /*======================Update By Jay Starts On 01JAN2020=======================*/
    
    $scope.repalce_dummy_threshold=function(value){
//    	console.log("value:- ",value);
    	$scope.thresholdControl[0].value = value;
    }
    
    /*======================Update By Jay Ends On 01JAN2020=======================*/
    
    $scope.regionGrowing = function(category)
    {
        updateLayerSetting.regionGrowing($scope,category);
    }
   
    $scope.updateSelectedRangeSetting=function(category,range_type)
    {
        updateLayerSetting.updateSelectedRangeSetting($scope,category,range_type); 
      
    }
    $scope.updateSelectedLayerBand=function(category)
    {
      
        updateLayerSetting.updateSelectedLayerBand($scope,category);   
    }
    $scope.updateSelectedLayerPalette=function(category)
    {
        updateLayerSetting.updateSelectedLayerPalette($scope,category); 
    }    

    $scope.updateSelectedLayerElevation=function(category)
    {
        updateLayerSetting.updateSelectedLayerElevation($scope,category);
    }  
     
    
    $scope.updateSelectedLayerTime=function(category)
    {
        updateLayerSetting.updateSelectedLayerTime($scope,category);   
    }  
   
  
    
    $scope.toggleGraticule=function()
    {
        features.toggleGraticule($scope);
    }
   
 
   
    $scope.removeTool=function()
    {
        if($scope.selectedTool=="Animation")
        {
            $scope.remove("Animation");
        }
        $scope.selectedTool="Select Tool";
        $scope.selectedItem=$scope.list_measure[0];
        document.getElementById("animation_info_id").style.display='none';
        $scope.map.removeInteraction($scope.draw);
        if($scope.helpTooltipElement)
        {
            $scope.helpTooltipElement.style.display = 'none'; 
        }        
    }
    
    $scope.windy="";
 
    $scope.wind_flag = 0;
    $scope.firesmoke_flag = 0;
    $scope.heavyrain_flag = 0;
    $scope.cloudburst_flag = 0;
    $scope.ripcurrent_flag = 0;
    $scope.heatcoldwave_flag = 0;
    $scope.soilmoisture_flag = 0;
    $scope.snow_flag = 0;
 

    $scope.refreshpanel = function() {
        for (var i = 0; i < $scope.icon_list.length; i++)
        {
            if ($scope.icon_list[i].active)
            {
                $scope.icon_list[i].active = false;
               
                $scope[$scope.icon_list[i].eventname]($scope.icon_list[i]);
            }
        }
    };

    $scope.getDateFormat = function(year, month, day) {

        var today_date = new Date(year,month-1, day);
        var year = today_date.getFullYear();
        var month = (today_date.getMonth() + 1);
        var day = today_date.getDate();

        if (month < 10)
            month = "0" + month;
        else
            month = month;

        if (day < 10)
            day = "0" + day;
        else
            day = day;

        
        var m_names = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");
        var labeldate = day + m_names[Number(today_date.getMonth())] + year;
        return labeldate;
    };    



    $scope.iconarray = [];

    $scope.handleEvent = function(icon) {
        var index = $scope.iconarray.indexOf(icon.name);
        if (index === -1)
            $scope.iconarray.push(icon.name);
        else
            $scope.iconarray.splice(index, 1);
        $scope[icon.eventname](icon);
    };  
   
    $scope.copyright_flag = 0;
    $scope.copyright = function(str)
    {
        websiteInfo.copyright($scope,str);
    }

    $scope.popup_close = function(){
//        $scope.show_status = false;	//Updated By Jay on 24DEC2019
//        $scope.copyright_flag = 0;	//Updated By Jay on 24DEC2019
//        $scope.rss_flag=0;	//Updated By Jay on 24DEC2019
        
        $mdDialog.hide();
    }
   
    $scope.handleWinds = function(icon) {
     
        quickAccess.handleWinds($scope,icon);

    }
    
    $scope.handleAirQuality = function(icon) {
     
        quickAccess.handleAirQuality($scope,icon);

    }
    
    drawHeatMap = function(){
        quickAccess.handleHeatmapOptions($scope);
    } 
    
    drawRain = function()
    {
        quickAccess.handleRainOptions($scope);
    }
    
    AirQualityIndex = function()
    {
        quickAccess.changeAirQualityIndex($scope);
    }
    
    $scope.handleFireSmoke = function(icon) {
        quickAccess.handleFireSmoke($scope,icon);

    }

    $scope.handleHeavyRain = function(icon) {
        quickAccess.handleHeavyRain($scope,icon);
    }  

    $scope.handleCloudBurst = function(icon) {

        quickAccess.handleCloudBurst($scope,icon);
    }

    $scope.handlecyclonetrack = function(icon)
    {
        quickAccess.handlecyclonetrack($scope,icon);
    }

    $scope.handleRipCurrent = function(icon) {
        quickAccess.handleRipCurrent($scope,icon);
    }

    $scope.handleHeatColdWave = function(icon)
    {
        quickAccess.handleHeatColdWave($scope,icon);
    }

    $scope.handlesoilmoisture = function(icon)
    {
        quickAccess.handlesoilmoisture($scope,icon);
    }
    
    $scope.handleSnow = function(icon)
    {
        quickAccess.handleSnow($scope,icon);
    }
    
    $scope.show_status = false;
    $scope.rss_flag = 0;
    $scope.showRssFeed = function(ev)
    {
        features.showRssFeed($scope,ev);
    }
    
   
    
    $scope.getBandList=function(category)
    {   
        listingForSelectedLayerSetting.getBandList($scope,category);
    }
    $scope.getTimeListing=function(category,time_arr,param)
    {
       
        listingForSelectedLayerSetting.getTimeListing($scope,category,time_arr,param);
    }
    
    //$scope.keep_index;
    
    $scope.insertLayerInMap=function(index, layer_url, params, layer_opacity)
    {
       
        if(params.LAYERS=='analyzed_wind_speed' || params.LAYERS=='observed_wind_speed')
        {
//        	console.log("layer _url:- ",layer_url);
//        	console.log("params:- :- ",params);
            $scope.map.getLayers().insertAt(index,new ol.layer.Image({
                source: new ol.source.ImageWMS({
                	preload: Infinity,
                    url:layer_url,
                    params: params,
                    // tiled:true,
                    singleTile: true,
                    ratio: 1
                
                }),
                opacity: layer_opacity
                          
            }));      
        }
        else
        {
            $scope.map.getLayers().insertAt(index,new ol.layer.Tile({
            	preload: Infinity,
                source: new ol.source.TileWMS({
                    url:layer_url,
                    params: params,
                    tiled:true,
                    // singleTile: true,
                    ratio: 1
                
                }),
                opacity: layer_opacity
                          
            }));       
        //  $scope.map.getLayers().item(index).getSource().crossOrigin='anonymous';
        }
        
        
        //$scope.map.getLayers().on('tileloadend',$scope.call_showLegend(index,params));
        
        if(params.STYLES!=undefined && params.STYLES!=""){
        	
//        	console.log("index insert:- ",index)
//            console.log("layer_url insert:- ",layer_url)
//            console.log("params insert:- ",params)
//            console.log("params.STYLES insert:- ",params.STYLES)
//            console.log("layer_opacity insert:- ",layer_opacity)
//            console.log("length:- ",$scope.map.getLayers().getLength())
//            console.log("layers insert:- ",$scope.layers)
//        	lay_grp_arr=$scope.map.getLayers();
//			lay_grp_arr1=lay_grp_arr.array_[1].getLayers();
//			lay_grp_arr2=lay_grp_arr1.array_;
            //setTimeout(function(){$scope.showLegend($scope.layers[index],"toggle")},0.0);
//            console.log("local layer:- ",$scope.layers.length);
        	//$scope.showLegend($scope.layers[index],"toggle")
        	//console.log("$scope.map.getLayers()[index]:- ",lay_grp_arr2)
        	//$scope.call_showLegend(index,params);
        }
        

    }
    
    $scope.call_showLegend=function(index,params){
    	if(params.STYLES!=undefined && params.STYLES!=""){
    		var wait_loop_flag=true;
        	while(wait_loop_flag){
//        		console.log($scope.layers)
        		if($scope.layers[index]!=undefined){
        			wait_loop_flag=false;
//        			console.log("in")
                	//$scope.showLegend($scope.layers[index],"toggle")
        		}
        	}
    	}
    }
  
    $scope.callTimeIntervalFun=function()
    {
        window.setInterval($scope.syncRecentData,1000*60*2,'interval'); 
    }
 
  
    
    $scope.addBaseOverlayToMap=function()
    {
        startBaseOverlay.addBaseOverlayToMap($scope);
    }
    
    $scope.addBaseOverlayToMap();

    $scope.addStartSatelliteLayerToMap=function()
    {
        startSatelliteLayer.addStartSatelliteLayerToMap($scope);
    }
    
    $scope.addStartSatelliteLayerToMap();

    
    $scope.getLatLon=function(e)
    {
        probeAndTimeSeries.getLatLon($scope,e);
    }
    
    $scope.selectLayerForAnimation=function()
    {
        var layer=$scope.selectedLayerAnimation; 
        $scope.addAnimationLayer(layer);
    }

//    function isMobileDevice() {
//        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
//    }
//    
//    console.log("isMobileDevice():- ",isMobileDevice());
    
    $scope.selectLayerForTimeseries=function()
    {
    	/*==================Update By Jay Starts On 16JAN2020==========================*/
    	
//    	console.log("in selectedLayerForTimeseries:- ")
    	
//    	console.log("layers:- ",$scope.layers);
    	
//    	console.log("selectLayerForTimeseries:- ",$scope.selectedLayerTimeseries);
    	
    	var no_layer_flag=0;
    	
    	if($scope.selectedLayerTimeseries==undefined){
//    		console.log("scope.slider_status :- ",$scope.slider_status);
    		
    		if($scope.slider_status){
    			$scope.playAnimationAfterSliding();
    		}
    		
    		if($scope.layers[$scope.layers.length-1].name=="AWS"){
    			for(i=$scope.layers.length-3;i>0;i--){
//        			console.log("$scope.layer:- "+i+" -",$scope.layers[i]);
    				if($scope.layers[i].active){
    					no_layer_flag+=1;
    					$scope.selectedLayerTimeseries=$scope.layers[i];
    					$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
    					break;
    				}
        		}
    		}else{
    			for(i=$scope.layers.length-2;i>0;i--){
//        			console.log("$scope.layer:- "+i+" -",$scope.layers[i]);
    				if($scope.layers[i].active){
    					no_layer_flag+=1;
    					$scope.selectedLayerTimeseries=$scope.layers[i];
    					$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
    					break;
    				}
        		}
    		}
    		
    		if(no_layer_flag==0){
    			var prev_toast_message_id_display=document.getElementById("toast_message_id").style.display;
    			
    			document.getElementById("date_slider_btn").style.display="none";
    			document.getElementById("date_slider_id").style.display="none";
    			document.getElementById("toast_message_id").style.display="none";
    			
    			$scope.temp_watch4=$scope.$watch(function($scope){
    							
    							var no_layer_flag=0;
    				
			    				if($scope.layers[$scope.layers.length-1].name=="AWS"){
			    	    			for(i=$scope.layers.length-3;i>0;i--){
			//    	        			console.log("$scope.layer:- "+i+" -",$scope.layers[i]);
			    	    				if($scope.layers[i].active){
			    	    					no_layer_flag+=1;
			    	    					$scope.selectedLayerTimeseries=$scope.layers[i];
			    	    					$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
			    	    					break;
			    	    				}
			    	        		}
			    	    		}else{
			    	    			for(i=$scope.layers.length-2;i>0;i--){
			//    	        			console.log("$scope.layer:- "+i+" -",$scope.layers[i]);
			    	    				if($scope.layers[i].active){
			    	    					no_layer_flag+=1;
			    	    					$scope.selectedLayerTimeseries=$scope.layers[i];
			    	    					$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
			    	    					break;
			    	    				}
			    	        		}
			    	    		}
    				
    							return no_layer_flag;
    						},function(newvalue,oldvalue){
    							
    							if(newvalue!=oldvalue && newvalue!=0){
    								$scope.selectLayerForTimeseries();
    								$scope.temp_watch4();
    								
    								document.getElementById("date_slider_btn").style.display="table-cell";
    				    			document.getElementById("date_slider_id").style.display="table-cell";
    				    			//document.getElementById("toast_message_id").style.display=prev_toast_message_id_display;
    							}
    							
    							
    						});
    		}
    		
    		//$scope.selectedLayerTimeseries=$scope.layers[1];
    		
//    		$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
    		
    		
    		
    	}else{
    		$scope.addAnimationUpdateLayer($scope.selectedLayerTimeseries);
    	}
    	
    	
    	/*==================Update By Jay Ends On 16JAN2020==========================*/
    	
    	
        if(document.getElementById('tephigram_id'))
        {
            if(($scope.selectedLayerTimeseries.sensor=="Sounder" && $scope.selectedLayerTimeseries.source.urlfilesuffix.indexOf("L2B")>=0)||($scope.selectedLayerTimeseries.latest_filepath.indexOf(""))|| ($scope.selectedLayerTimeseries.sensor=="WRFML"))
            {
                document.getElementById('tephigram_id').style.display='block';
            }
            else
            {
                document.getElementById('tephigram_id').style.display='none';      
            }
        }
        if(document.getElementById('vertical_profile_id'))
        {
            if($scope.selectedLayerTimeseries.sensor=="Anomaly")
            {
                document.getElementById('vertical_profile_id').style.display='block';
            }
            else
            {
                document.getElementById('vertical_profile_id').style.display='none';      
            }
        }
          if(document.getElementById('vertical_profile_new_id'))
        {
            if(($scope.selectedLayerTimeseries.sensor=="Sounder" && $scope.selectedLayerTimeseries.source.urlfilesuffix.indexOf("L2B")>=0)||($scope.selectedLayerTimeseries.latest_filepath.indexOf(""))|| ($scope.selectedLayerTimeseries.sensor=="WRFML"))
            {
                document.getElementById('vertical_profile_new_id').style.display='block';
            }
            else
            {
                document.getElementById('vertical_profile_new_id').style.display='none';      
            }
        }
          
        /*==================================Update by Jay Starts=============================*/
          
          if(document.getElementById('tephigram_id_bottom'))
          {
              if(($scope.selectedLayerTimeseries.sensor=="Sounder" && $scope.selectedLayerTimeseries.source.urlfilesuffix.indexOf("L2B")>=0)||($scope.selectedLayerTimeseries.latest_filepath.indexOf(""))|| ($scope.selectedLayerTimeseries.sensor=="WRFML"))
              {
                  document.getElementById('tephigram_id_bottom').style.display='block';
              }
              else
              {
                  document.getElementById('tephigram_id_bottom').style.display='none';      
              }
          }
          if(document.getElementById('vertical_profile_id_bottom'))
          {
              if($scope.selectedLayerTimeseries.sensor=="Anomaly")
              {
                  document.getElementById('vertical_profile_id_bottom').style.display='block';
              }
              else
              {
                  document.getElementById('vertical_profile_id_bottom').style.display='none';      
              }
          }
            if(document.getElementById('vertical_profile_new_id_bottom'))
          {
              if(($scope.selectedLayerTimeseries.sensor=="Sounder" && $scope.selectedLayerTimeseries.source.urlfilesuffix.indexOf("L2B")>=0)||($scope.selectedLayerTimeseries.latest_filepath.indexOf(""))|| ($scope.selectedLayerTimeseries.sensor=="WRFML"))
              {
                  document.getElementById('vertical_profile_new_id_bottom').style.display='block';
              }
              else
              {
                  document.getElementById('vertical_profile_new_id_bottom').style.display='none';      
              }
          }
            
        /*==================================Update by Jay Ends=============================*/
            
          
////        if($scope.selected_probe=="timeseries")
//        if($scope.selected_probe=="timeseries" && $scope.show_timeseries_flag && $scope.timeseries_status)
//        {
//            timeseries_layers('not_button_click');
//        }
//        else if($scope.selected_probe=="tephigram" && $scope.selectedLayerTimeseries.sensor=="Sounder")
//        {
//            //tephigram_layers('not_button_click');
//            $scope.content_timeseries_new_one.innerHTML="<img src="+$scope.image.src+" style='width:100%;height:100%'>";     
//        }
//        else if($scope.selected_probe=="vertical_profile")
//        {
//            $scope.vertical_profile_layers('not_button_click');
//           
//        }
        
        /*==============================Update By Jay Starts===============================*/
        
//        if($scope.selected_probe=="timeseries")
//        if($scope.selected_probe=="timeseries" && $scope.show_timeseries_flag && $scope.timeseries_status)
        if($scope.show_timeseries_flag && $scope.timeseries_status)
        {
            timeseries_layers('not_button_click');
        }
//        else if($scope.selected_probe=="tephigram" && $scope.selectedLayerTimeseries.sensor=="Sounder")
        if($scope.tphigram_status && $scope.show_tephigram_flag && $scope.selectedLayerTimeseries.sensor=="Sounder")
        {
            //tephigram_layers('not_button_click');
            //$scope.content_timeseries_new_one.innerHTML="<img src="+$scope.image.src+" style='width:100%;height:100%'>";
        	$scope.content_tephigram_new_one.innerHTML="<img src="+$scope.image_tephi.src+" style='width:100%;height:100%'>";
        }else{
        	$scope.closeTephigram();
        }
        
//        else if($scope.selected_probe=="vertical_profile")
        if($scope.show_vprofile_flag && $scope.vprofile_old_status && $scope.selectedLayerTimeseries.sensor=="Anomaly")
        {
            $scope.vertical_profile_layers('not_button_click');
           
        }else if($scope.show_vprofile_flag && $scope.vprofile_status && $scope.selectedLayerTimeseries.sensor=="Sounder"){
        	$scope.vertical_profile_new_layers('not_button_click');
        }
        else{
        	$scope.closeVprofile();
        }
        
        /*==============================Update By Jay Ends===============================*/
     
        /*==============================Update By Jay Starts On 01JAN2020========================*/
        
        
        if($scope.contours_status){
//        	$scope.contour_status=!$scope.contour_status;
        	
        	$scope.updateContourSetting($scope.selectedLayerTimeseries_prev);
        	
        	$scope.updateContourSetting($scope.selectedLayerTimeseries);
        	
        }
        
        if($scope.region_growing_status){
        	$scope.regionGrowing($scope.selectedLayerTimeseries);
        	
        	$scope.region_growing_status=true;        	
        }
        
        /*==============================Update By Jay Ends On 01JAN2020========================*/
    }
    
    timeseries_layers=function(param)
    {
       
        probeAndTimeSeries.timeseries_layers($scope,param);
    }
    
    /*================Update By Jay Starts===============*/
    
    settimeseries_layers=function(param){
    	//console.log("in t");
    	$scope.timeseries_status=!$scope.timeseries_status;
    	
    	$show_timeseries_flag=!$scope.show_timeseries_flag;
    	
    	if(!$scope.timeseries_status){
    		document.getElementById('content_timeseries_id').style.display="none";
    		
    	}else{
    		document.getElementById('time_tephi_vprofile_id').style.display="block";
    		$scope.showtime_tephi_vprofile();
    		
    		//console.log("$scope.timeseries_status:- ",$scope.timeseries_status);
//    		console.log("document.getElementById('content_timeseries_dygraph1'):- ",document.getElementById('content_timeseries_dygraph1'));
//    		console.log("$scope.content_timeseries_dygraph1:- ",$scope.content_timeseries_dygraph1);
    		
    		//if($scope.content_timeseries_dygraph1==undefined){
//    			console.log("in if of dygraph");
    			
    			$scope.temp_watch=$scope.$watch(function(scope){
//    													console.log("document.getElementById('content_timeseries_dygraph1'):- ",document.getElementById('content_timeseries_dygraph1'));
    													return document.getElementById('content_timeseries_dygraph1');
    													},
    											function(newvalue,oldvalue){
    														if(newvalue!=undefined){
//    															console.log("in watch if");
    															$scope.initializeDygraph();
    															probeAndTimeSeries.timeseries_layers($scope,param);
    															$scope.temp_watch();
    														}
    													});
    			
    			//$scope.initializeDygraph();
    		//}
    		
//    		probeAndTimeSeries.timeseries_layers($scope,param);
    		
    	}
    	
    	//console.log("analysis obj:- ",$scope.analysis)
    }
    
    /*================Update By Jay Ends===============*/
    
    
    /*================Update By Jay Starts===============*/
    
//    updateAnalysisObject=function(){
//    	if($scope.timeseries_status){
//    		
//    	}
//    	
//    	if($scope.tphigram_status){
//    		
//    	}else{
//    		
//    	}
//    	
//    	if($scope.vprofile_status){
//    		
//    	}else{
//    		
//    	}
//    }
    
    /*================Update By Jay Ends===============*/
    
    
    
    
    tephigram_layers=function(param)
    {
       
        probeAndTimeSeries.tephigram_layers($scope,param);
    }
    
    /*================Update By Jay Starts===============*/
    
    settephigram_layers=function(param){
    	//console.log("in t");
    	$scope.tphigram_status=!$scope.tphigram_status;
    	
    	$scope.show_tephigram_flag=!$scope.show_tephigram_flag;
    	
    	if(!$scope.tphigram_status){
//    		document.getElementById('content_timeseries_id').style.display="none";
    		document.getElementById('content_tephigram_id').style.display="none";
    	
    	}else{
    		document.getElementById('time_tephi_vprofile_id').style.display="block";
    		$scope.showtime_tephi_vprofile();
//    		probeAndTimeSeries.tephigram_layers($scope,param);	//Updated By Jay On 08JAN2020
    		
    		
    		//if($scope.content_timeseries_dygraph1==undefined){
//    			console.log("in if of dygraph");
    			
    			$scope.temp_watch=$scope.$watch(function(scope){
    													return document.getElementById('content_tephigram_new');
    													},
    											function(newvalue,oldvalue){
    														if(newvalue!=undefined){
//    															console.log("in watch if");
    															$scope.initializeTephigram();
    															probeAndTimeSeries.tephigram_layers($scope,param);
    															$scope.temp_watch();
    														}
    													});
    			
    			//$scope.initializeDygraph();
    		//}
    	}
    	//console.log("analysis obj:- ",$scope.analysis)
    }
    
    /*================Update By Jay Ends===============*/
    
    vertical_profile_layers=function(param)
    {
        
        probeAndTimeSeries.vertical_profile_layers($scope,param);
    }
    
    /*================Update By Jay Starts==============*/
    
    
    setvertical_profile_layers=function(param)
    {
//   	console.log("in t");
	    console.log('setvprofile',param);
    	$scope.vprofile_old_status=!$scope.vprofile_old_status;
    	
    	$scope.show_vprofile_flag=!$scope.show_vprofile_flag;


    	console.log('$scope.vprofile_old_status',$scope.vprofile_old_status);
        console.log('scope.show_vprofile_flag=',$scope.show_vprofile_flag);


    	if(!$scope.vprofile_old_status){
    		//document.getElementById('content_timeseries_id').style.display="none";
    		document.getElementById('content_vprofile_id').style.display="none";
		//console.log('setvertical_profile_layers===if');
    	
    	}else{
    		document.getElementById('time_tephi_vprofile_id').style.display="block";
		 //console.log('setvertical_profile_layers===else');

    		$scope.showtime_tephi_vprofile();
//    		probeAndTimeSeries.vertical_profile_layers($scope,param);	//Updated By Jay On 08JAN2020
    		
    		//if($scope.content_timeseries_dygraph1==undefined){
//			console.log("in if of dygraph");
			
			$scope.temp_watch=$scope.$watch(function(scope){
													return document.getElementById('content_vprofile_new');
													},
											function(newvalue,oldvalue){
														if(newvalue!=undefined){
															console.log("in watch if");
															$scope.initializeVprofile();
															probeAndTimeSeries.tephigram_layers($scope,param);
															$scope.temp_watch();
														}
													});
			
			//$scope.initializeDygraph();
		//}
    		
    		
    	}
//    	console.log("analysis obj:- ",$scope.analysis)
    }
    
    
    /*================Update By Jay Ends==============*/
    
     vertical_profile_new_layers=function(param)
    {
        
        probeAndTimeSeries.vertical_profile_new_layers($scope,param);
    }
    
    /*===============Update By Jay Starts=================*/
    
     setvertical_profile_new_layers=function(param)
     {
    	//console.log("in t");
     	$scope.vprofile_status=!$scope.vprofile_status;
     	
     	$scope.show_vprofile_flag=!$scope.show_vprofile_flag;
     	
     	if(!$scope.vprofile_status){
     		//document.getElementById('content_timeseries_id').style.display="none";
     		document.getElementById('content_vprofile_id').style.display="none";
     	
     	}else{
     		document.getElementById('time_tephi_vprofile_id').style.display="block";
    		$scope.showtime_tephi_vprofile();
//     		probeAndTimeSeries.vertical_profile_new_layers($scope,param);	//Updated By Jay On 08JAN2020
    		
    		//if($scope.content_timeseries_dygraph1==undefined){
//			console.log("in if of dygraph");
			
			$scope.temp_watch=$scope.$watch(function(scope){
													return document.getElementById('content_vprofile_new');
													},
											function(newvalue,oldvalue){
														if(newvalue!=undefined){
//															console.log("in watch if");
															$scope.initializeVprofile();
															probeAndTimeSeries.tephigram_layers($scope,param);
															$scope.temp_watch();
														}
													});
			
			//$scope.initializeDygraph();
		//}
			
     	}
     	//console.log("analysis obj:- ",$scope.analysis)
     }
     
    /*===============Update By Jay Ends=================*/
     
    
    $scope.timeseries_layers=function(param)
    {
        timeseries_layers(param);
    }
    
    /*================Update By Jay Starts===============*/
    
    $scope.settimeseries_layers=function(param)
    {
	//console.log('Pyl--param',param);
    	settimeseries_layers(param);
    }
    
    /*================Update By Jay Ends===============*/
    
    $scope.tephigram_layers=function(param)
    {
        tephigram_layers(param);
    }
    
    /*================Update By Jay Starts===============*/
    
    $scope.settephigram_layers=function(param){
    	settephigram_layers(param);
    }
    
    /*================Update By Jay Ends===============*/
    
    
    $scope.vertical_profile_layers=function(param)
    {
        vertical_profile_layers(param);
    }
    
    $scope.vertical_profile_new_layers=function(param)
    {
        vertical_profile_new_layers(param);
    } 
    
    /*=================Update By Jay Starts=============*/
    
    $scope.setvertical_profile_new_layers=function(param)
    {
        setvertical_profile_new_layers(param);
    }
    
    /*=================Update By Jay Ends=============*/
    
    /*=================Update By Jay Starts=============*/
    
    $scope.setvertical_profile_layers=function(param)
    {
	console.log('setvproflayrs___param',param);
        setvertical_profile_layers(param);
    }
    
    /*=================Update By Jay Ends=============*/
    
    $scope.timeseries_aws=function()
    {
        timeseries_aws();
    }
    
 
    timeseries_aws = function()
    {
        probeAndTimeSeries.timeseries_aws($scope);
    }
  
    
  
 


    $scope.getDisplayName = function(latest_time, latest_date, modification_type, timezone_type,value_to_add)
    {
        var latest_date_time_mod=displayDate.getDisplayName($scope,latest_time, latest_date, modification_type, timezone_type,value_to_add);
        return latest_date_time_mod;
    }
    


    $scope.toggleTimeZone=function()
    {
        toggleTimeZone.toggleTimeZone($scope);             
    }    

    
    
    $scope.dateConversion=function()
    {
        dateFormats.dateConversion($scope);
    }
  
 
  
  
  
  
    $scope.remove=function(layer) {
       
    	/*==============Update By Jay Starts On 16JAN2020=============================*/
        
//        console.log("in delete:- ",layer==$scope.selectedLayerTimeseries);
//        
//        if(layer==$scope.selectedLayerTimeseries){
//        	if($scope.selectedLayerTimeseries.animation_status){
//        		$scope.addAnimationLayer($scope.selectedLayerTimeseries);
//        	}
//        }
         console.log("$scope.selectedLayerTimeseries.animation_status:- ",$scope.selectedLayerTimeseries.animation_status);
    	if(layer==$scope.selectedLayerTimeseries && $scope.selectedLayerTimeseries.animation_status){
    		document.getElementById("toast_message_id").style.display="none";
    	}
    	
        /*==============Update By Jay Ends On 16JAN2020=============================*/
    	
        layerOperations.remove($scope,layer);
    };
     
    $scope.showLegend=function(layer,param,layername_previous){
        layerOperations.showLegend($scope,layer,param,layername_previous);
    }
    
    
  
    $scope.findLayerIndexByName=function(layerName,dateval,timeval)
    {
        var layer_index=commonFunctions.findLayerIndexByName($scope,layerName,dateval,timeval);
        return layer_index;    
    }

   
    $scope.callTimeIntervalFun=function()
    {
        window.setInterval($scope.syncRecentData,1000*60*2,'interval'); 
    }
       
    $scope.syncRecentData=function(param)
    {
        syncRecentData.syncRecentData($scope,param);

    }


    $scope.stateChanged=function(layer_object)
    {
        layerOperations.stateChanged($scope,layer_object);
    }
   
    $scope.stateChangedOpacity=function(layer_object)
    {
        layerOperations.stateChangedOpacity($scope,layer_object);
    }
    
    
    /* Code for opening dialog boxes starts*/
   
//    $scope.showCatalog=function(){
    $scope.showCatalog=function(ev){	//Updated By Jay On 26DEC2019
        topMenu.showCatalog($scope);
        $scope.showSatelliteLayer(ev);
        
    }
                     
              
    $scope.showTools=function(ev){
        topMenu.showTools($scope,ev);
    }  
                     

//    $scope.searchLocation=function()
    $scope.searchLocation=function(ev)	//Updated By Jay on 26DEC2019
    {                
        topMenu.searchLocation($scope);
        $scope.showSearch(ev);	//Updated By Jay on 26DEC2019
    }  
     
   

    $scope.slideDiv = function()
    {
        panelSetting.slideDiv($scope);
    }
    
    $scope.animation_stop = function()
    {
        panelSetting.animation_stop($scope);
    }
    $scope.animation_start = function()
    {
        panelSetting.animation_start($scope); 
    }

    
    
    window.setTimeout(
        function(){
            if ($scope.mouseover_flag == 0)
            {
                $scope.checked = 0;
                $scope.classval1 = "fa fa-angle-double-left";
            }
        }
        ,30000);
    
        
    $scope.hideDiv=function()
    {
        panelSetting.hideDiv($scope);
        
    }
    
    
    $scope.hideTopPanel=function()
    {
        panelSetting.hideTopPanel($scope); 
    }
    
    $scope.hideSidePanel=function()
    {
        panelSetting.hideSidePanel($scope); 
    }
    
    $scope.hideiconPanel = function()
    {
        panelSetting.hideiconPanel($scope); 
    }

    $scope.hideIcon = function()
    {
        var icon=panelSetting.hideIcon($scope); 
        return icon;    
    }    

   

//    $scope.hideDivIcon=function()
//    {
//        var hide_icon=panelSetting.hideDivIcon($scope); 
//        return hide_icon;
//    }
    
    /*=========================== Update Starts by Jay===================================*/
    
    $scope.hideDivIconSideBtn=function()
    {
        var hide_icon_side_btn=panelSetting.hideDivIconSideBtn($scope); 
        return hide_icon_side_btn;
    }
    
    /*=========================== Update Ends by Jay===================================*/
    
    $scope.hideDivBaseIcon=function()
    {
        panelSetting.hideDivBaseIcon($scope); 
    }
    
    $scope.hideDivOverlayIcon=function()
    {
        panelSetting.hideDivOverlayIcon($scope); 
    }

    
    $scope.removeLocationMarkers=function()
    {
        topMenu.removeLocationMarkers($scope);
    }
	
    $scope.removeDraggedLayer=function()
    {
        topMenu.removeDraggedLayer($scope);
    }  
    
    $scope.display_map=function()
    {
        
        displayMap.display_map($scope);
    }

    $scope.getTimezoneTooltip=function()
    {
        commonFunctions.getTimezoneTooltip($scope);
    }
    
    $scope.lonFormatter=function(lon)
    {
        //console.log("INSIDE CONTROLLER AND FUNCTION IS lonFormatter");
        var formattedLon= Math.abs(Math.round(lon*100)/100);
        return formattedLon;    
    }

   
      
    $scope.pointerMoveHandler = function(evt) {
        measure.pointerMoveHandler($scope,evt);
    }
    
    $scope.createMeasureTooltip=function()
    {
        measure.createMeasureTooltip($scope);
    }
 
 
 
    $scope.zoomToLocation=function(location_object)
    {  
        features.zoomToLocation($scope,location_object);               
    }

    $scope.resetZoom=function()
    {
        features.resetZoom($scope);
    }


 
    $scope.addInteraction=function(measurement_type) {   
        measure.addInteraction($scope,measurement_type);
    }
   
    
    
    
    
    $scope.showAlert = function(ev,$event,layer,which) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
    	//$scope.showPaletteSelectionFun(layer);
    	
//    	$scope.openCalendar_layer($event,layer,which);	

/*-------------------Update start on 19JUL2021 By Jay for Scatsat1 old data access----------------------*/

            if(layer.satellite=="SCATSAT-1"){
                //alert("In scatsat1");
                $scope.dateOptionsDt.maxDate=new Date(2021,02,01);
                $scope.dateOptionsDt.minDate=new Date(2021,02,01).setMonth(new Date(2021,02,01).getMonth()-3);
                $scope.dateOptionsDt.initDate=new Date(2021,02,01);
                $scope.date_main=new Date(2021,02,01);
            }else{
                $scope.dateOptionsDt.maxDate=new Date(); 
                $scope.dateOptionsDt.minDate=new Date().setMonth(new Date().getMonth()-3);
                $scope.date_main=new Date();
            }

/*-------------------Update end on 19JUL2021 By Jay for Scatsat1 old data access----------------------*/


	var temp_month_dict={"JAN": 0, "FEB": 1, "MAR":2, "APR":3, "MAY":4, "JUN":5 ,"JUL":6, "AUG":7, "SEP":8, "OCT":9, "NOV":10, "DEC":11};
    	
    	$scope.dateOptionsDt.initDate=$scope.date_main;
    	
    	$scope.openCalendar_layer($event,layer,which);	
    	
    	var temp_new_date=new Date(parseInt(layer.selectedTimeSetting.displayname_local.substring(5,9)),temp_month_dict[layer.selectedTimeSetting.displayname_local.substring(2,5)],parseInt(layer.selectedTimeSetting.displayname_local.substring(0,2)));
    	temp_new_date.setMinutes(temp_new_date.getMinutes() - temp_new_date.getTimezoneOffset());
    	
    	$scope.date_main=temp_new_date;

        $mdDialog.show(
        		{
        		 controller: DialogController,
    	         //templateUrl: 'dialog2.tmpl.html',
        		 contentElement: '#calendarDialog',
    		     parent: angular.element(document.body),
//    		     parent: angular.element(document.querySelector('#popupContainer')),
    		     targetEvent: ev,
    		     //scope: $scope,
    		     clickOutsideToClose:true}
        		
//          $mdDialog.alert()
//            .parent(angular.element(document.querySelector('#popupContainer')))
//            .clickOutsideToClose(true)
//            .title('This is an alert title')
//            .textContent('You can specify some description text in here.')
//            .ariaLabel('Alert Dialog Demo')
//            .ok('Got it!')
//            .targetEvent(ev)
        );
        
        
      };
      
      $scope.showRss = function(ev) {
          // Appending dialog to document.body to cover sidenav in docs app
          // Modal dialogs should fully cover application
          // to prevent interaction outside of dialog
      	//$scope.showPaletteSelectionFun(layer);
      	
      	//$scope.openCalendar_layer($event,layer,which);	
          $mdDialog.show(
          		{
          		 controller: DialogController,
      	         //templateUrl: 'dialog2.tmpl.html',
          		 contentElement: '#rssDialog',
      		     parent: angular.element(document.body),
//      		     parent: angular.element(document.querySelector('#popupContainer')),
      		     targetEvent: ev,
      		     //scope: $scope,
      		     clickOutsideToClose:true}
          		
//            $mdDialog.alert()
//              .parent(angular.element(document.querySelector('#popupContainer')))
//              .clickOutsideToClose(true)
//              .title('This is an alert title')
//              .textContent('You can specify some description text in here.')
//              .ariaLabel('Alert Dialog Demo')
//              .ok('Got it!')
//              .targetEvent(ev)
          );
          
          
        };
        
        
        $scope.showSearch = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
        	//$scope.showPaletteSelectionFun(layer);
        	
        	//$scope.openCalendar_layer($event,layer,which);	
            $mdDialog.show(
            		{
            		 controller: DialogController,
        	         //templateUrl: 'dialog2.tmpl.html',
            		 contentElement: '#searchDialog',
        		     parent: angular.element(document.body),
//        		     parent: angular.element(document.querySelector('#popupContainer')),
        		     targetEvent: ev,
        		     //scope: $scope,
        		     clickOutsideToClose:true}
            		
//              $mdDialog.alert()
//                .parent(angular.element(document.querySelector('#popupContainer')))
//                .clickOutsideToClose(true)
//                .title('This is an alert title')
//                .textContent('You can specify some description text in here.')
//                .ariaLabel('Alert Dialog Demo')
//                .ok('Got it!')
//                .targetEvent(ev)
            );
            
            
          };
	    
          $scope.showSatelliteLayer = function(ev) {
              // Appending dialog to document.body to cover sidenav in docs app
              // Modal dialogs should fully cover application
              // to prevent interaction outside of dialog
          	//$scope.showPaletteSelectionFun(layer);
          	
          	//$scope.openCalendar_layer($event,layer,which);	
              $mdDialog.show(
              		{
              		 controller: DialogController,
          	         //templateUrl: 'dialog2.tmpl.html',
              		 contentElement: '#satellitelistId',
          		     parent: angular.element(document.body),
//          		     parent: angular.element(document.querySelector('#popupContainer')),
          		     targetEvent: ev,
          		     //scope: $scope,
          		     clickOutsideToClose:true}
              		
//                $mdDialog.alert()
//                  .parent(angular.element(document.querySelector('#popupContainer')))
//                  .clickOutsideToClose(true)
//                  .title('This is an alert title')
//                  .textContent('You can specify some description text in here.')
//                  .ariaLabel('Alert Dialog Demo')
//                  .ok('Got it!')
//                  .targetEvent(ev)
              );
              
              
            };
            
            
            $scope.showtime_tephi_vprofile = function(ev) {
                // Appending dialog to document.body to cover sidenav in docs app
                // Modal dialogs should fully cover application
                // to prevent interaction outside of dialog
            	//$scope.showPaletteSelectionFun(layer);
            	
            	//$scope.openCalendar_layer($event,layer,which);	
                $mdDialog.show(
                		{
                		 controller: DialogController,
            	         //templateUrl: 'dialog2.tmpl.html',
                		 contentElement: '#time_tephi_vprofileId',
            		     parent: angular.element(document.body),
//            		     parent: angular.element(document.querySelector('#popupContainer')),
            		     targetEvent: ev,
            		     //scope: $scope,
            		     clickOutsideToClose:false}
                		
//                  $mdDialog.alert()
//                    .parent(angular.element(document.querySelector('#popupContainer')))
//                    .clickOutsideToClose(true)
//                    .title('This is an alert title')
//                    .textContent('You can specify some description text in here.')
//                    .ariaLabel('Alert Dialog Demo')
//                    .ok('Got it!')
//                    .targetEvent(ev)
                );
                
                
              };
        
        
        $scope.showSiteInfo = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
        	//$scope.showPaletteSelectionFun(layer);
        	
        	//$scope.openCalendar_layer($event,layer,which);	
            $mdDialog.show(
            		{
            		 controller: DialogController,
        	         //templateUrl: 'dialog2.tmpl.html',
            		 contentElement: '#siteInfoId',
        		     parent: angular.element(document.body),
//        		     parent: angular.element(document.querySelector('#popupContainer')),
        		     targetEvent: ev,
        		     //scope: $scope,
        		     clickOutsideToClose:true}
            		
//              $mdDialog.alert()
//                .parent(angular.element(document.querySelector('#popupContainer')))
//                .clickOutsideToClose(true)
//                .title('This is an alert title')
//                .textContent('You can specify some description text in here.')
//                .ariaLabel('Alert Dialog Demo')
//                .ok('Got it!')
//                .targetEvent(ev)
            );
            
            
          };
        

	 $scope.cycloneInfo = function(ev) {
              // Appending dialog to document.body to cover sidenav in docs app
              // Modal dialogs should fully cover application
              // to prevent interaction outside of dialog
          	//$scope.showPaletteSelectionFun(layer);
          	
          	//$scope.openCalendar_layer($event,layer,which);	
              $mdDialog.show(
              		{
              		 controller: DialogController,
          	         //templateUrl: 'dialog2.tmpl.html',
              		 contentElement: '#cyclone_Info_Id',
          		     parent: angular.element(document.body),
//          		     parent: angular.element(document.querySelector('#popupContainer')),
          		     targetEvent: ev,
          		     //scope: $scope,
          		     clickOutsideToClose:true}
              		
//                $mdDialog.alert()
//                  .parent(angular.element(document.querySelector('#popupContainer')))
//                  .clickOutsideToClose(true)
//                  .title('This is an alert title')
//                  .textContent('You can specify some description text in here.')
//                  .ariaLabel('Alert Dialog Demo')
//                  .ok('Got it!')
//                  .targetEvent(ev)
              );
              
              
            };



    $scope.showPrerenderedDialog = function(ev) {
    	//$scope.openCalendar_layer($event,layer,which);
        $mdDialog.show({
          contentElement: '#calendarDialog',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        });
      };
      
      
      
      $scope.hide = function($mdDialog) {
//    	  console.log("in hide");
	      $mdDialog.hide();
	    }
      
      
      	  
      
      function DialogController($mdDialog) {
//    	  $scope.items = [1, 2, 3, 4, 5, 6, 7];
//    		$scope.selectedItem = undefined;
//    		
//    		$scope.getSelectedText = function () {
//    		  if ($scope.selectedItem !== undefined) {
//    		    return "You have selected: Item " + $scope.selectedItem;
//    		  } else {
//    		    return "Please select an item";
//    		  }
//    		};
    	  
    	  if(!$scope.datepickers.dt){
    		  $scope.hide();
    	  }
    		
    		 $scope.hide = function() {
    		      $mdDialog.hide();
    		    };

    		    $scope.cancel = function() {
    		      $mdDialog.cancel();
    		    };

    		    $scope.answer = function(answer) {
    		      $mdDialog.hide(answer);
    		    };
    		  }

});
$('#datepicker').datepicker().on('hide',function(){
//	console.log('on hide');
	$scope.hide();
});

//$scope.shouldShow=function(layer){
//	console.log('in shoulShow');
//	console.log((layer.source.urlprefix || layer.source.urlweather_forecast) && layer.data_type!='satellite_analyzed_winds');
//	return (layer.source.urlprefix || layer.source.urlweather_forecast) && layer.data_type!='satellite_analyzed_winds';
//	
//};
       
//$('.datepicker').datepicker('hide');

