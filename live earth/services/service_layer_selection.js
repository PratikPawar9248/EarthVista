angular.module('layerSelectionService',[])
    .service("layerSelection", ['$http',function($http){  
        var obj = {};

        obj.addWeatherForecastLayer=function(scope,selected_category)
        {
            scope.addWeatherForecastLayer(selected_category);
        }
        
        obj.addAwsLayer=function(scope,selected_category,ev,add_layer_flag)
        {
           
            if(add_layer_flag==false)
            {
                for(var i=0;i<scope.layers.length;i++)
                {
                    if(scope.layers[i].source.urlaws)
                    {
                        selected_category= scope.layers[i]; 
                        // ival=i;
                        break;
                    }
                }
            }
                
         
            scope.visitor_time=new Date();
            scope.dateConversion();  
             
            
//            $http.get(scope.folder_name_backend+"/get_time_oracle.php?timezone="+scope.timezone+"&timezone_formal="+((scope.visitor_time.getTimezoneOffset())*60)+"&date_val="+scope.date_main_formatted ).then(function(response)
            $http.get(scope.folder_name_backend+"/get_time_oracle.php?timezone="+scope.timezone+"&timezone_formal="+((scope.visitor_time.getTimezoneOffset())*60)+"&date_val="+scope.date_main_formatted ).then(function(response)
            {
                var response_val=response.data;
                
                var response_val_arr = response_val.split(";");
                var latest_date_time=response_val_arr[0];
                var latest_date_time_arr=[];
                var latest_date_time_arr_received=latest_date_time.split(",");
                for(var i=latest_date_time_arr_received.length-1;i>=0;i--)
                {
                    latest_date_time_arr[i]=latest_date_time_arr_received[i].substring(latest_date_time_arr_received[i].indexOf("*")+1); 
                }           
                var param= 'change_time';
                scope.getTimeListing(selected_category,latest_date_time_arr,param);
                    
                var index_val = latest_date_time_arr.length-1;
                $http.get(scope.folder_name+"/awsparameters.json")
                .then(function(response) {
                    scope.aws_parameters = response.data;                   
                    for(var m=0;m<scope.aws_parameters.length;m++)
                    {
                        if(selected_category.name==scope.aws_parameters[m].parameter_name)
                        {
                            // //console.log("ARRAY......."+latest_date_time_arr[index_val]);
                            scope.temp_category_aws[0].aws_parameter=scope.aws_parameters[m];
                            scope.temp_category_aws[0].dateval_gmt=latest_date_time_arr[index_val].substring(0,2)+latest_date_time_arr[index_val].substring(3,6)+latest_date_time_arr[index_val].substring(7,11);
                            scope.temp_category_aws[0].timeval_gmt=latest_date_time_arr[index_val].substring(12,16);
                            scope.temp_category_aws[0].category=selected_category.name;
                            scope.temp_category_aws[0].station=scope.selectedStationAws;
                            // //console.log("dateval gmt......."+scope.temp_category_aws[0].dateval_gmt);
                            // //console.log("timeval gmt......."+scope.temp_category_aws[0].timeval_gmt);     
                            var modified_date_time_display=scope.getDisplayName(scope.temp_category_aws[0].timeval_gmt,scope.temp_category_aws[0].dateval_gmt,"timezone_change","gmt_to_local","00:00:00");
                            // //console.log("modified_date_time_display........."+modified_date_time_display);
                            scope.temp_category_aws[0].dateval_local=  modified_date_time_display.substring(0,modified_date_time_display.indexOf(" "));
                            scope.temp_category_aws[0].timeval_local=  modified_date_time_display.substring(modified_date_time_display.indexOf(" ")+1);
                            scope.temp_category_aws[0].displayname_gmt=selected_category.name+" "+scope.temp_category_aws[0].dateval_gmt+" "+scope.temp_category_aws[0].timeval_gmt+" "+selected_category.station;   
                            scope.temp_category_aws[0].displayname_local=selected_category.name+" "+scope.temp_category_aws[0].dateval_local+" "+scope.temp_category_aws[0].timeval_local+" "+selected_category.station;      
                            // //console.log("DATEVAL LOCAL.........."+scope.temp_category_aws[0].dateval_local);         
                            // //console.log("TIMEVAL LOCAL.........."+scope.temp_category_aws[0].timeval_local);       
                            scope.date_url=  scope.temp_category_aws[0].dateval_gmt.substring(5)+"/"+scope.temp_category_aws[0].dateval_gmt.substring(0,5)+"/";
                            scope.date_file_url=scope.temp_category_aws[0].dateval_gmt+"_"+scope.temp_category_aws[0].timeval_gmt;
                  
                            scope.temp_category_aws[0].list_time_arr=scope.selected_category.list_time_arr;
                            scope.temp_category_aws[0].selectedTimeSetting=scope.selected_category.selectedTimeSetting;
                            scope.temp_category_aws[0].list_parameter_arr=scope.aws_parameters;
                                
                            for(var i=0;i<scope.temp_category_aws[0].list_parameter_arr.length;i++)
                            {
                                if(scope.temp_category_aws[0].list_parameter_arr[i].parameter_name==scope.temp_category_aws[0].aws_parameter.parameter_name)
                                {
                                    scope.temp_category_aws[0].selectedBandSetting=scope.temp_category_aws[0].list_parameter_arr[i];
                                     
                                }
                                     
                            }
                            if (selected_category.quick_access)
                            {
                                if (scope.timezone == scope.timezone_local)
                                {
                                    selected_category.label = scope.temp_category_aws[0].dateval_local + " " + scope.temp_category_aws[0].timeval_local;
                                }
                                else if (scope.timezone == scope.timezone_gmt)
                                {
                                    selected_category.label = scope.temp_category_aws[0].dateval_gmt + " " + scope.temp_category_aws[0].timeval_gmt;
                                }
                            }
                            else
                            {
                                scope.temp_category_aws[0].access_type="normal";
                                for (var i = 0; i < scope.icon_list.length; i++)
                                {
                                    if (scope.icon_list[i].name == 'Temperature')
                                    {
                                        scope.icon_list[i].label = "";
                                        if (scope.icon_list[i].quick_access)
                                        {
                                            scope.icon_list[i].quick_access = false;
                                            var index = scope.iconarray.indexOf(scope.icon_list[i].name);
                                            scope.iconarray.splice(index, 1);
                                        }
                                    }
                     
                                }
                            }
                                  
                            scope.createAndAddAWSLayer(scope.temp_category_aws[0]);
                              
                        }
                    }
                });
               
            });       

           
  
        }
  
     
        obj.addLayers = function(scope,add_layer_flag)  
        {
//        	console.log("In add layer:- ",scope);
//        	console.log("add_layer_flag:- ",add_layer_flag)
            scope.selected_list_id="Loading data..Please wait.."; 
       
            var selected_category="";
            var ev="";
            if(scope.selectedObject.source.urlprefix)
            {
                selected_category = scope.selectedObject;
                ev= scope.selectedEvent;
                //// //console.log("addSatellite.........");
                scope.addSatelliteLayer(selected_category,ev,add_layer_flag); 
            } 
            else if(scope.selectedObject.source.urlweather_forecast || scope.selectedObject.source.url_analyzed_winds_prefix)
            {
                selected_category = scope.selectedObject;
                //// //console.log("addWeatherForecastLayer......");
                obj.addWeatherForecastLayer(scope,selected_category);
            }
            else if(scope.selectedObject.source.urlaws)
            {
                //selected_category = scope.selectedObject;
                //// //console.log("addAwsLayer......");
                obj.addAwsLayer(scope,scope.selectedObject,ev,add_layer_flag);
      
            }
            else if(scope.selectedObject.source.url_climatology)
            {
                //selected_category = scope.selectedObject;
                //// //console.log("addAwsLayer......");
                scope.addClimatologyLayer(scope.selectedObject,ev,add_layer_flag);
      
            }
                   
        }  
        
        return obj;
    }]);
