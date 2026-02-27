angular.module('updateLayerSettingService',[])
    .service("updateLayerSetting", ['$http','$window',function($http,$window){  
        var obj = {};
  
        obj.show3DInterface=function(scope,category,param,index_val)
        {  
            var length_val=category.list_time_arr.length;      
            var start_val=0;
            var end_val=length_val-1;
            scope.list_3D_arr_tab=[];
            var file_complete_url_once="";
            if(category.data_type=="weather_forecast")
            {
                // end_val=category.list_time_arr.length-category.index_val_current;
                start_val=category.index_val_current;
                end_val=category.index_val_current+12;
                
                if(end_val>=category.list_time_arr.length)
                {
                    end_val=category.list_time_arr.length-1;
                }
           
            }
            else
            {
                if(length_val>12)
                {
                    end_val=start_val+12;
                }
            }
          
       
          
            for(var i=end_val;i>=start_val;i--)
            {
                
                var dateval="";
                var timeval="";
                var dateval_layer="";
                if(scope.timezone==scope.timezone_gmt)
                {
                    dateval=category.list_time_arr[i].displayname_gmt.substring(0,category.list_time_arr[i].displayname_gmt.indexOf(" "));
                    timeval=category.list_time_arr[i].displayname_gmt.substring(category.list_time_arr[i].displayname_gmt.indexOf(" ")+1);
                }
                else
                {
                    dateval=category.list_time_arr[i].displayname_local.substring(0,category.list_time_arr[i].displayname_local.indexOf(" "));
                    timeval=category.list_time_arr[i].displayname_local.substring(category.list_time_arr[i].displayname_local.indexOf(" ")+1);   
                }
             
                var file_name=category.list_time_arr[i].file_name;
               
              
                var layer_name=category.source.params.LAYERS;
                var file_complete_url="";
             
                if(category.data_type=='satellite' || category.data_type=='geophysical_analyzed_winds' )
                {
                    file_complete_url=category.source.urlprefix+category.list_time_arr[i].file_url+file_name;
                    if(i==start_val)
                    {
                        file_complete_url_once=file_complete_url;  
                    }  
                    dateval_layer="";
                
                }
                else if(category.data_type=="weather_forecast")
                {  
                  
                    dateval_layer=category.list_time_arr[i].name;
                    file_complete_url=category.latest_filepath;
                    if(i==start_val)
                    {
                        file_complete_url_once=file_complete_url;  
                    } 
               
                }
   
		 else if(category.data_type=="ocm_data")
                {
    //             console.log("in else ")
                 scope.month1={"JAN":"01","FEB":"02","MAR":"03","APR":"04","MAY":"05","JUN":"06","JUL":"07","AUG":"08","SEP":"09","OCT":"10","NOV":"11","DEC":"12"};
                    scope.month2=scope.month1[scope.date_file_url.substring(2,5)];
  //                  console.log(scope.month2)
                    scope.newdate=scope.date_file_url.substring(5,9)+scope.month2+scope.date_file_url.substring(0,2);
                        console.log(scope.newdate)
  file_complete_url=category.source.urlprefix+scope.date_url+category.source.urlfileprefix+scope.newdate+"_"+category.source.urlfilesuffix;
			//  console.log(" url --> ",file_complete_url)

//                    console.log(file_complete_url)
                    if(i==start_val)
                    {
                        file_complete_url_once=file_complete_url;
                    }

                    console.log(file_complete_url_once)
                }
                else if(category.data_type=="climatology")
                {  
                    dateval_layer=category.list_time_arr[i].name;
                    file_complete_url=category.source.url_climatology;
                    if(i==start_val)
                    {
                        file_complete_url_once=file_complete_url;  
                    }   
                }
                var style=category.style;
              
                var temp_var=
                {
                    "dateval":dateval,
                    "timeval":timeval,
                    "dateval_layer":dateval_layer,
                  
                    "file_complete_url":file_complete_url,
                    // "style":"boxfill/rainbow",
                    "style":style,
                    "layer_name":layer_name,
                    "range_start_value":category.range_start_value,
                    "range_end_value":category.range_end_value
                };
                scope.list_3D_arr_tab.splice(0,0,temp_var);
            }
           
            $http.get(file_complete_url_once+"?service=WMS&version=1.3.0&request=GetCapabilities",
            {
                transformResponse:function(cnv)
                {
                    var x2js=new X2JS();
                    var afterCnv = x2js.xml_str2json(cnv);
                    return afterCnv;
                }
            }).success(function(response)
            {
               
             
                var bounding_box="";
                var projection="";
               
                if(response.WMS_Capabilities.Capability)
                {
                  
                    if(!response.WMS_Capabilities.Capability.Layer.Layer.Layer[0])
                    {
                        var east_longitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer.EX_GeographicBoundingBox.eastBoundLongitude;
                        var west_longitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer.EX_GeographicBoundingBox.westBoundLongitude;
                        var south_latitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer.EX_GeographicBoundingBox.southBoundLatitude;
                        var north_latitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer.EX_GeographicBoundingBox.northBoundLatitude;
                        bounding_box=west_longitude+","+south_latitude+","+east_longitude+","+north_latitude;
                        projection=  response.WMS_Capabilities.Capability.Layer.Layer.Layer.BoundingBox._CRS;  
             
                    }
                    else
                    {
                        east_longitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].EX_GeographicBoundingBox.eastBoundLongitude;
                        west_longitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].EX_GeographicBoundingBox.westBoundLongitude;
                        south_latitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].EX_GeographicBoundingBox.southBoundLatitude;
                        north_latitude=response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].EX_GeographicBoundingBox.northBoundLatitude;
                        bounding_box=west_longitude+","+south_latitude+","+east_longitude+","+north_latitude;
                        projection=  response.WMS_Capabilities.Capability.Layer.Layer.Layer[0].BoundingBox._CRS;  
               
                    }
                }
                
              
          
                var temp_modified={
                    //"name":category.name+'</script><script>alert(document.cookie)</script>',
                    "name":category.name,
                    "sensor":category.sensor,
                    "data_type":category.data_type,
                    "index":0,
                    "projection":projection,
                    "bounding_box":bounding_box,
                    "array_files": scope.list_3D_arr_tab,
                    "base_layer":{
                        "urlbase":scope.layers[0].source.urlbase,
                        "layer":scope.layers[0].source.params.LAYERS,
                        "displayname":scope.layers[0].displayname
                    }
                };
                
                if(param=='all')
                {
                        
                    scope.return_array[scope.return_array_index_val]= temp_modified; 
                    scope.return_array_index_val++;
                       
                    scope.index_val_temp++;
                       
                      
                    if(scope.index_val_temp<scope.layers.length)
                    {       
                        if(!scope.layers[scope.index_val_temp].source.urlbase && !scope.layers[scope.index_val_temp].source.url)
                        {
                            obj.show3DInterface(scope,scope.layers[scope.index_val_temp],param,scope.index_val_temp);    
                        }
                        else
                        {
                            var return_array_encoded= scope.return_array;  
                               //console.log("return array.............."+scope.return_array); 
                            obj.openWindowWithPost(scope,"./3d/index_all.php",return_array_encoded);          
                                  
                            
                        }
                    }
                      
                }
                else
                {
                    if(window.location.href.indexOf(scope.url_variable)>-1)
                    {
                        var temp_modified_encoded = temp_modified;
                        obj.openWindowWithPost(scope,"./3d/index.php",temp_modified_encoded);          
                    }
                }
            });
    
    }
      
   
      
    obj.multilayer_3d=function(scope)
    {
        scope.return_array=[];
        scope.return_array_index_val=0;
        for(var i=0;i<scope.layers.length;i++)
        {
            if(!scope.layers[i].source.urlbase && !scope.layers[i].source.url)
            {
                obj.show3DInterface(scope,scope.layers[i],'all');
                       
                scope.index_val_temp=i;
                 
                break;
            }
        }
              
    //  //console.log("return array........"+scope.return_array[0].name);
    }
      
      
    obj.openWindowWithPost=function(scope,url,data) {
        var form = document.createElement("form");
        form.id = "form1";
        form.target = "_blank";
        form.method = "POST";
        form.action = url;
        form.style.display = "none";

        var input = document.createElement("input");
        input.id = "input";
        input.type = "hidden";
        input.name = "data";
        input.value=JSON.stringify(data);  
        // input.value = JSON.stringify(scope.list_palette_arr); 
        form.appendChild(input);
   

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }
  
    obj.updateSelectedUserRangeSetting=function(scope,category,param)
    {
            
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        scope.layer_to_modify = scope.map.getLayers().item(index_val);
            
        if (param == 'user_selection' && scope.thresholdControl)
        {
            document.getElementsByName('threshold-value').innerText = scope.thresholdControl[0].value;
            scope.raster.changed();
        }
            
        if(param=='default')
        {
            category.range_start_value=category.range_min_value;
            category.range_end_value=category.range_max_value; 
                
            scope.thresholdControl[0].value = 20;
            scope.raster.changed();
        }
        scope.layer_to_modify.getSource().updateParams({
            COLORSCALERANGE:category.range_start_value+','+category.range_end_value
        }); 
       
        if(scope.layers[index_val].showLegendVar)
        {
            scope.showLegend(scope.layers[index_val],'update');
        }
        if(scope.layers[index_val+1].displayname.contains("Contours"))
        {
            obj.updateContourSetting(scope,category);
            obj.updateContourSetting(scope,category);	//Updated By Jay On 03JAN2020
        } 
    }
    
    obj.regionGrowing=function(scope,category)
    {
    	/*==============Update By Jay Starts On 01JAN2020===================================*/
//    	console.log("in region growing")
    	scope.region_growing_status=!scope.region_growing_status;
    	//category.showImageSetting=scope.region_growing_status;
    	
    	/*==============Update By Jay Ends On 01JAN2020===================================*/
    	
        if (category.name == scope.name)
        {
//        	console.log("in if");
            scope.map.removeOverlay(scope.rasterImage);
            scope.name = null;
        }
        else
        {
//        	console.log("in else");
        	
            var index_val = scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
            scope.name = category.name;
            scope.map.removeOverlay(scope.rasterImage);
            
            function growRegion(inputs, data) {
                var image = inputs[0];
                var seed = data.pixel;
                var delta = parseInt(data.delta);
                if (!seed) {
                    return image;
                }
                seed = seed.map(Math.round);
                var width = image.width;
                var height = image.height;
                var inputData = image.data;
                var outputData = new Uint8ClampedArray(inputData);
                var seedIdx = (seed[1] * width + seed[0]) * 4;
                var seedR = inputData[seedIdx];
                var seedG = inputData[seedIdx + 1];
                var seedB = inputData[seedIdx + 2];
                var edge = [seed];
                while (edge.length) {
                    var newedge = [];
                    for (var i = 0, ii = edge.length; i < ii; i++) {
                        var next = next4Edges(edge[i]);
                        for (var j = 0, jj = next.length; j < jj; j++) {
                            var s = next[j][0], t = next[j][1];
                            if (s >= 0 && s < width && t >= 0 && t < height) {
                                var ci = (t * width + s) * 4;
                                var cr = inputData[ci];
                                var cg = inputData[ci + 1];
                                var cb = inputData[ci + 2];
                                var ca = inputData[ci + 3];
                                if (ca === 0) {
                                    continue;
                                }
                                if (Math.abs(seedR - cr) < delta && Math.abs(seedG - cg) < delta && Math.abs(seedB - cb) < delta) {
                                    outputData[ci] = 255;
                                    outputData[ci + 1] = 0;
                                    outputData[ci + 2] = 0;
                                    outputData[ci + 3] = 255;
                                    newedge.push([s, t]);
                                }
                                inputData[ci + 3] = 0;
                            }
                        }
                    }
                    edge = newedge;
                }
                return{
                    data: outputData, 
                    width: width, 
                    height: height
                };
            }
            
            function next4Edges(edge) {
                var x = edge[0], y = edge[1];

                return[[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
            }

//	    console.log("Region Layer:- ",scope.map.getLayers().item(index_val).getSource());
//	    console.log("Region Layers:- ",scope.map.getLayers());
//	    console.log("Region Layer1 Compare:- ",scope.map.getLayers().item(index_val).getSource()==scope.map.getLayers().array_[index_val].getSource());

            scope.raster = new ol.source.Raster({
                sources: [scope.map.getLayers().item(index_val).getSource()],
                operationType: 'image',
                operation: growRegion,
                lib: {
                    next4Edges: next4Edges
                }
            }
            );

            scope.rasterImage = new ol.layer.Image({
                opacity: 0.5, 
                source: scope.raster
            });

            scope.map.addOverlay(scope.rasterImage);
            var coordinate;
            scope.map.on('click', function(event) {
                coordinate = event.coordinate;
                scope.raster.changed();
            });

//            scope.thresholdControl = document.getElementsByName("threshold-value");
//            scope.thresholdControl = document.getElementsByName("threshold-value1");	//Updated By Jay On 01JAN2020
            scope.thresholdControl = document.getElementsByName("threshold-value");	//Updated By Jay On 03JAN2020
            scope.raster.on('beforeoperations', function(event) {
                var data = event.data;
                data.delta = scope.thresholdControl[0].value;
                if (coordinate) {
                    data.pixel = scope.map.getPixelFromCoordinate(coordinate);
                }
            });
        }
    }
    
    obj.updateContourSetting=function(scope,category)
    {
        
    	/*================Update By Jay Starts on 01JAN2020===============================*/
    	
    	scope.contours_status=!scope.contours_status;
    	
    	category.contour=scope.contours_status;
    	
    	scope.selectedLayerTimeseries_prev=category;
    	
    	/*================Update By Jay Ends on 01JAN2020===============================*/
    	
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        var satContourCount=0;
        var range_val_contours='DEFAULT';
        
//        console.log("in update contour settings");
        
//        console.log("category.name:- ",category.name);
//        console.log("category.dateval:- ",category.dateval);
//        console.log("category.timeval:- ",category.timeval);
        
//        console.log("category:- ",category);
        
        if(category.contour)      
        { 
            range_val_contours=scope.map.getLayers().item(index_val).getSource().getParams().COLORSCALERANGE; 
            scope.selectedRangeSettingContour= scope.selectedRangeSetting; 
          
            satContourCount=Math.round((category.range_end_value-category.range_start_value)/category.satContourInterval);  
            
//            console.log("!(scope.layers[index_val+1].displayname.contains('Contours')):- ",!(scope.layers[index_val+1].displayname.contains("Contours")));
//            console.log("scope.layers[index_val+1]:- ",scope.layers[index_val+1]);
            
            if(!(scope.layers[index_val+1].displayname.contains("Contours")))
            {
//            	console.log("in contours");
            	
                
                if(scope.layers[index_val].data_type=="weather_forecast")
                {
                    scope.layer_url_final=scope.layers[index_val].source.urlweather_forecast+scope.layers[index_val].date_own_format+scope.layers[index_val].source.urlweather_forecast_suffix;     
                } 
                else if(scope.layers[index_val].data_type=="satellite")
                {
//                	console.log("inside satellite")
                    scope.layer_url_final=scope.layers[index_val].source.urlprefix+scope.layers[index_val].dateval.substring(5)+"/"+scope.layers[index_val].dateval.substring(0,5)+"/"+scope.layers[index_val].source.urlfileprefix+scope.layers[index_val].dateval+"_"+scope.layers[index_val].timeval+scope.layers[index_val].source.urlfilesuffix;     
                }
                scope.temp_category_one[0].basicname=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].name=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].logicalname=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].source.urlaggregation=scope.layers[index_val].source.urlaggregation;
                scope.temp_category_one[0].satellite=scope.layers[index_val].satellite;
                scope.temp_category_one[0].sensor=scope.layers[index_val].sensor;
                scope.temp_category_one[0].dateval=scope.layers[index_val].dateval;
                scope.temp_category_one[0].timeval=scope.layers[index_val].timeval;
                scope.temp_category_one[0].active=scope.layers[index_val].active;
                scope.temp_category_one[0].opacity=scope.layers[index_val].opacity;
                scope.temp_category_one[0].isContour=true;
                scope.temp_category_one[0].source.params.LAYERS=scope.layers[index_val].source.params.LAYERS;
                scope.temp_category_one[0].source.urlprefix=scope.layers[index_val].source.urlprefix;
                scope.temp_category_one[0].source.urlfileprefix=scope.layers[index_val].source.urlfileprefix;
                scope.temp_category_one[0].source.urlfilesuffix=scope.layers[index_val].source.urlfilesuffix;
                scope.temp_category[0].displayname=scope.layers[index_val].displayname+"(Contours)";
                scope.layers.splice(index_val+1,0,angular.copy(scope.temp_category_one[0]));
           
                scope.map.getLayers().insertAt(index_val+1,new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url:scope.layer_url_final,
                        params: {
                            LAYERS: scope.layers[index_val+1].source.params.LAYERS,
                            transparent: true,
                            format: 'image/png',
                            STYLES:'contour',
                            NUMCONTOURS:satContourCount,
                            COLORSCALERANGE:range_val_contours,
                            BELOWMINCOLOR:'extend',
                            ABOVEMAXCOLOR:'extend'
                        }
                    }),
                    opacity: 1
                }));
                index_val++;
                scope.count_layer++;
                scope.starting_baselayer_index++;        
            }
            else
            {
            	
//            	console.log("in else contours");
          
                scope.layer_to_modify_contours = scope.map.getLayers().item(index_val+1);
                scope.layer_to_modify_contours.getSource().updateParams({
                    LAYERS: category.source.params.LAYERS,
                    COLORSCALERANGE:range_val_contours,
                    NUMCONTOURS:satContourCount
                });
           
            
            }
        }
        else
        {
//        	console.log("in else else contours");
        	
            scope.remove(scope.layers[index_val+1]);
        }
        for(var i=0;i<scope.layers.length;i++)
        {
           
            }
    }
    
    /*=================================Update Starts By Jay==========================================*/
    
    obj.updateContourSetting_CallFromDateTimeFunc=function(scope,category)
    {
           
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        var satContourCount=0;
        var range_val_contours='DEFAULT';
        
//        console.log("category.name:- ",category.name);
//        console.log("category.dateval:- ",category.dateval);
//        console.log("category.timeval:- ",category.timeval);
        
        if(category.contour)      
        { 
            range_val_contours=scope.map.getLayers().item(index_val).getSource().getParams().COLORSCALERANGE; 
            scope.selectedRangeSettingContour= scope.selectedRangeSetting; 
          
            satContourCount=Math.round((category.range_end_value-category.range_start_value)/category.satContourInterval);  
            
//            console.log("!(scope.layers[index_val+1].displayname.contains('Contours')):- ",!(scope.layers[index_val+1].displayname.contains("Contours")));
//            console.log("scope.layers[index_val+1]:- ",scope.layers[index_val+1]);
            
            /*====Update Start========*/
            //console.log("scope.layers[index_val+1]:- ",scope.layers[index_val+1]);
            scope.remove(scope.layers[index_val+1]);
            
            /*====Update End========*/
            
            if(!(scope.layers[index_val+1].displayname.contains("Contours")))
            {
                
                if(scope.layers[index_val].data_type=="weather_forecast")
                {
                    scope.layer_url_final=scope.layers[index_val].source.urlweather_forecast+scope.layers[index_val].date_own_format+scope.layers[index_val].source.urlweather_forecast_suffix;     
                } 
                else if(scope.layers[index_val].data_type=="satellite")
                {
//                	console.log("inside satellite")
                    scope.layer_url_final=scope.layers[index_val].source.urlprefix+scope.layers[index_val].dateval.substring(5)+"/"+scope.layers[index_val].dateval.substring(0,5)+"/"+scope.layers[index_val].source.urlfileprefix+scope.layers[index_val].dateval+"_"+scope.layers[index_val].timeval+scope.layers[index_val].source.urlfilesuffix;     
                }
                scope.temp_category_one[0].basicname=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].name=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].logicalname=scope.layers[index_val].name+"_contour";
                scope.temp_category_one[0].source.urlaggregation=scope.layers[index_val].source.urlaggregation;
                scope.temp_category_one[0].satellite=scope.layers[index_val].satellite;
                scope.temp_category_one[0].sensor=scope.layers[index_val].sensor;
                scope.temp_category_one[0].dateval=scope.layers[index_val].dateval;
                scope.temp_category_one[0].timeval=scope.layers[index_val].timeval;
                scope.temp_category_one[0].active=scope.layers[index_val].active;
                scope.temp_category_one[0].opacity=scope.layers[index_val].opacity;
                scope.temp_category_one[0].isContour=true;
                scope.temp_category_one[0].source.params.LAYERS=scope.layers[index_val].source.params.LAYERS;
                scope.temp_category_one[0].source.urlprefix=scope.layers[index_val].source.urlprefix;
                scope.temp_category_one[0].source.urlfileprefix=scope.layers[index_val].source.urlfileprefix;
                scope.temp_category_one[0].source.urlfilesuffix=scope.layers[index_val].source.urlfilesuffix;
                scope.temp_category[0].displayname=scope.layers[index_val].displayname+"(Contours)";
                scope.layers.splice(index_val+1,0,angular.copy(scope.temp_category_one[0]));
           
                scope.map.getLayers().insertAt(index_val+1,new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url:scope.layer_url_final,
                        params: {
                            LAYERS: scope.layers[index_val+1].source.params.LAYERS,
                            transparent: true,
                            format: 'image/png',
                            STYLES:'contour',
                            NUMCONTOURS:satContourCount,
                            COLORSCALERANGE:range_val_contours,
                            BELOWMINCOLOR:'extend',
                            ABOVEMAXCOLOR:'extend'
                        }
                    }),
                    opacity: 1
                }));
                index_val++;
                scope.count_layer++;
                scope.starting_baselayer_index++;        
            }
            else
            {
          
                scope.layer_to_modify_contours = scope.map.getLayers().item(index_val+1);
                scope.layer_to_modify_contours.getSource().updateParams({
                    LAYERS: category.source.params.LAYERS,
                    COLORSCALERANGE:range_val_contours,
                    NUMCONTOURS:satContourCount
                });
           
            
            }
        }
        else
        {
            scope.remove(scope.layers[index_val+1]);
        }
        for(var i=0;i<scope.layers.length;i++)
        {
           
            }
    }
    
    /*=================================Update Ends By Jay==========================================*/
   
    obj.updateSelectedRangeSetting=function(scope, category,range_type)
    {
          
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        scope.layer_to_modify = scope.map.getLayers().item(index_val);
        scope.selectedRangeSetting=range_type;           
        if(scope.selectedRangeSetting=="Default Range")
        {
            scope.layer_to_modify.getSource().updateParams({
                COLORSCALERANGE:'DEFAULT'
            });
            scope.layers[index_val].range_start_value=-25;
            scope.layers[index_val].range_end_value=-5;
        }
        else if(scope.selectedRangeSetting=="From data")
        {
            if(scope.layers[index_val].range_min_value==-25 && scope.layers[index_val].range_max_value==-5)
            {
                var url_prefix = scope.layer_url_final + "?version=1.3.0&CRS="+scope.selected_projection+"&SRS="+scope.selected_projection+"&service=WMS&request=GetMetadata&item=minmax" +
                "&BBOX=" + scope.map.getView().calculateExtent(scope.map.getSize()) +
                "&ELEVATION=" + "0" +"&INFO_FORMAT=text/xml&LAYERS=";
                var url_suffix = "&WIDTH=" + scope.w_gettimeseries + "&HEIGHT=" + scope.h_gettimeseries;
                scope.featureInfoUrl_satlayer_start = url_prefix+""+scope.layers[index_val].source.params.LAYERS+url_suffix;
                scope.index_satlayer_start=index_val;
                $http.get(scope.featureInfoUrl_satlayer_start).then(function(response)
                {
                 
                    var min_max_val=response.data;
                    scope.min_val_satlayer_start=min_max_val.min;
                    scope.max_val_satlayer_start=min_max_val.max;
                  
                    scope.layer_to_modify.getSource().updateParams({
                        COLORSCALERANGE:scope.min_val_satlayer_start+','+scope.max_val_satlayer_start
                    });  
                    scope.layer_to_modify.getSource().updateParams({
                        BELOWMINCOLOR:'extend'
                    });  
                    scope.layer_to_modify.getSource().updateParams({
                        ABOVEMAXCOLOR:'extend'
                    }); 
                    scope.layers[scope.index_satlayer_start].range_start_value=scope.min_val_satlayer_start;
                    scope.layers[scope.index_satlayer_start].range_end_value=scope.max_val_satlayer_start;
                    scope.layers[scope.index_satlayer_start].range_min_value=scope.min_val_satlayer_start;
                    scope.layers[scope.index_satlayer_start].range_max_value=scope.max_val_satlayer_start;
                    if(scope.layers[scope.index_satlayer_start].showLegendVar)
                    {
//                    	console.log("in update")
                        scope.showLegend(scope.layers[scope.index_satlayer_start],'update');
                        //scope.showLegend(scope.layers[scope.index_satlayer_start],'toggle');
                    }
                });      
            }
            else
            {
                scope.layer_to_modify.getSource().updateParams({
                    COLORSCALERANGE:scope.layers[index_val].range_min_value+','+scope.layers[index_val].range_max_value
                });  
                scope.layer_to_modify.getSource().updateParams({
                    BELOWMINCOLOR:'extend'
                });  
                scope.layer_to_modify.getSource().updateParams({
                    ABOVEMAXCOLOR:'extend'
                }); 
                scope.layers[index_val].range_start_value=scope.layers[index_val].range_min_value;
                scope.layers[index_val].range_end_value=scope.layers[index_val].range_max_value;
                if(scope.layers[index_val].showLegendVar)
                {
                    scope.showLegend(scope.layers[index_val],'update');
                }  
            }
            if(scope.layers[index_val+1].displayname.contains("Contours"))
            {
                obj.updateContourSetting(scope,category);
            } 
        } 
      
    }
    
    obj.updateSelectedLayerBand=function(scope,category)
    {
          
        obj.updateSelectedLayerCommon(scope,category,"band_selection"); 
    }
        
        
             
    obj.updateSelectedLayerCommon=function(scope,category,operation_type)
    {
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        var min_max_url="";
        if(scope.layers[index_val].source.urlaws)
        {
            category.aws_parameter=category.selectedBandSetting;
            scope.createAndAddAWSLayer(category);  
        }
        else if(category.data_type=="climatology")
        {       
            scope.layer_to_modify = scope.map.getLayers().item(index_val);
            scope.layer_to_modify.getSource().setUrl(category.selectedBandSetting.source.url_climatology);
            scope.layer_to_modify.getSource().updateParams({
                LAYERS:category.selectedBandSetting.source.params.LAYERS                                
            });
            
            /*=================================Update Starts By Jay On 11FEB2020==================================*/
            
            var temp_climatology_prev_layer=scope.layers[index_val];
            
            /*=================================Update Ends By Jay On 11FEB2020==================================*/
            
            scope.layers[index_val].source.params.LAYERS=category.selectedBandSetting.source.params.LAYERS;
            scope.layers[index_val].source.url_climatology=category.selectedBandSetting.source.url_climatology;
            scope.layers[index_val].range_start_value=category.selectedBandSetting.range_start_value;
            scope.layers[index_val].range_end_value=category.selectedBandSetting.range_end_value;
            scope.layers[index_val].name=category.selectedBandSetting.name;
            scope.layers[index_val].units=category.selectedBandSetting.units;
            if(scope.show_timeseries_flag)
            {
                   
                scope.timeseries_layers();
               
            } 
            category.showBandSetting= !(category.showBandSetting);
            
            
            /*=================================Update Starts By Jay On 11FEB2020==================================*/
            
            if(category.sensor=="Solar Yearly" || category.sensor=="Solar Monthly"){
            	scope.layer_to_modify.getSource().updateParams({
                    LAYERS:category.selectedBandSetting.source.params.LAYERS,
                    COLORSCALERANGE:scope.layers[index_val].range_start_value+','+scope.layers[index_val].range_end_value
    
                });
            	
            	
            	//console.log("canvas_"+temp_climatology_prev_layer.name+"_"+scope.layers[index_val].sensor);
            	//scope.showLegend(scope.layers[index_val],'update',temp_climatology_prev_layer.name);
            	
            	
            	if(category.style!=undefined && category.style!=""){
                	scope.temp_watch1=scope.$watch(function(scope){
//                		console.log("Inside Watch1");
                		var id_val = "canvas_"+temp_climatology_prev_layer.name+"_"+category.sensor+"_"+category.satellite;
                		
                		var temp_canvas=document.getElementById(id_val);
                        
//                        console.log("temp_canvas:- ",temp_canvas);
                        
                        if(temp_canvas==null){
                        	
//                        	console.log("layername_previous:- ",scope.temp_layername_previous);
                        	
                        	temp_canvas=document.getElementById("canvas_"+temp_climatology_prev_layer.name+"_"+category.sensor+"_"+category.satellite);
                        	
//                        	console.log("temp_canvas:- ",temp_canvas);
                        	
                        	return temp_canvas;
                        }
                		
    					return temp_canvas;
    					},
    			function(newvalue,oldvalue){
//    						console.log("Inside Watch2",newvalue,oldvalue);
    						if(newvalue!=undefined){
//    							console.log("Inside Watch3");
    							
    							scope.showLegend(scope.layers[index_val],'update',temp_climatology_prev_layer.name);
    							scope.temp_watch1();
    						}
    					});
            	}
            }
            
            /*=================================Update Ends By Jay On 11FEB2020==================================*/
        }
        else 
        {
               
            if(category.data_type=="satellite")
            {
                
            	/*updat start at 14NOV2019 By Jay Not needed replace with select ng-option*/
            	
            	/*update reason:- To migrate md-select,md-option with select,option, gives error of object considering as string like "[object Object]", so for that reason the variable using that object is reassigned here as actual object instead ob object string "[object Object]" */
            	
                //console.log("bef change in band:- ",category);    
                
                //category.selectedBandSetting=JSON.parse(category.selectedBandSetting);
                
                //console.log("aft change in band:- ",category)
                
                /*updat end at 14NOV2019 By Jay*/
                
                min_max_url=  category.selectedBandSetting.source.urlprefix+scope.layers[index_val].dateval.substring(5,9)+"/"+scope.layers[index_val].dateval.substring(0,5)+"/"+scope.layers[index_val].source.urlfileprefix+scope.layers[index_val].dateval+"_"+scope.layers[index_val].timeval+scope.layers[index_val].source.urlfilesuffix+"?version=1.3.0&CRS="+scope.selected_projection+"&SRS="+scope.selected_projection+"&service=WMS&request=GetMetadata&item=minmax&BBOX=" + scope.map.getView().calculateExtent(scope.map.getSize())+"&ELEVATION=0&INFO_FORMAT=text/xml&LAYERS="+category.selectedBandSetting.source.params.LAYERS+scope.layers[index_val].source.urlsuffixmodified;       
                 
            }
            else if(category.data_type=='geophysical_analyzed_winds')
            {
                scope.layers[index_val].file_name= category.selectedTimeSetting.file_name;
                if(scope.layers[index_val].database_query_file_prefix.indexOf("L3")>=0)
                {
                    scope.layers[index_val].file_name=scope.layers[index_val].file_name.replace(scope.layers[index_val].file_name.substring(0,6),category.selectedBandSetting.database_query_file_prefix);
                    scope.layers[index_val].file_name=scope.layers[index_val].file_name.replace(scope.layers[index_val].file_name.substr(scope.layers[index_val].file_name.indexOf("_")+1,3),category.selectedBandSetting.database_query_file_extension);  
                }
                scope.layers[index_val].file_url= category.selectedTimeSetting.file_url.replace(category.selectedTimeSetting.file_url.substr(category.selectedTimeSetting.file_url.lastIndexOf("/L")+1),category.source.urlsuffix+"/");
                var layer_url_mod=category.selectedBandSetting.source.urlprefix+scope.layers[index_val].file_url+scope.layers[index_val].file_name;     
//                scope.layer_url_mod_temp=layer_url_mod;
                   scope.layer_url_mod_temp=category.source.urlprefix+category.selectedTimeSetting.file_url+category.selectedTimeSetting.file_name;

		//console.log("layer_url_mod........."+layer_url_mod);
                min_max_url=  scope.layer_url_mod_temp+"?version=1.3.0&CRS="+scope.selected_projection+"&SRS="+scope.selected_projection+"&service=WMS&request=GetMetadata&item=minmax&BBOX=" + scope.map.getView().calculateExtent(scope.map.getSize())+"&INFO_FORMAT=text/xml&LAYERS="+category.selectedBandSetting.source.params.LAYERS+scope.layers[index_val].source.urlsuffixmodified;       

            }
            else if(category.data_type=="weather_forecast")
            {
                var elevation_index=scope.layers[index_val].source.urlsuffixmodified.indexOf("&ELEVATION");
                if(elevation_index>=0)
                {
                    var elevation_substring=scope.layers[index_val].source.urlsuffixmodified.substring(elevation_index+1);
                    var elevation_last_index=elevation_substring.indexOf("&");
                    var elevation_substring= scope.layers[index_val].source.urlsuffixmodified.substring(elevation_index,elevation_index+elevation_last_index+1);
                    if(elevation_last_index<0)
                    {
                        elevation_substring=scope.layers[index_val].source.urlsuffixmodified.substring(elevation_index);  
                         
                    }
                    min_max_url=scope.layers[index_val].latest_filepath+"?version=1.3.0&CRS="+scope.selected_projection+"&SRS="+scope.selected_projection+"&service=WMS&request=GetMetadata&item=minmax&BBOX=" + scope.map.getView().calculateExtent(scope.map.getSize())+"&INFO_FORMAT=text/xml&LAYERS="+category.selectedBandSetting.source.params.LAYERS+scope.layers[index_val].source.urlsuffixmodified.replace(elevation_substring,"")+"&ELEVATION="+category.selectedElevationSetting; 
                }
                else
                {
                    min_max_url=scope.layers[index_val].latest_filepath+"?version=1.3.0&CRS="+scope.selected_projection+"&SRS="+scope.selected_projection+"&service=WMS&request=GetMetadata&item=minmax&BBOX=" + scope.map.getView().calculateExtent(scope.map.getSize())+"&INFO_FORMAT=text/xml&LAYERS="+category.selectedBandSetting.source.params.LAYERS+scope.layers[index_val].source.urlsuffixmodified;         
                }
                    
            }
            //console.log("min max url........"+min_max_url);
            $http.get(min_max_url).then(function(response)
            {              
                var min_max_val=response.data;
                   
                scope.min_val_satlayer_start=min_max_val.min;
                scope.max_val_satlayer_start=min_max_val.max;
                ////console.log("min....."+ scope.min_val_satlayer_start);
                ////console.log("max......"+ scope.max_val_satlayer_start);
                    
                //console.log("index val.........."+index_val);
                scope.layer_to_modify = scope.map.getLayers().item(index_val);
                if(operation_type=="band_selection")
                {
                	/*======================Update By Jay Starts On 28JAN2020============================*/
                	 
                     
//                     console.log("scope.first_loop_complete:- ",scope.first_loop_complete);
//                     console.log("scope.slider_status- ",scope.slider_status);
//                     
//                     
//                     
//                     if(!scope.slider_status){
//                     	scope.first_loop_complete=false;
//                     }
                     
                     /*======================Update By Jay Ends On 28JAN2020============================*/
                	
                    if(scope.min_val_satlayer_start=="" && scope.max_val_satlayer_start=="")
                    {
                            
                        scope.layer_to_modify.getSource().updateParams({
                            LAYERS:category.selectedBandSetting.source.params.LAYERS,
                            COLORSCALERANGE:"DEFAULT"            
                        });
                    }
                    else
                    {
                            
                        var original_url_subpart=scope.layers[index_val].source.urlprefix;
                        var original_url_modified="";
                        //console.log("url......"+scope.layer_to_modify.getSource());
                        var original_url="";
                        
                        if(scope.layer_to_modify.getSource() instanceof ol.source.TileWMS)
                        {
                            //alert("tiled");
                            var original_url_all=scope.layer_to_modify.getSource().getUrls();
                            original_url=original_url_all[0];
                        }
                        else
                        {
                            original_url= scope.layer_to_modify.getSource().getUrl();    
                        }
                          
                        if(category.data_type=="geophysical_analyzed_winds")
                        {
                            original_url_modified=scope.layer_url_mod_temp;  
                        }
                        else
                        {
                            original_url_modified=original_url.replace(original_url_subpart,category.selectedBandSetting.source.urlprefix);
                        }
                        //console.log("original_url_modified....................."+original_url_modified);
                        //console.log("urlprefix........."+category.selectedBandSetting.source.urlprefix);
                        scope.layer_to_modify.getSource().setUrl(original_url_modified);                                                             
                        
                        scope.layer_to_modify.getSource().updateParams({
                            LAYERS:category.selectedBandSetting.source.params.LAYERS,
                            COLORSCALERANGE:scope.min_val_satlayer_start+','+scope.max_val_satlayer_start
            
                        });  
                    //console.log("out of the else....");
                    }
                }   
                else if(operation_type=="elevation_selection")
                {
                    if(scope.min_val_satlayer_start=="")
                    {
                        scope.layer_to_modify.getSource().updateParams({              
                            ELEVATION:category.selectedElevationSetting,
                            COLORSCALERANGE:"DEFAULT"            
                        });
                    }
                    else
                    {
                        scope.layer_to_modify.getSource().updateParams({
                            ELEVATION:category.selectedElevationSetting,
                            COLORSCALERANGE:scope.min_val_satlayer_start+','+scope.max_val_satlayer_start
            
                        });         
                    }
                }
                scope.layer_to_modify.getSource().updateParams({
                    STYLES:category.selectedBandSetting.style
                }); 
                /*  if(category.name.indexOf("Sigma")>=0 || category.name.indexOf("BT")>=0)
                    {   
                        scope.layer_to_modify.getSource().updateParams({
                            COLORSCALERANGE:scope.min_val+",65534",
                            BELOWMINCOLOR:'transparent',
                            ABOVEMAXCOLOR:'transparent'
                        }); 
                    }  
                    */
                var layername_previous=scope.layers[index_val].name;
                
                scope.temp_layername_previous=layername_previous;	//Updated And Added By Jay On 13JAN2020
                
                scope.layers[index_val].source.urlprefix=category.selectedBandSetting.source.urlprefix; 
                scope.layers[index_val].source.params.LAYERS=category.selectedBandSetting.source.params.LAYERS;
                scope.layers[index_val].name=category.selectedBandSetting.name;
                scope.layers[index_val].units=category.selectedBandSetting.units;
                scope.layers[index_val].range_start_value= scope.min_val_satlayer_start;
                scope.layers[index_val].range_end_value= scope.max_val_satlayer_start;
                scope.layers[index_val].range_min_value= scope.min_val_satlayer_start;
                scope.layers[index_val].range_max_value= scope.max_val_satlayer_start;
                  
                scope.layers[index_val].list_elevation_arr=category.list_elevation_arr;
                scope.showLegend(scope.layers[index_val],'update',layername_previous);    
                if(category.contour)
                {
                    scope.layers[index_val].name=category.selectedBandSetting.name+"_contour";
                    scope.layers[index_val+1].displayname=scope.layers[index_val+1].displayname.replace(scope.layers[index_val+1].displayname.substring(0,scope.layers[index_val+1].displayname.indexOf(scope.layers[index_val+1].dateval)-1),category.selectedBandSetting.name);
                    obj.updateContourSetting(scope,category);
                }
                if(scope.show_timeseries_flag)
                {
                        
                    scope.timeseries_layers();
                   
                }
                else if(scope.show_timeseries_flag_aws && scope.timeseries_type=="aws")
                {
                    scope.timeseries_aws();
                }
                else if(scope.show_vertical_profile_flag)
                {
                        
                    scope.vertical_profile_layers();
                   
                }
                category.showBandSetting= !(category.showBandSetting);
            });
        }
    }
        
        
    obj.updateSelectedLayerPalette=function(scope,category)
    {
        
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        scope.layer_to_modify = scope.map.getLayers().item(index_val);
        
        if(scope.layer_to_modify.getSource().getParams().STYLES.indexOf("vector")>=0)
        {
            scope.layer_to_modify.getSource().updateParams({
                styles:category.selectedPaletteSetting.replace("boxfill","vector")
            }); 
        }
        else
        {
            scope.layer_to_modify.getSource().updateParams({
                styles:category.selectedPaletteSetting
            }); 
      
        }
        scope.layers[index_val].style=category.selectedPaletteSetting;
        scope.showLegend(scope.layers[index_val],'update');
    }    

    obj.updateSelectedLayerElevation=function(scope,category)
    {
           
        obj.updateSelectedLayerCommon(scope,category,"elevation_selection");
    }  
    
    
    
    
    obj.updateSelectedLayerTime=function(scope,category)
    {
            
        var index_val= scope.findLayerIndexByName(category.name,category.dateval,category.timeval);
        scope.layer_to_modify = scope.map.getLayers().item(index_val); 
           
        scope.layers[index_val].dateval=category.selectedTimeSetting.displayname_gmt.substring(0,category.selectedTimeSetting.name.indexOf(" "));
        scope.layers[index_val].timeval=category.selectedTimeSetting.displayname_gmt.substring(category.selectedTimeSetting.name.indexOf(" ")+1);
           
        var layer_url_mod="";
        if(scope.layers[index_val].source.urlaws)
        {
                         
            category.dateval_gmt=category.selectedTimeSetting.displayname_gmt.substring(0,9);
            category.timeval_gmt=category.selectedTimeSetting.displayname_gmt.substring(10,14);
            var modified_date_time_display=scope.getDisplayName(category.timeval_gmt,category.dateval_gmt,"timezone_change","gmt_to_local","00:00:00");
                
            category.dateval_local=  modified_date_time_display.substring(0,modified_date_time_display.indexOf(" "));
            category.timeval_local=  modified_date_time_display.substring(modified_date_time_display.indexOf(" ")+1);
            category.displayname_gmt=category.aws_parameter.parameter_name+" "+category.dateval_gmt+" "+category.timeval_gmt+" "+scope.selectedStationAws;   
            category.displayname_local=category.aws_parameter.parameter_name+" "+category.dateval_local+" "+category.timeval_local+" "+scope.selectedStationAws;      
                
               
                
            scope.createAndAddAWSLayer(category);
                    
        }
        else
        {
            if(category.data_type!="weather_forecast")
            {
                scope.layers[index_val].file_name= category.selectedTimeSetting.file_name;
                scope.layers[index_val].file_url= category.selectedTimeSetting.file_url;
                  
            }
            if(category.data_type=="satellite")
            {
                layer_url_mod=scope.layers[index_val].source.urlprefix+scope.layers[index_val].dateval.substring(5)+"/"+scope.layers[index_val].dateval.substring(0,5)+"/"+scope.layers[index_val].source.urlfileprefix+scope.layers[index_val].dateval+"_"+scope.layers[index_val].timeval+scope.layers[index_val].source.urlfilesuffix;
                
                /*============Update Starts By Jay start for contour function call===================================*/
                if(category.contour){
                	scope.updateContourSetting_CallFromDateTimeFunc(category);
                }
                /*============Update Ends By Jay start for contour function call===================================*/
            }
            else if(category.data_type=='geophysical_analyzed_winds')
            {
                   
                layer_url_mod=scope.layers[index_val].source.urlprefix+scope.layers[index_val].file_url+scope.layers[index_val].file_name;     
		console.log("layer_url_mod---",layer_url_mod);
               
            }
            else if(category.data_type=="weather_forecast")
            {
                layer_url_mod=scope.layers[index_val].latest_filepath;
		    console.log("layer_url_mod-->",layer_url_mod);
            }
               
              
               
            if(category.source.urlweather_forecast)
            {     
                scope.layer_to_modify.getSource().updateParams({
                    TIME:category.selectedTimeSetting.name
                }); 
            }
            else if(category.source.url_climatology)
            {     
                scope.layer_to_modify.getSource().updateParams({
                    TIME:category.selectedTimeSetting.name
                }); 
            }
            else
            {
                scope.layer_to_modify.getSource().setUrl(layer_url_mod); 
            }
            //  scope.showLegend(scope.layers[index_val],'update');
            category.showTimeSetting=false;

            scope.layers[index_val].dateval_local=  category.selectedTimeSetting.displayname_local.substring(0,category.selectedTimeSetting.displayname_local.indexOf(" "));
            scope.layers[index_val].timeval_local=  category.selectedTimeSetting.displayname_local.substring(category.selectedTimeSetting.displayname_local.indexOf(" ")+1);    
            scope.layers[index_val].dateval=  category.selectedTimeSetting.displayname_gmt.substring(0,category.selectedTimeSetting.displayname_gmt.indexOf(" "));
            scope.layers[index_val].timeval=  category.selectedTimeSetting.displayname_gmt.substring(category.selectedTimeSetting.displayname_gmt.indexOf(" ")+1);
            scope.showLegend(scope.layers[index_val],'update'); 
               
            if(scope.show_timeseries_flag && scope.selected_probe=="timeseries")
            {
                scope.timeseries_layers('not_button_click');   
            }
            else if(scope.show_timeseries_flag && scope.selected_probe=="tephigram")
            {
                scope.tephigram_layers('not_button_click');   
            }
            else if(scope.show_vertical_profile_flag && scope.selected_probe=="vertical_profile")
            {
                scope.vertical_profile_layers('not_button_click');   
            }
                
             
        }
        
        /*============Update Starts By Jay start for contour function call===================================*/
//        if(category.contour!=undefined){
//        	console.log("In update time list func:- ");
//        	console.log(category);
//        	setTimeout(function(){scope.updateContourSetting(category);},0);
//        	category.call_flag_update_layer_function=true;
//        	scope.updateContourSetting(category);
//        }
        /*============Update Ends By Jay start for contour function call===================================*/
        
          
    // obj.updateSelectedLayerBand(scope,category);
    }  
   

    return obj;
    }]);


