angular.module('climatologyService',[])
    .service("climatology", ['$http','$mdDialog',function($http,$mdDialog){  
        var obj = {};
   
        obj.addClimatologyLayer=function(scope,selected_category)
        {
            
            var urlString = selected_category.source.url_climatology+"?service=WMS&version=1.3.0&request=GetCapabilities";
            //console.log(scope.weather_forecast_date);
            $http.get(urlString,
            {
                transformResponse:function(cnv)
                {
                    var x2js=new X2JS();
                    var afterCnv = x2js.xml_str2json(cnv);
                    return afterCnv;
                }
            }).success(function(response)
            {
                //var filename=scope.filename_forecast;
                var forecast_time_info_received= scope.getTimeForecast(response,selected_category);
             
                var forecast_time_info_received_arr=forecast_time_info_received.split(";");
                var forecast_time= forecast_time_info_received_arr[1];
                var file_date_time = forecast_time_info_received_arr[2];
               
                //console.log("FORECAST TIME......."+forecast_time);
                //console.log("FILE DATE......."+file_date_time);
               
                var layer_url_final = selected_category.source.url_climatology;
                var loop_k_returned =scope.layer_arrangement(selected_category);
                //console.log("layer_url_final........."+layer_url_final);
                //console.log("loop_k........."+loop_k_returned);
                var loop_k_returned_arr= loop_k_returned.split(",");
                var loop_k=Number(loop_k_returned_arr[0]);
                var overlay_k=Number(loop_k_returned_arr[1]);
                var params= {
                    LAYERS: selected_category.source.params.LAYERS,
                    COLORSCALERANGE: 'DEFAULT',
                    BELOWMINCOLOR: 'extend',
                    ABOVEMAXCOLOR: 'extend',
                    transparent: true,
                    format: 'image/png',
                    STYLES:selected_category.style
                // TIME: time_val
                };
                var layer_opacity=selected_category.active?selected_category.opacity:0;
                scope.insertLayerInMap(loop_k, layer_url_final, params, layer_opacity)
                scope.temp_category[0].name=selected_category.name;
                scope.temp_category[0].satellite=selected_category.satellite;
                scope.temp_category[0].sensor=selected_category.sensor;
                scope.temp_category[0].style=selected_category.style;
                scope.temp_category[0].active=selected_category.active;
                scope.temp_category[0].range_start_value=selected_category.range_start_value;
                scope.temp_category[0].range_end_value=selected_category.range_end_value;
                scope.temp_category[0].fix_layer=false; 
                
                 scope.map.getLayers().item(loop_k).getSource().updateParams({COLORSCALERANGE:scope.temp_category[0].range_start_value+","+scope.temp_category[0].range_end_value});
                
                if(scope.temp_category[0].satellite=="Ocean_Climatology")
                    {
                        scope.temp_category[0].data_type="ocean_climatology";  
                    }
                    else
                        {
                scope.temp_category[0].data_type="climatology";
                        }
                scope.temp_category[0].source.url_climatology=selected_category.source.url_climatology;
                 scope.temp_category[0].source.params.LAYERS=selected_category.source.params.LAYERS;
          
//                console.log("Climatology List Time Arr:- ",selected_category.list_time_arr);
                 
                scope.temp_category[0].list_time_arr=selected_category.list_time_arr;
                
                /*==================================Update Starts By Jay On 12FEB2020===========================================*/
                
                if(selected_category.sensor=="Solar Yearly"){
                	scope.temp_category[0].list_time_arr[0].displayname_gmt="1994 2018"
                	scope.temp_category[0].list_time_arr[0].displayname_local="1994 2018"
                }else if( selected_category.sensor=="Solar Monthly"){
                	for(var l=0;l<scope.temp_category[0].list_time_arr.length;l++){
                		scope.temp_category[0].list_time_arr[l].displayname_gmt=scope.temp_category[0].list_time_arr[l].displayname_gmt.substring(2,5)//+" 2018"
                        scope.temp_category[0].list_time_arr[l].displayname_local=scope.temp_category[0].list_time_arr[l].displayname_local.substring(2,5)//+" 2018"
                	}
                }
                
                /*==================================Update Ends By Jay On 12FEB2020===========================================*/
          
                scope.temp_category[0].selectedTimeSetting=selected_category.selectedTimeSetting;
                scope.temp_category[0].dateval=  selected_category.selectedTimeSetting.displayname_gmt.substring(0,selected_category.selectedTimeSetting.displayname_gmt.indexOf(" "));
                scope.temp_category[0].timeval=  selected_category.selectedTimeSetting.displayname_gmt.substring(selected_category.selectedTimeSetting.displayname_gmt.indexOf(" ")+1);
                scope.temp_category[0].dateval_local=  selected_category.selectedTimeSetting.displayname_local.substring(0,selected_category.selectedTimeSetting.displayname_local.indexOf(" "));
                scope.temp_category[0].timeval_local= selected_category.selectedTimeSetting.displayname_local.substring(selected_category.selectedTimeSetting.displayname_local.indexOf(" ")+1);
            

                scope.temp_category[0].opacity=selected_category.opacity;
                scope.layers.splice(loop_k,0,angular.copy(scope.temp_category[0]));
                
                scope.getBandList(scope.layers[loop_k]);
               
            
            
                scope.count_overlaylayer=overlay_k;
                scope.starting_layer_index=overlay_k;
                scope.count_layer=loop_k-scope.count_baselayer+1;
                scope.starting_baselayer_index=overlay_k+scope.count_layer;
                scope.count_added_layers++;
                scope.selected_list_id="";
                
                
                
                /*========================Update Starts By Jay On 11FEB2020=================================*/
                
                if(selected_category.style!=undefined && selected_category.style!=""){
                	scope.temp_watch1=scope.$watch(function(scope){
//                		console.log("Inside Watch1");
                		var id_val = "canvas_"+selected_category.name+"_"+selected_category.sensor;
                		
                		var temp_canvas=document.getElementById(id_val);
                        
//                        console.log("temp_canvas:- ",temp_canvas);
                        
                        if(temp_canvas==null){
                        	
//                        	console.log("layername_previous:- ",scope.temp_layername_previous);
                        	
                        	temp_canvas=document.getElementById("canvas_"+scope.temp_layername_previous+"_"+selected_category.sensor);
                        	
//                        	console.log("temp_canvas:- ",temp_canvas);
                        	
                        	return temp_canvas;
                        }
                		
    					return temp_canvas;
    					},
    			function(newvalue,oldvalue){
//    						console.log("Inside Watch2",newvalue,oldvalue);
    						if(newvalue!=undefined){
//    							console.log("Inside Watch3");
    							
    							scope.showLegend(scope.layers[loop_k],"toggle");
    							scope.temp_watch1();
    						}
    					});
                }
                
                /*========================Update Ends By Jay On 11FEB2020=================================*/
            });
            
            
            
        
  
        }

        return obj;
    }]);
    

