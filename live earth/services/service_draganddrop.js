angular.module('dragAndDropService',[])
    .service("dragAndDrop", ['$http',function(){  
        var obj = {};

            obj.getDragAndDropVariables = function(scope){ 
       
            scope. defaultStyle = {
                'Point': new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(255,255,0,0.5)'
                        }),
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: '#ff0',
                            width: 1
                        })
                    })
                }),
                'LineString': new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 3
                    })
                }),
                'Polygon': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0,255,255,0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#0ff',
                        width: 1
                    })
                }),
                'MultiPoint': new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(255,0,255,0.5)'
                        }),
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: '#f0f',
                            width: 1
                        })
                    })
                }),
                'MultiLineString': new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#0f0',
                        width: 3
                    })
                }),
                'MultiPolygon': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0,0,255,0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#00f',
                        width: 1
                    })
                })
            };

           

           scope.dragAndDropInteraction = new ol.interaction.DragAndDrop({
       
                formatConstructors: [
                ol.format.GPX,
                ol.format.GeoJSON,
                ol.format.IGC,
                ol.format.KML,
                ol.format.TopoJSON
                ]
            });
            }
            
             obj.styleFunction = function(scope,feature, resolution) {
                var featureStyleFunction = feature.getStyleFunction();
                if (featureStyleFunction) {
                    return featureStyleFunction.call(feature, resolution);
                } else {
                    return scope.defaultStyle[feature.getGeometry().getType()];
                }
            };
            
            
        return obj;
    }]);

 