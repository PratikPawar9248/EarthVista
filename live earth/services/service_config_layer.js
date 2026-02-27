angular.module('configLayerService',[])
.service("configLayer", ['$http',function($http){  
    var obj = {};
 
 obj.getLatestDateTime=function(scope,selected_category,ev)
 {
 scope.selected_category_filename= selected_category.source.urlfilesuffix.substring(1,selected_category.source.urlfilesuffix.indexOf("."));
            scope.selected_category_prefix= selected_category.source.urlfileprefix.substring(0,selected_category.source.urlfileprefix.length-1);
   
            scope.database_query_file_extension=scope.selected_category_filename;
            scope.database_query_file_prefix=scope.selected_category_prefix;
//            $http.get(scope.folder_name_backend+"/satellite_data_initial.php?file_prefix="+scope.database_query_file_prefix+"&file_extension="+scope.database_query_file_extension+"&param=addlayer").then(function(response)
            $http.get(scope.folder_name_backend+"/satellite_data_initial.php?file_prefix="+scope.database_query_file_prefix+"&file_extension="+scope.database_query_file_extension+"&param=addlayer").then(function(response)
            {          
                scope.latest_date_dialog_time=response.data;
              
                scope.latest_date_dialog_time_arr=scope.latest_date_dialog_time.split(";");
                scope.latest_date_dialog= scope.latest_date_dialog_time_arr[0].trim();
                scope.latest_time_dialog=scope.latest_date_dialog_time_arr[1].trim();
                scope.date_url=  scope.latest_date_dialog.substring(5)+"/"+scope.latest_date_dialog.substring(0,5)+"/";
                scope.date_file_url=scope.latest_date_dialog+"_"+scope.latest_time_dialog;
                var param='change_time';
                scope.getTimeListing(selected_category,scope.latest_date_dialog_time_arr,param);
                scope.nodeSelected(ev,selected_category);
            });
}
 return obj;
}]);

