angular.module('configBackDateLayerService',[])
.service("configBackDateLayer", ['$http',function($http){  
    var obj = {};
      var folder_name= "json_files";
  obj.fetchUserDetails = function(val){ 
       
       if(val==1)
           {
        return $http.get(folder_name+"/basemap_1.json");
           }
       else
           {
       return $http.get(folder_name+"/overlay_1.json");
           }
}

  obj.getSelectedDateTime=function(scope,selected_category)
  {
      //console.log("config back date layer");
          var selected_category_filename= selected_category.source.urlfilesuffix.substring(1,selected_category.source.urlfilesuffix.indexOf("."));
            scope.dateConversion();    
           var selected_category_prefix= selected_category.source.urlfileprefix.substring(0,selected_category.source.urlfileprefix.length-1);
            scope.visitor_time=new Date();
            scope.latest_date= scope.date_main_formatted;
            $http.get(scope.folder_name_backend+"/satellite_data.php?category_filename="+selected_category_filename+"&category_prefix="+selected_category_prefix+"&date_val="+scope.date_main_formatted+"&date_val_prev="+scope.date_main_formatted_prev+"&timezone="+scope.timezone+"&timezone_formal="+(scope.visitor_time.getTimezoneOffset()+60)*60).then(function(response)
            {     
                scope.timeval=response.data;
                // //console.log("timeval....."+scope.timeval);
                var param= 'search_time';
                scope.getTimeListing(selected_category,scope.timeval,param);
                scope.array_time_val=scope.timeval.trim().split(",");
               
                if(scope.array_time_val.length==1)
                {
                    scope.array_time_val.splice(0,0,"No Data");   
                    scope.array_time_val.splice(scope.array_time_val.length-1,1);
                }
                else
                {
                    scope.array_time_val.splice(0,1);
                    scope.array_time_val.splice(0,0,"Select Time");
                       
                }
                scope.selected_time=scope.array_time_val[0];
                if(scope.timezone=="local")
                {
                    for(var i=1;i<scope.array_time_val.length;i++)
                    {
                        var latest_time_hours=parseInt(scope.array_time_val[i].substring(0,2));
                        var latest_time_minutes=parseInt(scope.array_time_val[i].substring(2,4));
                        var newdate=new Date();
                        newdate.setHours(latest_time_hours);
                        newdate.setMinutes(latest_time_minutes-newdate.getTimezoneOffset());
                        var array_time_hours_mod= newdate.getHours(); 
                        var array_time_minutes_mod= newdate.getMinutes(); 
                        if(newdate.getHours()<10)
                        {
                            array_time_hours_mod= "0"+newdate.getHours(); 
                        }
                        if(newdate.getMinutes()<10)
                        {
                            array_time_minutes_mod= "0"+newdate.getMinutes(); 
                        }
                        scope.array_time_val[i]=  array_time_hours_mod+""+array_time_minutes_mod;
                    }
             
                
  }
            });
  }
  

 return obj;
}]);
