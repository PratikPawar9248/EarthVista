angular.module('awsLayerService',[])
    .service("awsLayer", ['$http',function($http){  
        var obj = {};
    
    
        obj.layer_arrangement_aws=function(scope)
        {
            var index_last= scope.layers.length-1; 
            var index=-1;
            if(scope.layers[index_last].name==scope.selectedCategoryNameAws)
            {
                index=index_last;       
            } 
            
            if(index<0)
            {     
                if(scope.layers[index_last].source.urlaws)
                {
                    scope.layers.splice(index_last,1);
                    index=index_last;
                    //alert("before....."+index);
                    scope.map.getLayers().removeAt(index);
                    // alert("after....."+index);
                    scope.count_overlaylayer=  scope.count_overlaylayer-1; 
                    scope.starting_layer_index= scope.count_overlaylayer;
                    scope.starting_baselayer_index= scope.starting_baselayer_index-1;
                }
                else
                {
                    for (var i = 0; i < scope.map.getLayers().getArray().length; i++)
                    {
                        if (scope.map.getLayers().getArray()[i].getProperties().name == 'Temperature')
                        {
                            scope.map.getLayers().remove(scope.map.getLayers().getArray()[i]);
                        }
                    }
                    index=index_last+1;
                }
                scope.index_aws_layer= index;
            }
        }
    
    
    
        obj.createAndAddAWSLayer=function(scope,temp_category)
        {
            var url="";
            scope.layer_arrangement_aws();

             if(temp_category.access_type=="normal")
            {
                scope.layers.push(temp_category); 
                scope.count_overlaylayer= scope.count_overlaylayer+1; 
                scope.starting_layer_index=scope.count_overlaylayer;
                scope.starting_baselayer_index=scope.starting_baselayer_index+1;    
            }
                   
            //console.log("createAndAddAWSLayer.........");      
            ////console.log("param............"+param);
            // if(param=="recentdate")
            {
                if(temp_category.aws_parameter.parameter_name!="All_station")
                {

//                    url=scope.folder_name_backend+"/get_paramameters_oracle.php?param="+temp_category.aws_parameter.parameter_name+"&timezone="+scope.timezone+"&gmt_date_time="+temp_category.selectedTimeSetting.displayname_gmt;
                	url=scope.folder_name_backend+"/get_paramameters_oracle.php?param="+temp_category.aws_parameter.parameter_name+"&timezone="+scope.timezone+"&gmt_date_time="+temp_category.selectedTimeSetting.displayname_gmt;

                }
                else
                {
//                    url= scope.folder_name_backend+"/aws_station_oracle.php";    
                	url= scope.folder_name_backend+"/aws_station_oracle.php";
                }    
            }
            
            
            //            else if(param=="backdate")
            //            {
            //                //console.log("selected_parameter.parameter_name........"+selected_parameter.parameter_name);
            //                         
            //                url=scope.folder_name_backend+"/get_param_on_dateselect_oracle.php?param="+selected_parameter.parameter_name+"&date="+scope.date_main+"&gmt="+temp_category.timeval_gmt;
            //                //console.log("url......"+url);    
            //            }
            //console.log("createAndAddAWSLayer service");
            // //console.log("parameter name......."+selected_parameter.parameter_name);
           
           
            $http.get(url).then(function(response)
            { 
                //console.log("*****PARAMETER*****");
                // //console.log("selected parameter......."+selected_parameter.cluster.name);
                //console.log("******COLOUR******");
                // //console.log("stroke colour......."+selected_parameter.style.image.stroke.color);
                              
                var temp= response.data;
                //console.log("response........"+temp);
                //alert(temp);
                var features = new ol.format.GeoJSON().readFeatures(temp, {
                    featureProjection: scope.selected_projection
                });
                var vectorSource = new ol.source.Vector({
                    features: features
                });
                var clusterSource = new ol.source.Cluster({
                    features: features,
                    distance: temp_category.aws_parameter.clusterSource.distance,
                    source: vectorSource
                    
                });
                var styleCache = {};
                //console.log("selected parameter......."+temp_category.aws_parameter.cluster.name);
                            
                var size_index=""; 
                var text_size="";

                var style1=function(feature, resolution) {

                    for (var i = 0; i < feature.get('features').length; i++) {
                        var size = feature.get('features')[i].get('param');
                        var size1="";
                        if(size)
                        {
                            size1=size.split(".");
                            size_index=size1[0];
                            text_size=size1[0];
                        }
                        else
                        {
                            size_index=size;
                                text_size:""
                        }
                    }

                    var style = styleCache[size_index];
                    if (!style) {
                        style = [new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 8,
                                stroke: new ol.style.Stroke({
                                    color: temp_category.aws_parameter.style.image.stroke.color
                                //  color: "white"
                                }),
                                fill: new ol.style.Fill({
                                    color: temp_category.aws_parameter.style.image.fill.color
                                // color: "green"
                                })
                            }),
                            text: new ol.style.Text({
                                text: text_size,
                                fill: new ol.style.Fill({
                                    color: temp_category.aws_parameter.style.text.fill.color
                                //  color:"white"    
                                })
                            })
                        })];
                        styleCache[size_index] = style;
                    }
                    return style;
                };
                var clusters = new ol.layer.Vector({
                    source: clusterSource,
                    name: temp_category.aws_parameter.cluster.name,
                    // name: "temp",
                    style: style1
                }); 
                //alert("index....."+scope.index_aws_layer);
                scope.map.getLayers().insertAt(scope.index_aws_layer,clusters);
            //  scope.map.getLayers().insertAt(4,scope.clusters);
                       // document.getElementById('toast_message_id').innerHTML=""; 
                scope.selected_list_id="";
            }); 
            
                //alert("temp category......................................");

                  
        }
        
        
        obj.awsDateSelected = function(scope)
        {
            //console.log("********gmt selected..........");
           
            scope.dateConversion();
            // scope.gmt=scope.gmtselected;

            $http.get(scope.folder_name+"/awsparameters.json")
            .then(function(response) {
                scope.aws_parameters = response.data;       
                for(var m=0;m<scope.aws_parameters.length;m++)
                {
                    if(scope.selectedCategoryNameAws==scope.aws_parameters[m].parameter_name)
                    {
                        var selected_parameter=scope.aws_parameters[m];  
                        ////console.log("scope.selectedCategoryNameAws........"+scope.selectedCategoryNameAws); 
                        scope.layer_arrangement_aws();
          
                   
                        scope.temp_category_aws[0].category=scope.selectedCategoryNameAws;
                        scope.temp_category_aws[0].station=scope.selectedStationAws;
               
                        if(scope.timezone==scope.timezone_local)
                        {
                            scope.temp_category_aws[0].dateval_local=scope.date_main_formatted;
                            scope.temp_category_aws[0].timeval_local=scope.selected_date;
                            scope.temp_category_aws[0].displayname_local=scope.selectedCategoryNameAws+" "+scope.temp_category_aws[0].dateval_local+" "+scope.temp_category_aws[0].timeval_local+" "+scope.selectedStationAws;   
                            var modified_date_time_display=scope.getDisplayName(scope.temp_category_aws[0].timeval_local,scope.temp_category_aws[0].dateval_local,"timezone_change","local_to_gmt","00:00:00");
                            scope.temp_category_aws[0].dateval_gmt=  modified_date_time_display.substring(0,modified_date_time_display.indexOf(" "));
                            scope.temp_category_aws[0].timeval_gmt=  modified_date_time_display.substring(modified_date_time_display.indexOf(" ")+1);
                            scope.temp_category_aws[0].displayname_gmt=scope.selectedCategoryNameAws+" "+scope.temp_category_aws[0].dateval_gmt+" "+scope.temp_category_aws[0].timeval_gmt+" "+scope.selectedStationAws;      
                         
                        }
                        else
                        {
                            scope.temp_category_aws[0].dateval_gmt=scope.date_main_formatted;
                            scope.temp_category_aws[0].timeval_gmt=scope.selected_date;
                            scope.temp_category_aws[0].displayname_gmt=scope.selectedCategoryNameAws+" "+scope.temp_category_aws[0].dateval_gmt+" "+scope.temp_category_aws[0].timeval_gmt+" "+scope.selectedStationAws;   
                            modified_date_time_display=scope.getDisplayName(scope.temp_category_aws[0].timeval_gmt,scope.temp_category_aws[0].dateval_gmt,"timezone_change","gmt_to_local","00:00:00");
                            scope.temp_category_aws[0].dateval_local=  modified_date_time_display.substring(0,modified_date_time_display.indexOf(" "));
                            scope.temp_category_aws[0].timeval_local=  modified_date_time_display.substring(modified_date_time_display.indexOf(" ")+1);
                            scope.temp_category_aws[0].displayname_local=scope.selectedCategoryNameAws+" "+scope.temp_category_aws[0].dateval_local+" "+scope.temp_category_aws[0].timeval_local+" "+scope.selectedStationAws;      
                        
                        }
                        scope.createAndAddAWSLayer("backdate","",selected_parameter,"","",scope.temp_category_aws[0]);
                  
       
                    
                        scope.layers.push(scope.temp_category_aws[0]);
                        scope.count_overlaylayer= scope.count_overlaylayer+1; 
                        scope.starting_layer_index=scope.count_overlaylayer;
                        scope.starting_baselayer_index=scope.starting_baselayer_index+1; 
                    }
                }
            });   
        }
        
        
        return obj;
    }]);



