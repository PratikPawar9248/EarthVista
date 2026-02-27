angular.module('featuresService',[])
.service("features", ['$http',function($http){  
    var obj = {};

obj.setPointProbing=function(scope)
{
      //console.log("INSIDE CONTROLLER AND FUNCTION IS setPointProbing");
        scope.container.style.display="none";  
        scope.point_probing_status = !scope.point_probing_status;
        
        //console.log("scope.point_probing_status:- ",scope.point_probing_status);
        
        /*=============Update by Jay Starts======================*/
        
        if(scope.point_probing_status){
        	document.getElementById("popup-content-bottom").style.display="block";
        	
        	//document.getElementById().style.display="none";
        }else{
        	document.getElementById("popup-content-bottom").style.display="none";
        	document.getElementById("popup-content-bottom").innerHTML="";
        }
        
        /*=============Update by Jay Ends======================*/
        
//        if(scope.selectedTool=='Point Probing')
//        {
//            scope.selectedTool="";
//        }
//        else
//        {
//            scope.selectedTool='Point Probing';        
//        }
}

 obj.toggleGraticule=function(scope)
    {
        if(scope.graticule_status)
        {
            scope.graticule_status=false;
            scope.graticule.setMap(null);
        }
        else
        {
            scope.graticule_status=true;
            scope.graticule.setMap(scope.map);
        }
    }

 obj.showRssFeed = function(scope,ev) {
        if (scope.rss_flag == 0)
        {
            scope.show_status = true;
            scope.feed_content = document.getElementById('rssfeed_content');
//            $http.get(scope.folder_name_backend+"/readrss.php").then(function(response) {
            $http.get(scope.folder_name_backend+"/readrss.php").then(function(response) {
                scope.feed = response.data;
                if(scope.feed_content.innerHTML)
                    scope.feed_content.innerHTML="";
                for (var i = 0; i < scope.feed.features.length; i++)
                {
                    var feature = scope.feed.features[i].properties;
                    scope.feed_content.innerHTML += "<u><b><a href='" + feature.link + "' target='_blank'>" + feature.title + "</a></u></b><p>" + feature.description + "</p><p>" + feature.date + "</p>";
                    
//                    console.log("link:- ",i,"<u><b><a href='" + feature.link + "' target='_blank'>" + feature.title + "</a></u></b><p>" + feature.description + "</p><p>" + feature.date + "</p>");
//                    console.log("feature.link:- ",i,feature.link);
//                    console.log("feature.title:- ",i,feature.title);
//                    console.log("feature.description:- ",i,feature.description);
//                    console.log("feature.date:- ",i,feature.date);
                    
                }

            });
            
            scope.showRss(ev);
            
            //scope.rss_flag = 1;
        }
        else
        {
            scope.show_status=false;
            scope.rss_flag = 0;
        }
    }
    
 obj.getLocation = function(scope)
 {
	if(!scope.location_status)
	{
		scope.location_status=true;
		var location = document.createElement('div');
        	location.id="current_location";
        	document.getElementsByTagName('body')[0].appendChild(location);
        	location.innerHTML = "<img src='img/marker-blue.png'></img>";
 		
		if (navigator.geolocation) {
        	    navigator.geolocation.getCurrentPosition(function(position) {
			var coords = ol.proj.transform([position.coords.longitude,position.coords.latitude],"EPSG:4326", "EPSG:3857");
        	        scope.map.getView().setCenter(coords);
        	        scope.map.getView().setZoom(7);
			scope.current_location = new ol.Overlay({
        	        	element: location
        	    	});
			scope.map.addOverlay(scope.current_location);
			scope.current_location.setPosition(coords);
        	    });
        	} else {
		    alert("Geolocation is not supported by this browser.");
        	}
	}
	else
	{
		scope.location_status=false;
		scope.map.removeOverlay(scope.current_location);
		obj.resetZoom(scope);
	}
 }

 obj.zoomToLocation=function(scope,location_object)
    {  
        //console.log("INSIDE CONTROLLER AND FUNCTION IS zoomToLocation"); 
        var lat_val=parseFloat(location_object.lat);
        var lon_val=parseFloat(location_object.lon);
        var location_modified=ol.proj.transform([lon_val,lat_val], 'EPSG:4326', scope.selected_projection);
        scope.locationMarker='location_markers_on';
 
       var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(location_modified),
            name:'icon',
            display_name:location_object.display_name,
            featureProjection: scope.selected_projection
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                src: scope.folder_name_img+'/marker-blue.png'
            }))
        });

        iconFeature.setStyle(iconStyle);
        scope.vectorSource.addFeature(iconFeature);                 
    }

    obj.resetZoom=function(scope)
    {
        //console.log("INSIDE CONTROLLER AND FUNCTION IS resetZoom");
        scope.reset_zoom_status=!scope.reset_zoom_status;
        scope.map.getView().setCenter([scope.map_center_lon,scope.map_center_lat]);
        scope.map.getView().setZoom(scope.map_zoom_level);
    }
    
        obj.updateLocationSetting=function(scope)
    {
    
  //      $http.get("/geo_vis_72_80/nominatim/search.php?q="+scope.selectedLocation+"&format=json")
	  $http.get("https://nominatim.openstreetmap.org/search?q="+scope.selectedLocation+"&format=json")
        .then(function(response) {
            scope.locationData=response.data;
           // alert("location data......."+scope.locationData);
//               alert("location......");
//               return obj.locationData;
        });
   
   
    }



    obj.zoomToLocationDialog=function(scope,entry)
    {
        scope.closeSearch();
        scope.zoomToLocation(entry);   
    }
    

 /*   obj.getLocation = function(){
        //console.log("INSIDE CONTROLLER AND FUNCTION IS getLocation");
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                scope.map.getView().setCenter(ol.proj.transform([position.coords.longitude, position.coords.latitude], "EPSG:4326", "EPSG:3857"));
                scope.map.getView().setZoom(7);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }
 */

 return obj;
}]);


