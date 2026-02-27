angular.module('measureService',[])
.service("measure", ['$http',function(){  
    var obj = {};

obj.formatLength = function(scope,line) {
        
        //console.log("INSIDE CONTROLLER AND FUNCTION IS formatLength");
        var length;
        {
            var wgs84Sphere = new ol.Sphere(6378137);
            var coordinates = line.getCoordinates();
         
            length = 0;
            var sourceProj = scope.map.getView().getProjection();
            for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
            }
        //  length = Math.round(line.getLength() * 100) / 100;
        }
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
        }
        return output;
    }
    
    obj.formatArea = function(scope,polygon) {
        
        //console.log("INSIDE CONTROLLER AND FUNCTION IS formatArea");
        var area;
        {
            var wgs84Sphere = new ol.Sphere(6378137);
            var sourceProj = scope.map.getView().getProjection();
            var geom = (polygon.clone().transform(
                sourceProj,'EPSG:4326'));
            var coordinates = geom.getLinearRing(0).getCoordinates();
            area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        //   area = polygon.getArea();
        }
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
        }
        return output;
    }

  obj.pointerMoveHandler = function(scope,evt) {
        ////console.log("INSIDE CONTROLLER AND FUNCTION IS pointerMoveHandler");
        if (evt.dragging) {
            return;
        }

        if(scope.measure_distance_status==false && scope.measure_area_status==false)
        {
            scope.elements= document.getElementsByClassName('tooltip-one tooltip-measure tooltip-help');
    
            var j=0;
            for(j=0;j<scope.elements.length;j++)
            {
                scope.elements[j].style.display='none'; 
            }    
        }
        else
        {
            scope.helpMsg = 'Click to start drawing';
            if (scope.sketch) {
                var geom = (scope.sketch.getGeometry());
                if (geom instanceof ol.geom.Polygon) {
                    scope.helpMsg = scope.continuePolygonMsg;
                     
                }
                else if (geom instanceof ol.geom.LineString) {
                    scope.helpMsg = scope.continueLineMsg;
                     
                }
            }
     
            obj.createMeasureTooltip(scope);
            obj.createHelpTooltip(scope);
            scope.helpTooltipElement.innerHTML = scope.helpMsg;
            scope.helpTooltip.setPosition(evt.coordinate);
        }   
    }
 
 
  obj.createHelpTooltip=function(scope) {
        //console.log("INSIDE CONTROLLER AND FUNCTION IS createHelpTooltip");
        if (scope.helpTooltipElement) {
            scope.helpTooltipElement.parentNode.removeChild(scope.helpTooltipElement);
        }
        scope.helpTooltipElement = document.createElement('div');
        scope.helpTooltipElement.className = 'tooltip-one tooltip-measure tooltip-help';
        scope.helpTooltip = new ol.Overlay({
            element: scope.helpTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
       
        scope.map.addOverlay(scope.helpTooltip);
    }

    obj.createMeasureTooltip=function(scope) {
        //console.log("INSIDE CONTROLLER AND FUNCTION IS createMeasureTooltip");
        if (scope.measureTooltipElement) {
            scope.measureTooltipElement.parentNode.removeChild(scope.measureTooltipElement);
        }
        scope.measureTooltipElement = document.createElement('div');
        scope.measureTooltipElement.className = 'tooltip-one tooltip-measure';
        scope.measureTooltip = new ol.Overlay({
            element: scope.measureTooltipElement,
            offset: [0, -15],
            positioning: 'center-left'
        });
        scope.map.addOverlay(scope.measureTooltip);
    }
    
   

obj.addInteraction=function(scope,measurement_type) {
     
        var classname= '';
        if(measurement_type=='Area')
        {
            scope.measure_area_status=!(scope.measure_area_status);  
            classname= 'tooltip-static-polygon';
        }
        else if(measurement_type=='Distance')
        {
            scope.measure_distance_status=!(scope.measure_distance_status);
            classname= 'tooltip-static-line';
        }
         
        var flag = false;
        var geom_type="";
        if((measurement_type=='Area' && !scope.measure_area_status) || (measurement_type=='Distance' && !scope.measure_distance_status))
        {
            flag=true; 
            //  scope.map.removeOverlay(scope.helpTooltip);
            if(measurement_type=='Area')
            {
                geom_type='Polygon';
            }
            else
            {
                geom_type='LineString';
            }
        }
        scope.selectedMeasurement=measurement_type; 
      
        if(flag)
        {
         
            scope.map.removeInteraction(scope.draw);
            var iter= scope.vector_one.getSource().getFeatures();
            var i=0;
            for(i=0;i<iter.length;i++)
            {
               
                if(iter[i].getGeometry().getType()==geom_type)
                {
                    scope.vector_one.getSource().removeFeature(iter[i]);
                }    
            }
       
            scope.elements= document.getElementsByClassName(classname);
          
            var j=0;
            for(j=0;j<scope.elements.length;j++)
            {
                scope.elements[j].style.display='none'; 
            } 
              
            scope.elements= document.getElementsByClassName('tooltip-one tooltip-measure tooltip-help');
          
            j=0;
            for(j=0;j<scope.elements.length;j++)
            {
                scope.elements[j].style.display='none'; 
            } 
        }
        else
        {
           
            scope.map.removeInteraction(scope.draw);
            scope.type = (measurement_type == 'Area' ? 'Polygon' : 'LineString');
            scope.draw = new ol.interaction.Draw({
                source: scope.source,
                type:  (scope.type),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            scope.map.addInteraction(scope.draw);
           
            scope.draw.on('drawstart',
                function(evt) {
                    scope.sketch = evt.feature;
                   
                    scope.tooltipCoord = evt.coordinate;
                    scope.listener = scope.sketch.getGeometry().on('change', function(evt) {
                        scope.geom = evt.target;
                        var output;
                        if (scope.geom instanceof ol.geom.Polygon) {
                            output = obj.formatArea(scope,scope.geom);
                            scope.tooltipCoord = scope.geom.getInteriorPoint().getCoordinates();
                        } else if (scope.geom instanceof ol.geom.LineString) {
                            output = obj.formatLength(scope,scope.geom);
                            scope.tooltipCoord = scope.geom.getLastCoordinate();
                        }         
                        scope.measureTooltipElement.innerHTML = output;
                        scope.measureTooltip.setPosition(scope.tooltipCoord);
                    });
                }, this);

            scope.draw.on('drawend',
                function() {
                    if (scope.geom instanceof ol.geom.Polygon) {
                        scope.measureTooltipElement.className = 'tooltip-one tooltip-static-polygon';
                    }
                    else
                    {
                        scope.measureTooltipElement.className = 'tooltip-one tooltip-static-line';       
                    }
                    scope.measureTooltip.setOffset([0, -7]);
                    scope.measureTooltip.setOfsketch = null; 
                    scope.measureTooltipElement = null;
                    obj.createMeasureTooltip(scope);
                    ol.Observable.unByKey(scope.listener);
                }, this);
        }    
    }
    

 return obj;
}]);


