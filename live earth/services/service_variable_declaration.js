angular.module('variableDeclarationService',[])
    .service("variableDeclaration", ['$http',function(){  
        var obj = {};

        obj.getVariableDeclaration = function(scope){ 
       
//            scope.slider_button_text= "Change";
        	scope.slider_button_text= "Start";	//Updated By Jay On 10JAn2020
            scope.slider_status= false;
          
            scope.tabs  = [
            {
                title: 'Intensity', 
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'	//Updated By Jay On 08JAN2020

            //content: "/scorpio/Images/Intensity_Latest.jpg"
            },

            {
                title: 'Surge',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'	//Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/ElevationSurge_Latest.gif"
            },

            {
                title: 'Center',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'	//Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'Track',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'Landfall',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'Inundation',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'Cyclone Centric Images',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'Ship Avoidance Region',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            },

	    {
                title: 'CycloGenesis',
//                content: '/img/cyclone.png'
                content: '/img/cyclone.png'     //Updated By Jay On 08JAN2020
            //content: "/scorpio/Images/cyclone_centric_insat3d.jpg"
            }
            
            ];
            scope.testurlone="/sites/default/files/images/individual-gallery/insat3d/4.jpg";
            scope.testurltwo="/img/cyclone.png";
       
            scope.thredds_path="/live_data/wms/liveNew/";
            scope.live_storage_path="/live/";
            //alert("controller.....");
            scope.frameRateAnimation=60;
            scope.animate_layer_arr=[];
            //scope.count_canvas=0;
            scope.selectedSatelliteObject="";  
            scope.listVisibility=false;
            scope.showCalendar=false;
            scope.show_timeseries_flag=false;
            scope.show_tephigram_flag=false;	//Updated and Added by Jay
            scope.show_vprofile_flag=false;	//Updated and Added by Jay
//            scope.show_vprofile_old_flag=false;	//Updated and Added by Jay
            scope.show_dropdown_list=true;
            scope.show_back_date_setting=false;
            scope.add_new_layer=true;
            scope.continuePolygonMsg = 'Click to continue drawing the polygon';
            scope.continueLineMsg = 'Click to continue drawing the line';
            scope.current_selected_tab=0;
            scope.overlay_sub=[];
            scope.showBaseSelection=false;
            scope.showOverlaySelection=false;
            scope.divBase='img/double-chevron-up.svg';
            scope.show_layerlist_timeseries=false;
            scope.selectedLocation='';
            scope.selectedDimension="3D";
            scope.selected_projection="EPSG:3857";
            scope.animation_control_status="img/animation/if_play_alt_118620.svg";
            /*     if(document.getElementById('hidden_url').value=='india')
                    {
            scope.animation_control_status="img/animation/if_play_alt_118620.svg";
                    }
                    else
                        {
                 scope.animation_control_status="../img/animation/if_play_alt_118620.svg";            
                        }
*/
            // scope.list_measure= ['Length','Area']; 
            // scope.selectedItem = scope.list_measure[0]; 
            scope.list_tools= ['Select Tool','Point Probing','Timeseries']; 
            scope.temp_one= scope.list_tools[0];
            scope.selectedPaletteSettingNew=scope.list_tools[0];
            scope.m_names = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");    
            scope.selectedTool = "Select Tool";
            scope.selectedLayer = "Select Layer";
            scope.selectedNoLayer = "No Layer";
            scope.selectedLayerName = "Select Layer";
            scope.selectedLayerDate = "Select Layer";
            scope.selectedLayerTime = "Select Layer";
            scope.selectedLayerUrlPrefix = "Select Layer";
            scope.selectedLayerUrlFilePrefix = "Select Layer";
            scope.selectedLayerUrlFileSuffix = "Select Layer";
            scope.selectedLayerAggregationUrl = "Select Layer";
            scope.timeseries_category=[];
            scope.timeseries_data=[];
            scope.arrayDateAnimation=[];
            scope.sat_opacity=0.7;
            scope.array_gmt_val = ['Select gmt'];
            scope.layer_list_all_displayed=[];
            scope.layer_list_all_displayed_layername=[];
            scope.layer_list_all_displayed_dateval=[];
            scope.layer_list_all_displayed_timeval=[];
            scope.layer_list_all_displayed_urlprefix=[];
            scope.layer_list_all_displayed_urlfileprefix=[];
            scope.layer_list_all_displayed_urlfilesuffix=[];
            scope.layer_list_all_displayed_urlaggregation=[];
            scope.layer_list_all_displayed_layers=[];
            scope.layer_list_all_full_name=[];
            scope.selectedStationAws = "";
            scope.selectedCategoryNameAws = "";
            scope.gmt = "";
            scope.index = "";
            scope.time=" ";
            scope.date=" ";
            scope.date_gmt=" ";
            scope.layer_list_all_displayed_onlyname=[];
            scope.layer_list_all_displayed_two_arr=[];
    
            scope.selectedLayerOnlyName = "Select Layer";
            scope.selectedLayerOnlyNamePrev = "Select Layer";
            scope.selectedLayerFullOnlyName = "Select Layer";
            scope.selectedLayerOne = "Select Layer One";
            scope.selectedLayerTwo = "Select Layer Two";
            scope.selectedTimeValues="Select Time";
            scope.animation_layer_index=-1;
            scope.selectedRangeEnd = "";
            scope.selectedRangeStart = "";
            scope.layers_temp=[];
            scope.date_main=new Date(); 
            scope.date_start_tool=new Date(); 
            scope.date_end_tool=new Date(); 
            scope.date_selected_tool=new Date(); 
            scope.selected_time_start="Select Time";
            scope.selected_time_end="Select Time";
            scope.array_time_start_val=[];
            scope.array_time_start_val[0]="Select Time";
            scope.array_time_end_val=[];
            scope.array_time_end_val[0]="Select Time";
            scope.sync_value="Most Recent";
            scope.toggle_calendar=true;
            scope.database_query_file_extension='L1C_SGP';
            scope.database_query_file_prefix='3DIMG';   
            scope.timezone="local";
            scope.timezone_local="local";
            scope.timezone_gmt="gmt";
             
            scope.layers_overlay_first=[];
            scope.layers =[];
            scope.layers_overlay=[]; 
           
            scope.message_grid = "Data Catalog";
            scope.message_list = "Data Subcategories";

            scope.tab_label="Satellite";
            scope.test_val="Tree";
            scope.windlabel = "";
            scope.firesmokelabel = "";
            scope.heavyrainlabel = "";
            scope.cloudburstlabel = "";
            scope.ripcurrentlabel = "";
            scope.heatcoldwavelabel = "";
            scope.soilmoisturelabel = "";
            scope.snowlabel = "";
    
            scope.measure_distance_status=false;
            scope.measure_area_status=false;
            scope.graticule_status=false;
            scope.reset_zoom_status=false;
            scope.point_probing_status=false;
            scope.timeseries_status=false;	//Updated and added by Jay
            scope.tphigram_status=false;	//Updated and added by Jay
            scope.vprofile_status=false;	//Updated and added by Jay
            scope.vprofile_old_status=false;	//Updated and added by Jay
            scope.contours_status=false;	//Updated and added by Jay
            scope.region_growing_status=false;	//Updated and added by Jay
            scope.temp_region_growing_value=20;	//Updated and added by Jay
            scope.selectedLayerTimeseries_prev;	//Updated and added by Jay
            
            scope.plevel_radio_selected={};	//Updated and added by Jay
            scope.plevel_radio_selected.value="Multiple Plevel";	//Updated and added by Jay
            scope.plevel_max={};	//Updated and added by Jay
            scope.plevel_min={};	//Updated and added by Jay
            scope.plevel={};	//Updated and added by Jay
            
            scope.plevel_max_bef={};	//Updated and added by Jay
            scope.plevel_min_bef={};	//Updated and added by Jay
            scope.plevel_bef={};	//Updated and added by Jay
            
            scope.elevationFlag=false;	//Updated and added by Jay
            scope.global_dygraph_temp_data;	//Updated and added by Jay
            scope.elevation_radio=false;	//Updated and added by Jay
            scope.snd_radio=false;	//Updated and added by Jay
            scope.snd_timeseries_selected="Timeseries";	//Updated and added by Jay
            scope.sndTimeseriesSelected={};	//Updated and added by Jay
            scope.sndTimeseriesSelected.value="Timeseries";	//Updated and added by Jay
            scope.plevels_options=["Multiple Plevel","Single Plevel"];	//Updated and added by Jay
            scope.timeseries_options=["Timeseries","Profile Timeseries"];	//Updated and added by Jay
            
            //scope.analysis={'timeseries': scope.timeseries_status, 'tephigram': scope.tphigram_status, 'vprofile': scope.vprofile_status};	//Updated and Added by Jay 
            
            scope.graticule_status=false;
            scope.location_status=false;
            scope.current_location;

            scope.list_image_setting_arr=[{
                'name':'Range',
                'displayname':'Range & Contours'
            }]; 
    
     
            scope.list_data_range_arr=[{
                'name':'From data',
                'displayname':'From data'
            },{
                'name':'Default Range',
                'displayname':'Default Range'
            }];

            scope.band_list_arr=[];
   
            scope.max_val_satlayer_start="";
            scope.max_val_satlayer_end="";
            scope.max_val_satlayer_start_str="";
            scope.max_val_satlayer_end_str="";
            // scope.swipe = document.getElementById('swipe');
            // scope.spy = document.getElementById('map');
            scope.cust_sat_layer="";
            scope.cust_sat_layer_prev="";

            scope.showPaletteSelection=false;
            scope.showRangeSelection=false;
            scope.showContourSelection=false;
            scope.satContourInterval=40;
            scope.data_type="satellite";
            scope.visitor_time=new Date();
            //console.log("variable declaration");
            //scope.url_folder_name=document.getElementById("hidden_url").value;
            //console.log("folder name......."+document.getElementById("hidden_url").value);
            // scope.url_variable=some_variable;
            if(typeof some_variable == 'undefined')
            {
                scope.url_variable=document.getElementById("hidden_url").value;  
            }
            else
            {
                scope.url_variable=some_variable;
            }
            if(scope.url_variable.indexOf('india')<0)
            {
                scope.folder_name_common= scope.url_variable; 
            }
            else
            {
                scope.folder_name_common= ".";
            }
//            console.log("folder common......."+scope.folder_name_common);

            scope.folder_name_specific= "json_files/";
            scope.folder_name= "json_files";
            scope.folder_name_img= "img";
            scope.folder_name_templates="templates";
            scope.folder_name_backend= "backend";  
                
                
            scope.classval='fa fa-angle-double-right';
            scope.togglemenu="Click on icon to collapse";
            scope.divbase_class='fa fa-angle-double-down';
            scope.divoverlay_class='fa fa-angle-double-down';  
            
            
            scope.continuePolygonMsg = 'Click to continue drawing the polygon';
            scope.continueLineMsg = 'Click to continue drawing the line';
            scope.helpMsg = '';
            
             
            scope.count_overlaylayer=1;
            scope.count_layer=1;
            scope.starting_layer_index=1;
            scope.count_baselayer=1;
            scope.starting_baselayer_index=2;
            scope.layer_url_final="";
    
            scope.layers_index=1;
            scope.synch_status=false;
            scope.synchId="";
            scope.synch_tooltip="Click for data synch";
            
            scope.point_info=[];
        
 
            scope.layers_startarray=[];
    
            scope.checked = 1;
            scope.mouseover_flag = 0;
            scope.classval1 = "fa fa-angle-double-right";
           
        }

        return obj;
    }]);

