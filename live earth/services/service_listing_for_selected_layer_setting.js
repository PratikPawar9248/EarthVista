angular
		.module('listingForSelectedLayerSettingService', [])
		.service(
				"listingForSelectedLayerSetting",
				[
						'$http',
						function($http) {
							var obj = {};
							obj.recurTree = function(scope, tree_node,
									layer_node, param) {

								// ////console.log("TYPE
								// IS......"+layer_node.type);
								// ////console.log("DATA
								// TYPE......"+layer_node.data_type);
								// console.log("tree_node:- ",tree_node);
								// console.log("layer_node:- ",layer_node);
								// console.log("param:- ",param);

								if (tree_node.children) {
									// ////console.log("tree
									// name....."+tree_node.name);
									if (tree_node.children.length > 0) {
										var temp_var = "";
										for (var i = 0; i < tree_node.children.length; i++) {
											temp_var = obj.recurTree(scope,
													tree_node.children[i],
													layer_node, '1');

											if ((temp_var != null)
													&& (temp_var.name != undefined)) {
												// console.log("temp_var........"+temp_var.name);
												scope.temp_array.push(temp_var);
											}
										}
										if (tree_node.root == "yes") {
											return scope.temp_array;
										}
									}
								} else if ((tree_node.source.urlfilesuffix)
										|| (tree_node.source.urlweather_forecast)
										|| (tree_node.source.url_climatology)
										|| (tree_node.source.urlprefix)) {
									// console.log("else if......++++++++++++");
									if (layer_node.source.urlweather_forecast
											&& (tree_node.source.urlweather_forecast == layer_node.source.urlweather_forecast)
											&& (tree_node.sensor == layer_node.sensor)) {
										// console.log("if
										// condition........++++++++");
										return tree_node;

									} else if (layer_node.source.url_climatology) {

										if (tree_node.sensor == layer_node.sensor
												&& (tree_node.satellite == layer_node.satellite)) {
											return tree_node;
										}
									}

									else if (tree_node.sensor == layer_node.sensor
											&& (tree_node.satellite == layer_node.satellite)
											&& tree_node.data_type == layer_node.data_type) {

										if (layer_node.source.urlfilesuffix
												&& (tree_node.source.urlfilesuffix == layer_node.source.urlfilesuffix)
												&& layer_node.source.urlfileprefix
												&& (tree_node.source.urlfileprefix == layer_node.source.urlfileprefix)) {
											return tree_node;
										}

										else if (tree_node.sub_data_type == layer_node.sub_data_type) //
										{
											try {

												if (layer_node.source.urlfilesuffix
														.includes("L1C_SGP")
														|| layer_node.source.urlfilesuffix
																.includes("L1C_ASIA_MER")) {
													tree_node.source.urlprefix = layer_node.source.urlprefix;
												}
											} catch (exception) {
												console.log("exception:- ",
														exception);
											}

											return tree_node;
										}

									}

									else {
										// alert("In Null1");
										return null;
									}

								} else {
									// alert("In Null2");
									return null;
								}

							}

							obj.getBandList = function(scope, category) {

								scope.temp_array = [];

								var band_layers = "";

								if (category.data_type == "satellite"
										|| category.data_type == "geophysical_analyzed_winds" ||category.data_type == 'ocm_data') {
									band_layers = scope.categories;
								} else if (category.sensor == "Anomaly") {
									band_layers = scope.anomaly;
									// console.log("band
									// layers......."+band_layers.length);
								} else if (category.data_type == "weather_forecast") {
									band_layers = scope.weather_forecast;
									// console.log("band
									// layers......."+band_layers.length);
								} else if (category.data_type == "climatology") {
									band_layers = scope.climatology;
								}

								var i = 0, j = 0;
								var returned_value = [];
								var returned_value_append = [];
								for (i = 0; i < band_layers.length; i++) {
									// console.log("bandname......."+band_layers[i].name);
									// scope.temp_array=[];
									returned_value = [];
									returned_value_append = [];
									if (band_layers[i].children.length > 0) {

										returned_value_append = obj.recurTree(
												scope, band_layers[i],
												category, '0');
										// console.log("category:- ",category);
										// console.log("before if returned
										// value........"+returned_value_append);
										if (returned_value_append == undefined
												|| returned_value_append == null) {
											// ////console.log("returned
											// value........"+returned_value_append);
										} else {
											returned_value = returned_value
													.concat(returned_value_append);
										}
									}
								}

								category.list_band_arr = returned_value;
								// console.log("list band.........",category.list_band_arr);
								var array_indexOf_category = 0;

								for (j = 0; j < category.list_band_arr.length; j++) {
									if (category.list_band_arr[j].name == category.name) {
										array_indexOf_category = j;
									}
								}
								category.selectedBandSetting = category.list_band_arr[array_indexOf_category];
							}

							obj.getTimeListing = function(scope, category,time_arr, param) {
//								 console.log("gettimeListing..........");

								// alert("getTimeListing..........");
//								 console.log("timearr........."+time_arr);
								var file_name = "";
								var file_url = "";

								category.list_time_arr = [];
								category.time = true;
								category.selectedElevationSetting = "";
								category.elevation = false;

								if (time_arr[0] === "") {
									alert(" No File For this date....");
									var only_date = new Date();
									let previousDate = new Date(only_date);
									previousDate
											.setDate(only_date.getDate() - 1);

									// Define an array of month names
									const monthNames = [ "JAN", "FEB", "MAR",
											"APR", "MAY", "JUN", "JUL", "AUG",
											"SEP", "OCT", "NOV", "DEC" ];

									// Format the date as "DD-MMM-YYYY"
									let formattedDate = `${previousDate.getDate().toString().padStart(2, '0')}${monthNames[previousDate.getMonth()]}${previousDate.getFullYear()}`;

									console.log(formattedDate); // Output:
																// "16-Apr-2023"
									var mm = previousDate.getMonth();
									var yy = previousDate.getFullYear();
									var dd = previousDate.getDate();

									if (yy % 4 === 0 && yy % 100 !== 0
											|| yy % 400 === 0) {

										console.log("leep year");
										var array_month = [ 31, 29, 31, 30, 31,
												30, 31, 31, 30, 31, 30, 31 ];

									} else {
										var array_month = [ 31, 28, 31, 30, 31,
												30, 31, 31, 30, 31, 30, 31 ];
										console.log("not leep yy");
									}

									var julianday = dd;
									for (var i = 0; i < mm; i++) {
										julianday = julianday + array_month[i];
									}

									console.log("julianday -->", yy
											+ julianday.toString().padStart(3,
													'0'));
									// console.log("date --->",formattedDate);
									var only_time = "0000";
									var date_local = scope.getDisplayName(
											only_time, formattedDate,
											'timezone_change', "gmt_to_local",
											"00:00:00");

									var date_gmt = only_date + " " + only_time;
									var date_timezone = "";
									if (scope.timezone == scope.timezone_local) {
										date_timezone = date_local;
									} else {
										date_timezone = date_gmt;
									}

									file_name = category.source.urlfileprefix
											+ yy
											+ julianday.toString().padStart(3,'0')
											+ category.source.urlfilesuffix;
									file_url = formattedDate.substring(5, 9)
											+ "/"
											+ formattedDate.substring(0, 5)
											+ "/";

									var temp_var = {
										"file_name" : file_name,
										"file_url" : file_url,
										"name" : date_timezone,
										"displayname_gmt" : date_gmt,
										"displayname_local" : date_local
									};
									// console.log("temp_var ----",temp_var)
									category.list_time_arr.splice(0, 0,
											temp_var);

									category.selectedTimeSetting = temp_var;

									scope.selected_category = category;

								} else {

									for (var j = 0; j < time_arr.length; j++) {

										var only_date = (time_arr[j].substring(
												0, 2)
												+ time_arr[j].substring(3, 6) + time_arr[j]
												.substring(7, 11)).trim();

										var only_time = "";

										if (category.data_type == "geophysical_analyzed_winds" && category.source.urlsuffix=="L4AW") {
											only_time = "0000";

											// file_name=
											// time_arr[j].substring(time_arr[j].indexOf("&")+1);
											// file_url=
											// only_date.substring(5,9)+"/"+only_date.substring(2,5)+"/"+category.source.urlsuffix+"/";
											// console.log("only_Date
											// -->",only_date);
											var parseDate = new Date(Date
													.parse(only_date));

											var mm = parseDate.getMonth();
											var yy = parseDate.getFullYear();
											var dd = parseDate.getDate();

											if (yy % 4 === 0 && yy % 100 !== 0
													|| yy % 400 === 0) {

											//	console.log("leep year");
												var array_month = [ 31, 29, 31,
														30, 31, 30, 31, 31, 30,
														31, 30, 31 ];

											} else {
												var array_month = [ 31, 28, 31,
														30, 31, 30, 31, 31, 30,
														31, 30, 31 ];
											//	console.log("not leep yy");
											}

											var julianday = dd;
											for (var i = 0; i < mm; i++) {
												julianday = julianday
														+ array_month[i];
											}

											// console.log("julianday
											// -->",yy+julianday.toString().padStart(3,'0'));

											file_name = category.source.urlfileprefix
													+ yy
													+ julianday.toString()
															.padStart(3, '0')
													+ category.source.urlfilesuffix;
											file_url = only_date
													.substring(5, 9)
													+ "/"
													+ only_date.substring(0, 5)
													+ "/";
											// console.log("file url
											// -->",file_url);
											// console.log("file
											// name-->",file_name);

										}else if(category.data_type == "geophysical_analyzed_winds" && category.source.urlsuffix=="L4AH"){
//											console.log("in L4AH");
											only_time = time_arr[j].substring(31, 35).trim();
												//	console.log(only_time);
													var parseDate = new Date(Date.parse(only_date));

											var mm = parseDate.getMonth();
											var yy = parseDate.getFullYear();
											var dd = parseDate.getDate();

											if (yy % 4 === 0 && yy % 100 !== 0
													|| yy % 400 === 0) {

//												console.log("leep year");
												var array_month = [ 31, 29, 31,
														30, 31, 30, 31, 31, 30,
														31, 30, 31 ];

											} else {
												var array_month = [ 31, 28, 31,
														30, 31, 30, 31, 31, 30,
														31, 30, 31 ];
//												console.log("not leep yy");
											}

											var julianday = dd;
											for (var i = 0; i < mm; i++) {
												julianday = julianday
														+ array_month[i];
											}

											// console.log("julianday--->",yy+julianday.toString().padStart(3,'0'));

											file_name = category.source.urlfileprefix
													+ yy
													+ julianday.toString().padStart(3, '0')+"_"+only_time
													+ category.source.urlfilesuffix;
											file_url = only_date
													.substring(5, 9)
													+ "/"
													+ only_date.substring(0, 5)
													+ "/";
										}
										else if(category.data_type == "ocm_data")
										{
											console.log(only_time)

											console.log("timeee arrrrr")
											only_time = '0630';
									file_name = category.source.urlfileprefix
													+ only_date 											                
													+ "_"
												        +only_time
												+category.source.urlfilesuffix;
											console.log("file_name-->",file_name)
											file_url = only_date
													.substring(5, 9)
													+ "/"
													+ only_date.substring(0, 5)
													+ "/";
										}
										else {
											only_time = time_arr[j].substring(
													12, 16).trim();
											file_name = category.source.urlfileprefix
													+ only_date
													+ "_"
													+ only_time
													+ category.source.urlfilesuffix;
											file_url = only_date
													.substring(5, 9)
													+ "/"
													+ only_date.substring(0, 5)
													+ "/";

										}

										var date_local = scope.getDisplayName(
												only_time, only_date,
												'timezone_change',
												"gmt_to_local", "00:00:00");

										var date_gmt = only_date + " "
												+ only_time;
										var date_timezone = "";
										if (scope.timezone == scope.timezone_local) {
											date_timezone = date_local;
										} else {
											date_timezone = date_gmt;
										}

										if (j == 0 || j == 1) {
											// console.log("FILE
											// NAME......"+file_name);
											// console.log("FILE
											// URL......"+file_url);
										}

										// }
										var temp_var = {
											"file_name" : file_name,
											"file_url" : file_url,
											"name" : date_timezone,
											"displayname_gmt" : date_gmt,
											"displayname_local" : date_local
										};
										category.list_time_arr.splice(0, 0,
												temp_var);
										if (j == time_arr.length - 1) {
											category.selectedTimeSetting = temp_var;
											// ////console.log("category.selectedTimeSetting........."+category.selectedTimeSetting.displayname_local);
										}
									}
								}
								scope.selected_category = category;
							}

							return obj;
						} ]);
