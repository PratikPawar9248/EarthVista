angular.module('jsonResponseService',[])
    .service("jsonResponse", ['$http',function($http,$scope){  
        var obj = {};
  
        obj.getJsonResponse = function(scope){ 
       
            $http.get(scope.folder_name_common+"/view_config.json")
            .then(function(response) {
                scope.view_configuration = response.data; 
                scope.map_center_lat= scope.view_configuration[0].params.lat;
                scope.map_center_lon= scope.view_configuration[0].params.lon;
                scope.map_zoom_level= scope.view_configuration[1].params.level;
               
            });


         $http.get(scope.folder_name+"/common.json")
            .then(function(response) {
                var common_variables = response.data;
                scope.tephi_url=common_variables[0].url;
                scope.vprofile_url=common_variables[1].url;
            });
            
            

            $http.get(scope.folder_name+"/list_palette.json")
            .then(function(response) {
                scope.list_palette_arr=response.data;
                scope.list_palette_arr_geophysical=response.data;
                scope.selectedPaletteTest= scope.list_palette_arr[0];
            });
    
   

    
    
            $http.get(scope.folder_name+"/awsparameters.json")
            .then(function(response) {
                scope.aws_parameters = response.data;
            });
    
          
            $http.get(scope.folder_name+"/basemap.json")
            .then(function(response) {
                scope.base_layers = response.data;
                if(document.getElementById('hidden_url').value=="vayu")
                {
                    scope.base_selected_layer= scope.base_layers[2].name;    
                }
		else if(scope.folder_name_common=="posoco")
                {
                    scope.base_selected_layer= scope.base_layers[3].name;    
                }
                else
                {
                    scope.base_selected_layer= scope.base_layers[0].name;
                }
            });

	    if(scope.folder_name_common=="posoco"){
		    $http.get(scope.folder_name_common+"/overlay_1.json")
		    .then(function(response) {
		        scope.overlay_layers = response.data;
		        scope.overlay_selected_layer= scope.overlay_layers[0].name;
		    });
	    }else{
		    $http.get(scope.folder_name+"/overlay_1.json")
		    .then(function(response) {
		        scope.overlay_layers = response.data;
		        scope.overlay_selected_layer= scope.overlay_layers[0].name;
		    });
	    }    
    
 
            $http.get(scope.folder_name+"/listing_tree_1.json")
            .then(function(response) {
                scope.categories = response.data;
            });
    
            $http.get(scope.folder_name+"/tools.json")
            .then(function(response) {
                scope.tools_list = response.data;
            });
  
            $http.get(scope.folder_name+"/tempcategory.json")
            .then(function(response) {
                scope.temp_category = response.data;
                scope.temp_category_one = response.data;
            });
    
            $http.get(scope.folder_name+"/ground_observations.json")
            .then(function(response) {
                scope.ground_observations = response.data;
            });
            $http.get(scope.folder_name+"/weather_forecast.json")
            .then(function(response) {
                scope.weather_forecast = response.data;
               
            });
           
             $http.get(scope.folder_name+"/anomaly.json")
            .then(function(response) {
                scope.anomaly = response.data;
               
              
            });
            $http.get(scope.folder_name+"/climatology.json")
            .then(function(response) {
                scope.climatology = response.data;
            });
    
            $http.get(scope.folder_name+"/tempcategory_aws.json")
            .then(function(response) {
                scope.temp_category_aws = response.data;
            });
    
    
    
  // alert("folder..........."+scope.folder_name_common);
            $http.get(scope.folder_name_common + "/iconpanel.json")
            .then(function(response) {
                scope.icon_list = response.data;
                for(var i=0;i<scope.icon_list.length;i++)
                {
               
                    if(scope.icon_list[i].name=='snow')
                    {
                        scope.snow_object = scope.icon_list[i];
                    }
                }
            });
    
        }

        return obj;
    }]);
