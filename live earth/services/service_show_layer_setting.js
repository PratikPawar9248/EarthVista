angular.module('showLayerSettingService',[])
    .service("showLayerSetting", ['$http',function(){  
        var obj = {};
  
        obj.updateSelectedImageSetting=function(scope,image_setting)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS updateSelectedImageSetting");
            scope.selectedImageSetting=image_setting;
            if(image_setting=='Palette')
            {
                scope.showPaletteSelection=true;
        
            } 
            else if(image_setting=='Range')
            {
                scope.showImageSelection=true;
            } 
            else if(image_setting=='Contour')
            {
                scope.showContourSelection=true;
            }    
        }
  
  
        obj.showImageSettingFun=function(category)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS showImageSettingFun");
            category.showImageSetting= !(category.showImageSetting);
            //category.showLegendVar = false;
            if(category.showImageSetting)
            {
                category.div_setting_class='fa fa-angle-double-up';
            }
            else
            {
                category.div_setting_class='fa fa-angle-double-down';
            }
        
        }
      
        obj.showPaletteSelectionFun=function(category)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS showPaletteSelectionFun");
            category.showPaletteSetting= !(category.showPaletteSetting);
            if(category.showPaletteSetting)
            {
                category.paletteButtonLabel="Hide";
            }
            else
            {
                category.paletteButtonLabel="Palette";
            }
        }
    
        obj.showBandSelectionFun=function(category)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS showBandSelectionFun");
            category.showBandSetting= !(category.showBandSetting);
        }
        obj.showElevationSelectionFun=function(category)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS showElevationSelectionFun");
            category.showElevationSetting= !(category.showElevationSetting);
        }
    
    
        obj.showTimeSelectionFun=function(category)
        {
            // //console.log("INSIDE CONTROLLER & FUNCTION IS showTimeSelectionFun");
            category.showTimeSetting= !(category.showTimeSetting);
        } 
    
        obj.showBackDateSelectionFun=function(scope,category)
        {

            scope.show_back_date_setting=!scope.show_back_date_setting;
            if(scope.show_back_date_setting)
            {
                document.getElementById('calendar_id').style.display='block'; 
            }
            else
            {
                document.getElementById('calendar_id').style.display='none';   
            }

            scope.selectedObject=  category;
           
        }

        return obj;
    }]);
